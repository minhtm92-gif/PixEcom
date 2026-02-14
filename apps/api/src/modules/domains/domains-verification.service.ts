import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as dns } from 'dns';
import { DomainStatus, DomainVerificationMethod } from '@prisma/client';

export interface VerificationResult {
  success: boolean;
  error?: string;
}

export interface StoreDomain {
  id: string;
  hostname: string;
  verificationMethod: DomainVerificationMethod;
  verificationToken: string;
  expectedARecordIp: string | null;
}

@Injectable()
export class DomainsVerificationService {
  private readonly logger = new Logger(DomainsVerificationService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Verify a domain using the appropriate verification method
   */
  async verifyDomain(domain: StoreDomain): Promise<VerificationResult> {
    try {
      if (domain.verificationMethod === DomainVerificationMethod.TXT) {
        return await this.verifyTxtRecord(
          domain.hostname,
          domain.verificationToken,
        );
      } else {
        return await this.verifyARecord(
          domain.hostname,
          domain.expectedARecordIp,
        );
      }
    } catch (error) {
      this.logger.error(
        `Verification failed for ${domain.hostname}: ${error.message}`,
      );
      return {
        success: false,
        error: error.message || 'Verification failed',
      };
    }
  }

  /**
   * Verify TXT record contains the expected verification token
   */
  private async verifyTxtRecord(
    hostname: string,
    token: string,
  ): Promise<VerificationResult> {
    try {
      // Resolve TXT records for the domain
      const records = await dns.resolveTxt(hostname);

      // Flatten the records (each record can be an array of strings)
      const flatRecords = records.map((record) => record.join(''));

      // Look for the verification token in the format: pixecom-verify=TOKEN
      const expectedRecord = `pixecom-verify=${token}`;
      const found = flatRecords.some((record) => record === expectedRecord);

      if (found) {
        return { success: true };
      }

      return {
        success: false,
        error: `TXT record not found. Expected: ${expectedRecord}`,
      };
    } catch (error) {
      if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
        return {
          success: false,
          error: 'No TXT records found for this domain',
        };
      }

      throw error;
    }
  }

  /**
   * Verify A record points to the expected IP address
   */
  private async verifyARecord(
    hostname: string,
    expectedIp: string | null,
  ): Promise<VerificationResult> {
    if (!expectedIp) {
      return {
        success: false,
        error: 'No expected IP address configured',
      };
    }

    try {
      // Resolve A records (IPv4) for the domain
      const addresses = await dns.resolve4(hostname);

      // Check if any of the A records match the expected IP
      const found = addresses.includes(expectedIp);

      if (found) {
        return { success: true };
      }

      return {
        success: false,
        error: `A record not found. Expected IP: ${expectedIp}, Found: ${addresses.join(', ')}`,
      };
    } catch (error) {
      if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
        return {
          success: false,
          error: 'No A records found for this domain',
        };
      }

      throw error;
    }
  }

  /**
   * Get the expected IP address for A record verification
   * This can be auto-detected or configured via environment variable
   */
  getExpectedIp(): string {
    const configuredIp = this.configService.get<string>('EXPECTED_DOMAIN_IP');

    // If set to 'auto' or not set, we'd need to detect the server's IP
    // For now, return a placeholder or configured value
    if (!configuredIp || configuredIp === 'auto') {
      // In a real scenario, you'd detect the server's public IP
      // For development, return localhost
      return '127.0.0.1';
    }

    return configuredIp;
  }
}
