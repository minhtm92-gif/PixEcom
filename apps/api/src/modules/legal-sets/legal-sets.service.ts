import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLegalSetDto } from './dto/create-legal-set.dto';
import { UpdateLegalSetDto } from './dto/update-legal-set.dto';
import { DEFAULT_LEGAL_TEMPLATES } from './templates/default-legal-templates';

@Injectable()
export class LegalSetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new legal set with policies
   */
  async create(workspaceId: string, dto: CreateLegalSetDto) {
    // If this is marked as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.legalSet.updateMany({
        where: { workspaceId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const legalSet = await this.prisma.legalSet.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault ?? false,
        policies: dto.policies
          ? {
              create: dto.policies.map((policy, index) => ({
                workspaceId,
                title: policy.title,
                slug: policy.slug,
                policyType: policy.policyType,
                bodyHtml: policy.bodyHtml,
                displayOrder: policy.displayOrder ?? index,
              })),
            }
          : undefined,
      },
      include: {
        policies: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return legalSet;
  }

  /**
   * Create default legal set with all standard policies
   */
  async createDefaultLegalSet(workspaceId: string) {
    // Check if default set already exists
    const existingDefault = await this.prisma.legalSet.findFirst({
      where: { workspaceId, isDefault: true },
    });

    if (existingDefault) {
      throw new BadRequestException('Default legal set already exists for this workspace');
    }

    return this.create(workspaceId, {
      name: 'Default Legal Set',
      description: 'Standard legal policies for e-commerce stores',
      isDefault: true,
      policies: DEFAULT_LEGAL_TEMPLATES.map((template) => ({
        title: template.title,
        slug: template.slug,
        policyType: template.policyType,
        bodyHtml: template.bodyHtml,
        displayOrder: template.displayOrder,
      })),
    });
  }

  /**
   * Get all legal sets for a workspace
   */
  async findAll(workspaceId: string) {
    return this.prisma.legalSet.findMany({
      where: { workspaceId, isActive: true },
      include: {
        policies: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { policies: true, stores: true },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get a specific legal set by ID
   */
  async findOne(workspaceId: string, legalSetId: string) {
    const legalSet = await this.prisma.legalSet.findFirst({
      where: { id: legalSetId, workspaceId },
      include: {
        policies: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!legalSet) {
      throw new NotFoundException('Legal set not found');
    }

    return legalSet;
  }

  /**
   * Get the default legal set for a workspace
   */
  async findDefault(workspaceId: string) {
    const defaultSet = await this.prisma.legalSet.findFirst({
      where: { workspaceId, isDefault: true, isActive: true },
      include: {
        policies: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    // If no default set exists, create one
    if (!defaultSet) {
      return this.createDefaultLegalSet(workspaceId);
    }

    return defaultSet;
  }

  /**
   * Update a legal set
   */
  async update(workspaceId: string, legalSetId: string, dto: UpdateLegalSetDto) {
    await this.ensureLegalSetExists(workspaceId, legalSetId);

    // If this is marked as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.legalSet.updateMany({
        where: { workspaceId, isDefault: true, id: { not: legalSetId } },
        data: { isDefault: false },
      });
    }

    const legalSet = await this.prisma.legalSet.update({
      where: { id: legalSetId },
      data: {
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault,
      },
      include: {
        policies: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return legalSet;
  }

  /**
   * Delete a legal set (soft delete)
   */
  async remove(workspaceId: string, legalSetId: string) {
    const legalSet = await this.ensureLegalSetExists(workspaceId, legalSetId);

    if (legalSet.isDefault) {
      throw new BadRequestException('Cannot delete the default legal set');
    }

    await this.prisma.legalSet.update({
      where: { id: legalSetId },
      data: { isActive: false },
    });

    return { message: 'Legal set deleted successfully' };
  }

  /**
   * Duplicate a legal set
   */
  async duplicate(workspaceId: string, legalSetId: string, newName?: string) {
    const originalSet = await this.findOne(workspaceId, legalSetId);

    const name = newName || `${originalSet.name} (Copy)`;

    return this.create(workspaceId, {
      name,
      description: originalSet.description,
      isDefault: false,
      policies: originalSet.policies.map((policy) => ({
        title: policy.title,
        slug: policy.slug,
        policyType: policy.policyType,
        bodyHtml: policy.bodyHtml,
        displayOrder: policy.displayOrder,
      })),
    });
  }

  /**
   * Replace variables in policy HTML content
   */
  replacePolicyVariables(html: string, variables: Record<string, string>): string {
    let result = html;

    // Replace {{variable}} placeholders
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    }

    return result;
  }

  /**
   * Get policies for a store with variable substitution
   */
  async getStorePolicies(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        legalSet: {
          include: {
            policies: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        workspace: {
          include: {
            generalSettings: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // If store doesn't have a legal set, use the default one
    let legalSet = store.legalSet;
    if (!legalSet) {
      legalSet = await this.findDefault(store.workspaceId);
    }

    // Prepare variables for substitution
    const variables = {
      store_name: store.name,
      store_url: store.primaryDomain,
      email_support: store.workspace.generalSettings?.supportEmail || 'support@example.com',
    };

    // Replace variables in each policy
    const policiesWithVariables = legalSet.policies.map((policy) => ({
      ...policy,
      bodyHtml: this.replacePolicyVariables(policy.bodyHtml, variables),
    }));

    return {
      ...legalSet,
      policies: policiesWithVariables,
    };
  }

  /**
   * Ensure legal set exists and belongs to workspace
   */
  private async ensureLegalSetExists(workspaceId: string, legalSetId: string) {
    const legalSet = await this.prisma.legalSet.findFirst({
      where: { id: legalSetId, workspaceId },
    });

    if (!legalSet) {
      throw new NotFoundException('Legal set not found');
    }

    return legalSet;
  }
}
