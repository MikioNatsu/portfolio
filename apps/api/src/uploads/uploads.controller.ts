import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UploadsService } from './uploads.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image (Cloudinary when configured, otherwise local disk)' })
  @UseInterceptors(
    FileInterceptor('file', {
      // Buffered in memory, then pushed to the configured storage driver.
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File | undefined, @Body('folder') folder?: string) {
    return this.uploads.upload(file, folder ?? 'general');
  }
}
