import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentWorkspace } from '../../../common/decorators/workspace.decorator';
import { MemberRole } from '@prisma/client';
import { EmailProviderService } from '../services/email-provider.service';
import { EmailTemplateService } from '../services/email-template.service';
import { EmailAutomationService } from '../services/email-automation.service';
import { EmailQueueService } from '../services/email-queue.service';
import { EmailService } from '../services/email.service';
import { CreateEmailProviderDto } from '../dto/create-provider.dto';
import { UpdateEmailProviderDto } from '../dto/update-provider.dto';
import { CreateEmailTemplateDto } from '../dto/create-template.dto';
import { UpdateEmailTemplateDto } from '../dto/update-template.dto';
import { CreateEmailAutomationDto } from '../dto/create-automation.dto';
import { SendTestEmailDto } from '../dto/send-test-email.dto';

@ApiTags('Email (Admin)')
@ApiBearerAuth()
@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailAdminController {
  constructor(
    private readonly emailProviderService: EmailProviderService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly emailAutomationService: EmailAutomationService,
    private readonly emailQueueService: EmailQueueService,
    private readonly emailService: EmailService,
  ) {}

  // ─── Email Providers ───────────────────────────────────────

  @Post('providers')
  @Roles(MemberRole.ADMIN)
  async createProvider(@Body() dto: CreateEmailProviderDto) {
    return this.emailProviderService.createProvider(dto);
  }

  @Get('providers')
  @Roles(MemberRole.ADMIN)
  async getProviders(@Query('storeId') storeId: string) {
    return this.emailProviderService.getProviders(storeId);
  }

  @Patch('providers/:id')
  @Roles(MemberRole.ADMIN)
  async updateProvider(
    @Param('id') id: string,
    @Body() dto: UpdateEmailProviderDto,
  ) {
    return this.emailProviderService.updateProvider(id, dto);
  }

  @Delete('providers/:id')
  @Roles(MemberRole.ADMIN)
  async deleteProvider(@Param('id') id: string) {
    return this.emailProviderService.deleteProvider(id);
  }

  @Post('providers/:id/test')
  @Roles(MemberRole.ADMIN)
  async testProvider(
    @Param('id') id: string,
    @Body('testEmail') testEmail: string,
  ) {
    const success = await this.emailProviderService.testProvider(id, testEmail);
    return { success };
  }

  // ─── Email Templates ───────────────────────────────────────

  @Post('templates')
  @Roles(MemberRole.ADMIN)
  async createTemplate(@Body() dto: CreateEmailTemplateDto) {
    return this.emailTemplateService.createTemplate(dto);
  }

  @Get('templates')
  @Roles(MemberRole.ADMIN)
  async getTemplates(@Query('storeId') storeId: string) {
    return this.emailTemplateService.getTemplates(storeId);
  }

  @Patch('templates/:id')
  @Roles(MemberRole.ADMIN)
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateEmailTemplateDto,
  ) {
    return this.emailTemplateService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @Roles(MemberRole.ADMIN)
  async deleteTemplate(@Param('id') id: string) {
    return this.emailTemplateService.deleteTemplate(id);
  }

  @Post('templates/seed')
  @Roles(MemberRole.ADMIN)
  async seedTemplates(
    @Body('storeId') storeId: string,
    @Body('storeName') storeName: string,
  ) {
    await this.emailTemplateService.seedDefaultTemplates(storeId, storeName);
    return { success: true };
  }

  // ─── Email Automations ─────────────────────────────────────

  @Post('automations')
  @Roles(MemberRole.ADMIN)
  async createAutomation(@Body() dto: CreateEmailAutomationDto) {
    return this.emailAutomationService.createAutomation(dto);
  }

  @Get('automations')
  @Roles(MemberRole.ADMIN)
  async getAutomations(@Query('storeId') storeId: string) {
    return this.emailAutomationService.getAutomations(storeId);
  }

  @Patch('automations/:id')
  @Roles(MemberRole.ADMIN)
  async updateAutomation(
    @Param('id') id: string,
    @Body() dto: Partial<CreateEmailAutomationDto>,
  ) {
    return this.emailAutomationService.updateAutomation(id, dto);
  }

  @Delete('automations/:id')
  @Roles(MemberRole.ADMIN)
  async deleteAutomation(@Param('id') id: string) {
    return this.emailAutomationService.deleteAutomation(id);
  }

  @Post('automations/seed')
  @Roles(MemberRole.ADMIN)
  async seedAutomations(@Body('storeId') storeId: string) {
    await this.emailAutomationService.seedDefaultAutomations(storeId);
    return { success: true };
  }

  // ─── Email Messages (History/Logs) ────────────────────────

  @Get('messages')
  @Roles(MemberRole.ADMIN)
  async getEmailHistory(
    @Query('storeId') storeId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '50',
    @Query('status') status?: string,
    @Query('templateType') templateType?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);
    const skip = (pageNum - 1) * pageSizeNum;

    return this.emailQueueService.getEmailHistory(storeId, {
      skip,
      take: pageSizeNum,
      status: status as any,
      templateType: templateType as any,
    });
  }

  @Post('messages/:id/retry')
  @Roles(MemberRole.ADMIN)
  async retryEmail(@Param('id') id: string) {
    const success = await this.emailQueueService.retryEmail(id);
    return { success };
  }

  // ─── Test Email ────────────────────────────────────────────

  @Post('test')
  @Roles(MemberRole.ADMIN)
  async sendTestEmail(
    @Query('storeId') storeId: string,
    @Body() dto: SendTestEmailDto,
  ) {
    await this.emailService.sendTestEmail(
      storeId,
      dto.recipientEmail,
      dto.subject,
      dto.body,
    );
    return { success: true };
  }
}
