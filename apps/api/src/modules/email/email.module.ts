import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';

// Controllers
import { EmailAdminController } from './controllers/email-admin.controller';
import { EmailPublicController } from './controllers/email-public.controller';

// Services
import { EmailService } from './services/email.service';
import { EmailProviderService } from './services/email-provider.service';
import { EmailTemplateService } from './services/email-template.service';
import { EmailQueueService } from './services/email-queue.service';
import { AbandonedCartService } from './services/abandoned-cart.service';
import { EmailAutomationService } from './services/email-automation.service';

// Utils
import { EncryptionUtil } from './utils/encryption.util';
import { TemplateRendererUtil } from './utils/template-renderer.util';

// Jobs
import { EmailJob } from './jobs/email.job';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [EmailAdminController, EmailPublicController],
  providers: [
    // Services
    EmailService,
    EmailProviderService,
    EmailTemplateService,
    EmailQueueService,
    AbandonedCartService,
    EmailAutomationService,

    // Utils
    EncryptionUtil,
    TemplateRendererUtil,

    // Jobs
    EmailJob,
  ],
  exports: [
    EmailService,
    EmailProviderService,
    EmailTemplateService,
    EmailQueueService,
    AbandonedCartService,
    EmailAutomationService,
  ],
})
export class EmailModule {}
