import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(workspaceId: string) {
    let settings = await this.prisma.generalSettings.findUnique({
      where: { workspaceId },
    });

    if (!settings) {
      // Auto-create default settings if they don't exist
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      settings = await this.prisma.generalSettings.create({
        data: {
          workspaceId,
          brandName: workspace.name,
        },
      });
    }

    return settings;
  }

  async updateSettings(
    workspaceId: string,
    data: {
      brandName?: string;
      defaultCurrency?: string;
      timezone?: string;
      supportEmail?: string;
      supportPhone?: string;
      logoUrl?: string;
      faviconUrl?: string;
      metaPixelId?: string;
      googleAnalyticsId?: string;
    },
  ) {
    // Ensure settings record exists
    await this.getSettings(workspaceId);

    return this.prisma.generalSettings.update({
      where: { workspaceId },
      data,
    });
  }
}
