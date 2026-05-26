import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { createError } from '../middleware/errorHandler';

export interface UploadResult {
  key: string;
  url: string;
  filename: string;
}

export class UploadService {
  private storageType: string;
  private localDir: string;
  private s3Bucket: string;
  private s3Region: string;
  private s3Endpoint: string;
  private s3AccessKey: string;
  private s3SecretKey: string;
  private baseUrl: string;

  constructor() {
    this.storageType = process.env.STORAGE_TYPE || 'local';
    this.localDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    this.s3Bucket = process.env.S3_BUCKET || '';
    this.s3Region = process.env.S3_REGION || 'us-east-1';
    this.s3Endpoint = process.env.S3_ENDPOINT || '';
    this.s3AccessKey = process.env.S3_ACCESS_KEY || '';
    this.s3SecretKey = process.env.S3_SECRET_KEY || '';
    this.baseUrl = process.env.UPLOAD_BASE_URL || 'http://localhost:4000/uploads';

    // Ensure local upload directory exists
    if (this.storageType === 'local') {
      if (!fs.existsSync(this.localDir)) {
        fs.mkdirSync(this.localDir, { recursive: true });
      }
    }
  }

  async uploadImage(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }): Promise<UploadResult> {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw createError(
        'Invalid file type. Allowed: jpeg, png, gif, webp',
        400,
        'INVALID_FILE_TYPE'
      );
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const key = `${uuidv4()}${ext}`;

    if (this.storageType === 's3') {
      return this.uploadToS3(file.buffer, key, file.mimetype);
    }

    return this.uploadToLocal(file.buffer, key, file.originalname);
  }

  private async uploadToLocal(
    buffer: Buffer,
    key: string,
    originalname: string
  ): Promise<UploadResult> {
    const filePath = path.join(this.localDir, key);
    fs.writeFileSync(filePath, buffer);

    return {
      key,
      url: `${this.baseUrl}/${key}`,
      filename: originalname,
    };
  }

  private async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<UploadResult> {
    // Use fetch to PUT to S3-compatible endpoint
    const endpoint =
      this.s3Endpoint ||
      `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com`;
    const url = `${endpoint}/${key}`;

    // For S3-compatible storage, use presigned URL or direct PUT
    // This is a simplified implementation; production would use AWS SDK
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'x-amz-acl': 'public-read',
      },
      body: buffer,
    });

    if (!response.ok) {
      throw createError('Failed to upload to S3', 500, 'S3_UPLOAD_FAILED');
    }

    return {
      key,
      url: `${endpoint}/${key}`,
      filename: key,
    };
  }

  async deleteImage(key: string): Promise<void> {
    if (this.storageType === 's3') {
      await this.deleteFromS3(key);
    } else {
      this.deleteFromLocal(key);
    }
  }

  private deleteFromLocal(key: string): void {
    const filePath = path.join(this.localDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private async deleteFromS3(key: string): Promise<void> {
    const endpoint =
      this.s3Endpoint ||
      `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com`;
    const url = `${endpoint}/${key}`;

    await fetch(url, { method: 'DELETE' });
  }

  getImageUrl(key: string): string {
    if (this.storageType === 's3') {
      const endpoint =
        this.s3Endpoint ||
        `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com`;
      return `${endpoint}/${key}`;
    }
    return `${this.baseUrl}/${key}`;
  }
}

export default new UploadService();
