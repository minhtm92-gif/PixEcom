import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { SellpagesModule } from '../sellpages/sellpages.module';

@Module({
  imports: [SellpagesModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
