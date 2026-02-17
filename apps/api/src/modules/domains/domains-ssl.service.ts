import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SslStatus } from '@prisma/client';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class DomainsSslService {
  private readonly logger = new Logger(DomainsSslService.name);
  private isProvisioning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Provision SSL certificate for a verified domain.
   * Creates nginx server block and runs certbot.
   */
  async provisionSsl(
    domainId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const domain = await this.prisma.storeDomain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      return { success: false, error: 'Domain not found' };
    }

    if (domain.sslStatus === SslStatus.ACTIVE) {
      this.logger.log(`SSL already active for ${domain.hostname}`);
      return { success: true };
    }

    if (domain.sslStatus === SslStatus.PROVISIONING) {
      this.logger.warn(
        `SSL provisioning already in progress for ${domain.hostname}`,
      );
      return {
        success: false,
        error: 'SSL provisioning already in progress',
      };
    }

    // Simple mutex: certbot cannot run concurrently
    if (this.isProvisioning) {
      this.logger.warn(
        `Another SSL provisioning is in progress, skipping ${domain.hostname}`,
      );
      return {
        success: false,
        error: 'Another SSL provisioning is in progress. Will retry later.',
      };
    }

    this.isProvisioning = true;

    try {
      // Set status to PROVISIONING
      await this.prisma.storeDomain.update({
        where: { id: domainId },
        data: {
          sslStatus: SslStatus.PROVISIONING,
          sslError: null,
        },
      });

      const scriptPath = this.configService.get<string>(
        'SSL_PROVISION_SCRIPT',
        '/var/www/pixecom/deploy/provision-ssl.sh',
      );

      this.logger.log(`Provisioning SSL for ${domain.hostname}...`);

      const { stdout, stderr } = await execFileAsync(
        scriptPath,
        [domain.hostname],
        {
          timeout: 120_000, // 2 minute timeout
          env: {
            ...process.env,
            SSL_EMAIL:
              this.configService.get<string>('SSL_EMAIL') ||
              'admin@pixelxlab.com',
          },
        },
      );

      this.logger.log(`SSL provision stdout: ${stdout}`);
      if (stderr) {
        this.logger.warn(`SSL provision stderr: ${stderr}`);
      }

      // Parse output for success indicator
      const successMatch = stdout.match(/SSL_SUCCESS:(.+)/);
      if (successMatch) {
        const expiryDateStr = successMatch[1].trim();
        const expiresAt = new Date(expiryDateStr);

        await this.prisma.storeDomain.update({
          where: { id: domainId },
          data: {
            sslStatus: SslStatus.ACTIVE,
            sslProvisionedAt: new Date(),
            sslExpiresAt: expiresAt,
            sslError: null,
          },
        });

        this.logger.log(
          `SSL provisioned successfully for ${domain.hostname}, expires ${expiresAt.toISOString()}`,
        );
        return { success: true };
      } else {
        throw new Error(`Unexpected certbot output: ${stdout}`);
      }
    } catch (error) {
      const errorMessage = error.message || 'SSL provisioning failed';
      this.logger.error(
        `SSL provisioning failed for ${domain.hostname}: ${errorMessage}`,
      );

      await this.prisma.storeDomain.update({
        where: { id: domainId },
        data: {
          sslStatus: SslStatus.FAILED,
          sslError: errorMessage.substring(0, 1000),
        },
      });

      return { success: false, error: errorMessage };
    } finally {
      this.isProvisioning = false;
    }
  }

  /**
   * Remove SSL certificate and nginx config for a domain.
   * Called when a domain is deleted.
   */
  async removeSsl(hostname: string): Promise<void> {
    try {
      const scriptPath = this.configService.get<string>(
        'SSL_REMOVE_SCRIPT',
        '/var/www/pixecom/deploy/remove-ssl.sh',
      );

      const { stdout, stderr } = await execFileAsync(
        scriptPath,
        [hostname],
        { timeout: 30_000 },
      );

      this.logger.log(`SSL removed for ${hostname}: ${stdout}`);
      if (stderr) {
        this.logger.warn(`SSL remove stderr: ${stderr}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to remove SSL for ${hostname}: ${error.message}`,
      );
      // Don't throw — domain deletion should still succeed
    }
  }
}
