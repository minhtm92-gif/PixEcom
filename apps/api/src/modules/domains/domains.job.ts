import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainsVerificationService } from './domains-verification.service';
import { DomainsSslService } from './domains-ssl.service';
import { DomainStatus, SslStatus } from '@prisma/client';

@Injectable()
export class DomainsJob {
  private readonly logger = new Logger(DomainsJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: DomainsVerificationService,
    private readonly sslService: DomainsSslService,
  ) {}

  /**
   * Check pending domains every 10 minutes
   */
  @Cron('*/10 * * * *', {
    name: 'check-pending-domains',
  })
  async checkPendingDomains() {
    this.logger.log('Starting automatic domain verification check...');

    try {
      // Find all pending domains (limit to 50 at a time)
      const pendingDomains = await this.prisma.storeDomain.findMany({
        where: { status: DomainStatus.PENDING },
        take: 50,
        orderBy: { createdAt: 'asc' },
      });

      if (pendingDomains.length === 0) {
        this.logger.log('No pending domains to verify');
        return;
      }

      this.logger.log(`Found ${pendingDomains.length} pending domains to verify`);

      let verifiedCount = 0;
      let failedCount = 0;

      // Verify each domain
      for (const domain of pendingDomains) {
        try {
          const result = await this.verificationService.verifyDomain(domain);

          await this.prisma.storeDomain.update({
            where: { id: domain.id },
            data: {
              status: result.success
                ? DomainStatus.VERIFIED
                : DomainStatus.FAILED,
              verifiedAt: result.success ? new Date() : null,
              lastCheckedAt: new Date(),
              failureReason: result.error || null,
            },
          });

          if (result.success) {
            verifiedCount++;
            this.logger.log(`✓ Domain ${domain.hostname} VERIFIED`);
            // Trigger SSL provisioning in background
            this.sslService.provisionSsl(domain.id).catch((err) =>
              this.logger.error(
                `Background SSL provisioning failed for ${domain.hostname}: ${err.message}`,
              ),
            );
          } else {
            failedCount++;
            this.logger.warn(
              `✗ Domain ${domain.hostname} FAILED: ${result.error}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error verifying domain ${domain.hostname}: ${error.message}`,
          );
          failedCount++;
        }
      }

      this.logger.log(
        `Domain verification complete. Verified: ${verifiedCount}, Failed: ${failedCount}`,
      );
    } catch (error) {
      this.logger.error(`Domain verification job failed: ${error.message}`);
    }
  }

  /**
   * Re-check failed domains every hour
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'recheck-failed-domains',
  })
  async recheckFailedDomains() {
    this.logger.log('Re-checking failed domains...');

    try {
      // Find failed domains that haven't been checked in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const failedDomains = await this.prisma.storeDomain.findMany({
        where: {
          status: DomainStatus.FAILED,
          OR: [
            { lastCheckedAt: null },
            { lastCheckedAt: { lt: oneHourAgo } },
          ],
        },
        take: 20, // Limit to 20 failed domains per run
        orderBy: { lastCheckedAt: 'asc' },
      });

      if (failedDomains.length === 0) {
        this.logger.log('No failed domains to recheck');
        return;
      }

      this.logger.log(`Rechecking ${failedDomains.length} failed domains`);

      let recoveredCount = 0;

      for (const domain of failedDomains) {
        try {
          const result = await this.verificationService.verifyDomain(domain);

          await this.prisma.storeDomain.update({
            where: { id: domain.id },
            data: {
              status: result.success
                ? DomainStatus.VERIFIED
                : DomainStatus.FAILED,
              verifiedAt: result.success ? new Date() : null,
              lastCheckedAt: new Date(),
              failureReason: result.error || null,
            },
          });

          if (result.success) {
            recoveredCount++;
            this.logger.log(`✓ Domain ${domain.hostname} RECOVERED`);
            // Trigger SSL provisioning in background
            this.sslService.provisionSsl(domain.id).catch((err) =>
              this.logger.error(
                `Background SSL provisioning failed for ${domain.hostname}: ${err.message}`,
              ),
            );
          }
        } catch (error) {
          this.logger.error(
            `Error rechecking domain ${domain.hostname}: ${error.message}`,
          );
        }
      }

      this.logger.log(`Failed domain recheck complete. Recovered: ${recoveredCount}`);
    } catch (error) {
      this.logger.error(`Failed domain recheck job failed: ${error.message}`);
    }
  }

  /**
   * Provision SSL for verified domains that don't have it yet.
   * Runs every 5 minutes, processes up to 5 domains.
   */
  @Cron('*/5 * * * *', {
    name: 'provision-ssl-for-verified-domains',
  })
  async provisionSslForVerifiedDomains() {
    try {
      const domains = await this.prisma.storeDomain.findMany({
        where: {
          status: DomainStatus.VERIFIED,
          isActive: true,
          sslStatus: { in: [SslStatus.NONE, SslStatus.FAILED] },
        },
        take: 5,
        orderBy: { updatedAt: 'asc' },
      });

      if (domains.length === 0) return;

      this.logger.log(
        `Found ${domains.length} verified domains needing SSL provisioning`,
      );

      for (const domain of domains) {
        const result = await this.sslService.provisionSsl(domain.id);
        if (result.success) {
          this.logger.log(`✓ SSL provisioned for ${domain.hostname}`);
        } else {
          this.logger.warn(
            `✗ SSL provisioning failed for ${domain.hostname}: ${result.error}`,
          );
        }
        // Delay between certbot runs to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      this.logger.error(`SSL provisioning job failed: ${error.message}`);
    }
  }
}
