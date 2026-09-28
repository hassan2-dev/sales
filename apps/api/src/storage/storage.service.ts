import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

export interface UploadResult {
  url: string;
  storageKey: string;
  size: number;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly localUploadDir = path.resolve(process.cwd(), 'uploads');
  private s3Client: S3Client | null = null;
  private bucket: string | null = null;
  private publicBaseUrl: string | null = null;
  private useS3 = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const bucket = this.configService.get<string>('S3_BUCKET');
    const accessKey =
      this.configService.get<string>('S3_ACCESS_KEY') ??
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretKey =
      this.configService.get<string>('S3_SECRET_KEY') ??
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const region =
      this.configService.get<string>('S3_REGION') ??
      this.configService.get<string>('AWS_REGION') ??
      'us-east-1';
    const endpoint = this.configService.get<string>('S3_ENDPOINT');

    if (bucket && accessKey && secretKey) {
      this.bucket = bucket;
      this.publicBaseUrl =
        this.configService.get<string>('S3_PUBLIC_URL') ??
        (endpoint
          ? `${endpoint.replace(/\/$/, '')}/${bucket}`
          : `https://${bucket}.s3.${region}.amazonaws.com`);

      this.s3Client = new S3Client({
        region,
        endpoint: endpoint || undefined,
        forcePathStyle: Boolean(endpoint),
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });
      this.useS3 = true;
      this.logger.log('Storage configured for S3-compatible backend');
    } else {
      await fs.mkdir(this.localUploadDir, { recursive: true });
      this.logger.log(
        `S3 not configured — using local uploads at ${this.localUploadDir}`,
      );
    }
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;

    if (this.useS3 && this.s3Client && this.bucket) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      return {
        url: `${this.publicBaseUrl!.replace(/\/$/, '')}/${storageKey}`,
        storageKey,
        size: buffer.length,
      };
    }

    const absolutePath = path.join(this.localUploadDir, storageKey);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    const baseUrl =
      this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';

    return {
      url: `${baseUrl.replace(/\/$/, '')}/uploads/${storageKey}`,
      storageKey,
      size: buffer.length,
    };
  }

  async delete(storageKey: string): Promise<void> {
    if (!storageKey) {
      return;
    }

    if (this.useS3 && this.s3Client && this.bucket) {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
        }),
      );
      return;
    }

    const absolutePath = path.join(this.localUploadDir, storageKey);
    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
