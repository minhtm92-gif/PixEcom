import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { StorageService } from '../../common/utils/storage.service';

@Module({
  controllers: [UploadController],
  providers: [StorageService],
})
export class UploadModule {}
