import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import type { UploadResult } from '@natsu/types';

const ALLOWED_MIME = new Map<string, string>([
  ['image/png', '.png'],
  ['image/jpeg', '.jpg'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
  ['image/gif', '.gif'],
]);

const MAX_BYTES = 5 * 1024 * 1024;

/** Safe, filesystem-friendly folder names only. */
const SAFE_FOLDER = /^[a-z0-9-_]{1,40}$/i;

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly config: ConfigService) {
    if (this.config.get<string>('storage.driver') === 'cloudinary') {
      cloudinary.config({
        cloud_name: this.config.get<string>('storage.cloudinary.cloudName'),
        api_key: this.config.get<string>('storage.cloudinary.apiKey'),
        api_secret: this.config.get<string>('storage.cloudinary.apiSecret'),
        secure: true,
      });
    }
  }

  get driver(): 'cloudinary' | 'local' {
    return this.config.get<string>('storage.driver') === 'cloudinary' ? 'cloudinary' : 'local';
  }

  async upload(file: Express.Multer.File | undefined, folder = 'general'): Promise<UploadResult> {
    if (!file) throw new BadRequestException('No file was uploaded.');
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Unsupported image type. Use PNG, JPEG, WebP, AVIF or GIF.');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Images must be 5 MB or smaller.');
    }
    if (!SAFE_FOLDER.test(folder)) {
      throw new BadRequestException('Invalid upload folder.');
    }

    return this.driver === 'cloudinary'
      ? this.uploadToCloudinary(file, folder)
      : this.uploadToDisk(file, folder);
  }

  /* ------------------------------------------------------------------ */

  private uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const baseFolder = this.config.get<string>('storage.cloudinary.folder') ?? 'natsu-portfolio';

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${baseFolder}/${folder}`,
          resource_type: 'image',
          // Optimise on delivery: modern formats, sane quality, no upscaling.
          transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error(`Cloudinary upload failed: ${error?.message ?? 'unknown error'}`);
            reject(new BadRequestException('Image upload failed. Please try again.'));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width ?? null,
            height: result.height ?? null,
            format: result.format ?? null,
            bytes: result.bytes ?? null,
            provider: 'cloudinary',
          });
        },
      );

      stream.end(file.buffer);
    });
  }

  private async uploadToDisk(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const targetDir = join(process.cwd(), 'uploads', folder);
    await mkdir(targetDir, { recursive: true });

    const extension = ALLOWED_MIME.get(file.mimetype) ?? extname(file.originalname) ?? '.bin';
    const filename = `${Date.now()}-${randomBytes(6).toString('hex')}${extension}`;
    await writeFile(join(targetDir, filename), file.buffer);

    return {
      url: `/uploads/${folder}/${filename}`,
      publicId: `${folder}/${filename}`,
      width: null,
      height: null,
      format: extension.replace('.', ''),
      bytes: file.size,
      provider: 'local',
    };
  }
}
