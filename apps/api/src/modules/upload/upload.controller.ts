import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { StorageService } from '../../common/utils/storage.service';
import { CurrentWorkspace } from '../../common/decorators/workspace.decorator';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(WorkspaceGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
      fileFilter: (req, file, callback) => {
        // Allow images only
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml|x-icon)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentWorkspace('id') workspaceId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Save file to storage with workspace-specific subfolder
    const url = await this.storageService.saveFile(file, `workspaces/${workspaceId}`);

    return {
      url,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
