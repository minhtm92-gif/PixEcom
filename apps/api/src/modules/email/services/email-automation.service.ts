import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { EmailTemplateType } from '@prisma/client';

@Injectable()
export class EmailAutomationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new email automation
   */
  async createAutomation(data: {
    storeId: string;
    name: string;
    templateType: EmailTemplateType;
    triggerDelayMinutes: number;
    discountCode?: string;
    discountPercentage?: number;
  }) {
    return this.prisma.emailAutomation.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        templateType: data.templateType,
        triggerDelayMinutes: data.triggerDelayMinutes,
        discountCode: data.discountCode,
        discountPercentage: data.discountPercentage,
        isActive: true,
      },
    });
  }

  /**
   * Gets all automations for a store
   */
  async getAutomations(storeId: string) {
    return this.prisma.emailAutomation.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Gets active automations by template type
   */
  async getActiveAutomationsByType(
    storeId: string,
    templateType: EmailTemplateType,
  ) {
    return this.prisma.emailAutomation.findMany({
      where: {
        storeId,
        templateType,
        isActive: true,
      },
      orderBy: { triggerDelayMinutes: 'asc' },
    });
  }

  /**
   * Updates an email automation
   */
  async updateAutomation(
    id: string,
    data: {
      name?: string;
      triggerDelayMinutes?: number;
      discountCode?: string;
      discountPercentage?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.emailAutomation.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes an email automation
   */
  async deleteAutomation(id: string) {
    return this.prisma.emailAutomation.delete({
      where: { id },
    });
  }

  /**
   * Seeds default automations for abandoned cart recovery
   */
  async seedDefaultAutomations(storeId: string) {
    const automations = [
      {
        name: 'Abandoned Cart - 1 Hour',
        templateType: 'ABANDONED_CART_1H' as EmailTemplateType,
        triggerDelayMinutes: 60, // 1 hour
        isActive: true,
      },
      {
        name: 'Abandoned Cart - 24 Hours',
        templateType: 'ABANDONED_CART_24H' as EmailTemplateType,
        triggerDelayMinutes: 1440, // 24 hours
        discountCode: 'SAVE10',
        discountPercentage: 10,
        isActive: true,
      },
      {
        name: 'Abandoned Cart - 7 Days (Final)',
        templateType: 'ABANDONED_CART_7D' as EmailTemplateType,
        triggerDelayMinutes: 10080, // 7 days
        discountCode: 'SAVE15',
        discountPercentage: 15,
        isActive: true,
      },
    ];

    for (const automation of automations) {
      // Check if automation already exists
      const existing = await this.prisma.emailAutomation.findFirst({
        where: {
          storeId,
          templateType: automation.templateType,
        },
      });

      if (!existing) {
        await this.prisma.emailAutomation.create({
          data: {
            ...automation,
            storeId,
          },
        });
      }
    }
  }
}
