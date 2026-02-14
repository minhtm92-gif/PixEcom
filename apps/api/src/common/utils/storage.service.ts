import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
  }

  /**
   * Save an uploaded file to local storage
   * @param file - The uploaded file from multer
   * @param subfolder - Subfolder path (e.g., 'products/uuid')
   * @returns The full URL path to the saved file
   */
  async saveFile(
    file: Express.Multer.File,
    subfolder: string,
  ): Promise<string> {
    // Create directory if it doesn't exist
    const dir = path.join(this.uploadDir, subfolder);
    await fs.mkdir(dir, { recursive: true });

    // Generate unique filename with timestamp and random bytes
    const ext = path.extname(file.originalname);
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${randomBytes}${ext}`;
    const filepath = path.join(dir, filename);

    // Write file to disk
    await fs.writeFile(filepath, file.buffer);

    // Get base URL from environment or use default
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';

    // Return full URL (served by Express static middleware)
    return `${baseUrl}/uploads/${subfolder}/${filename}`;
  }

  /**
   * Delete a file from storage
   * @param url - The relative URL path (e.g., '/uploads/products/uuid/file.jpg')
   */
  async deleteFile(url: string): Promise<void> {
    try {
      // Construct absolute filepath from URL
      const relativePath = url.replace(/^\//, ''); // Remove leading slash
      const filepath = path.join(process.cwd(), relativePath);

      // Delete the file (ignore errors if file doesn't exist)
      await fs.unlink(filepath).catch(() => {});
    } catch (error) {
      // Silently ignore deletion errors
    }
  }

  /**
   * Get the absolute path for the upload directory
   */
  getUploadDir(): string {
    return this.uploadDir;
  }
}
