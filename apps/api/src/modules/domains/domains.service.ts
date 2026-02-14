import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainsVerificationService } from './domains-verification.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { DomainStatus, DomainVerificationMethod } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class DomainsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: DomainsVerificationService,
  ) {}

  /**
   * Create a new domain for a store
   */
  async create(storeId: string, workspaceId: string, dto: CreateDomainDto) {
    // Verify store exists and belongs to workspace
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, workspaceId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Check if domain already exists
    const existing = await this.prisma.storeDomain.findFirst({
      where: { storeId, hostname: dto.hostname },
    });

    if (existing) {
      throw new BadRequestException('Domain already exists for this store');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Get expected IP for A record method
    const expectedARecordIp =
      dto.verificationMethod === DomainVerificationMethod.A_RECORD
        ? this.verificationService.getExpectedIp()
        : null;

    // Create domain record
    const domain = await this.prisma.storeDomain.create({
      data: {
        storeId,
        hostname: dto.hostname,
        verificationMethod: dto.verificationMethod,
        verificationToken,
        expectedARecordIp,
        status: DomainStatus.PENDING,
      },
    });

    return {
      ...domain,
      verificationInstructions: this.getVerificationInstructions(domain),
    };
  }

  /**
   * List all domains for a store
   */
  async findAll(storeId: string, workspaceId: string) {
    // Verify store exists and belongs to workspace
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, workspaceId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return this.prisma.storeDomain.findMany({
      where: { storeId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get a single domain by ID
   */
  async findOne(domainId: string, storeId: string, workspaceId: string) {
    // Verify store belongs to workspace
    const store = await this.prisma.store.findFirst({
      where: { id: storeId, workspaceId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const domain = await this.prisma.storeDomain.findFirst({
      where: { id: domainId, storeId },
    });

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    return domain;
  }

  /**
   * Update a domain (set primary, toggle active)
   */
  async update(
    domainId: string,
    storeId: string,
    workspaceId: string,
    dto: UpdateDomainDto,
  ) {
    // Verify domain exists
    await this.findOne(domainId, storeId, workspaceId);

    // If setting as primary, unset other primaries first
    if (dto.isPrimary === true) {
      await this.prisma.storeDomain.updateMany({
        where: { storeId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Update the domain
    return this.prisma.storeDomain.update({
      where: { id: domainId },
      data: dto,
    });
  }

  /**
   * Delete a domain
   */
  async remove(domainId: string, storeId: string, workspaceId: string) {
    // Verify domain exists
    const domain = await this.findOne(domainId, storeId, workspaceId);

    // Prevent deleting primary domain if there are other domains
    if (domain.isPrimary) {
      const otherDomains = await this.prisma.storeDomain.count({
        where: { storeId, id: { not: domainId } },
      });

      if (otherDomains > 0) {
        throw new BadRequestException(
          'Cannot delete primary domain. Set another domain as primary first.',
        );
      }
    }

    await this.prisma.storeDomain.delete({
      where: { id: domainId },
    });
  }

  /**
   * Manually trigger verification for a domain
   */
  async verify(domainId: string, storeId: string, workspaceId: string) {
    const domain = await this.findOne(domainId, storeId, workspaceId);

    // Run verification
    const result = await this.verificationService.verifyDomain(domain);

    // Update domain status
    const updatedDomain = await this.prisma.storeDomain.update({
      where: { id: domainId },
      data: {
        status: result.success ? DomainStatus.VERIFIED : DomainStatus.FAILED,
        verifiedAt: result.success ? new Date() : null,
        lastCheckedAt: new Date(),
        failureReason: result.error || null,
      },
    });

    return {
      ...updatedDomain,
      verificationResult: result,
    };
  }

  /**
   * Get verification instructions for a domain
   */
  private getVerificationInstructions(domain: any) {
    if (domain.verificationMethod === DomainVerificationMethod.TXT) {
      return {
        method: 'TXT',
        instructions: `Add a TXT record to your domain's DNS settings with the following value:`,
        record: {
          type: 'TXT',
          name: '@',
          value: `pixecom-verify=${domain.verificationToken}`,
        },
      };
    } else {
      return {
        method: 'A',
        instructions: `Point your domain's A record to the following IP address:`,
        record: {
          type: 'A',
          name: '@',
          value: domain.expectedARecordIp,
        },
      };
    }
  }
}
