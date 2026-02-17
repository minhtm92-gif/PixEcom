import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DomainsService } from './domains.service';
import { DomainsController } from './domains.controller';
import { DomainsPublicController } from './domains-public.controller';
import { DomainsInfoController } from './domains-info.controller';
import { DomainsVerificationService } from './domains-verification.service';
import { DomainsSslService } from './domains-ssl.service';
import { DomainsJob } from './domains.job';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(), // Enable cron jobs
  ],
  controllers: [DomainsController, DomainsPublicController, DomainsInfoController],
  providers: [DomainsService, DomainsVerificationService, DomainsSslService, DomainsJob],
  exports: [DomainsService, DomainsVerificationService, DomainsSslService],
})
export class DomainsModule {}
