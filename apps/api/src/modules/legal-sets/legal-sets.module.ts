import { Module } from '@nestjs/common';
import { LegalSetsService } from './legal-sets.service';
import { LegalSetsController, StorePoliciesController } from './legal-sets.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LegalSetsController, StorePoliciesController],
  providers: [LegalSetsService],
  exports: [LegalSetsService],
})
export class LegalSetsModule {}
