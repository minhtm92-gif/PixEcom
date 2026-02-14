import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LegalService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId: string, options: { policyType?: string }) {
    const where: any = { workspaceId };

    if (options.policyType) {
      where.policyType = options.policyType;
    }

    const policies = await this.prisma.legalPolicy.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        storePolicies: {
          select: {
            id: true,
            store: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return policies;
  }

  async create(
    workspaceId: string,
    data: {
      title: string;
      slug: string;
      policyType: string;
      bodyHtml: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.legalPolicy.create({
      data: {
        workspaceId,
        title: data.title,
        slug: data.slug,
        policyType: data.policyType,
        bodyHtml: data.bodyHtml,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findOne(workspaceId: string, policyId: string) {
    const policy = await this.prisma.legalPolicy.findFirst({
      where: { id: policyId, workspaceId },
      include: {
        storePolicies: {
          include: {
            store: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!policy) {
      throw new NotFoundException('Legal policy not found');
    }

    return policy;
  }

  async update(
    workspaceId: string,
    policyId: string,
    data: {
      title?: string;
      slug?: string;
      policyType?: string;
      bodyHtml?: string;
      isActive?: boolean;
    },
  ) {
    await this.ensurePolicyExists(workspaceId, policyId);

    return this.prisma.legalPolicy.update({
      where: { id: policyId },
      data,
    });
  }

  async remove(workspaceId: string, policyId: string) {
    await this.ensurePolicyExists(workspaceId, policyId);

    // Cascade will handle store_policies
    await this.prisma.legalPolicy.delete({
      where: { id: policyId },
    });
  }

  private async ensurePolicyExists(workspaceId: string, policyId: string) {
    const policy = await this.prisma.legalPolicy.findFirst({
      where: { id: policyId, workspaceId },
    });

    if (!policy) {
      throw new NotFoundException('Legal policy not found');
    }

    return policy;
  }
}
