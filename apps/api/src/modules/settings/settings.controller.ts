import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { SettingsService } from './settings.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(MemberRole.VIEWER)
  @ApiOperation({ summary: 'Get workspace general settings' })
  getSettings(@CurrentWorkspace('id') workspaceId: string) {
    return this.settingsService.getSettings(workspaceId);
  }

  @Patch()
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update workspace general settings' })
  updateSettings(
    @CurrentWorkspace('id') workspaceId: string,
    @Body()
    body: {
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
    return this.settingsService.updateSettings(workspaceId, body);
  }
}
