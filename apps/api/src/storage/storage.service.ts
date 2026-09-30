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

/**
 * Media object storage.
 * Prefers Cloudflare R2, then generic S3/MinIO, else local ./uploads.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly localUploadDir = path.resolve(process.cwd(), 'uploads');
  private s3Client: S3Client | null = null;
  private bucket: string | null = null;
  private publicBaseUrl: string | null = null;
  private useRemote = false;
  private backendLabel = 'local';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID')?.trim();
    const bucket =
      this.configService.get<string>('R2_BUCKET')?.trim() ||
      this.configService.get<string>('S3_BUCKET')?.trim();
    const accessKey =
      this.configService.get<string>('R2_ACCESS_KEY_ID')?.trim() ||
      this.configService.get<string>('S3_ACCESS_KEY')?.trim() ||
      this.configService.get<string>('AWS_ACCESS_KEY_ID')?.trim();
    const secretKey =
      this.configService.get<string>('R2_SECRET_ACCESS_KEY')?.trim() ||
      this.configService.get<string>('S3_SECRET_KEY')?.trim() ||
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY')?.trim();
    const publicUrl =
      this.configService.get<string>('R2_PUBLIC_URL')?.trim() ||
      this.configService.get<string>('S3_PUBLIC_URL')?.trim();
    const s3Endpoint = this.configService.get<string>('S3_ENDPOINT')?.trim();
    const region =
      this.configService.get<string>('R2_REGION')?.trim() ||
      this.configService.get<string>('S3_REGION')?.trim() ||
      this.configService.get<string>('AWS_REGION')?.trim() ||
      'auto';

    if (!bucket || !accessKey || !secretKey) {
      await fs.mkdir(this.localUploadDir, { recursive: true });
      this.logger.log(
        `Object storage not configured — using local uploads at ${this.localUploadDir}`,
      );
      return;
    }

    const isR2 = Boolean(accountId);
    const endpoint = isR2
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : s3Endpoint || undefined;

    this.bucket = bucket;
    this.publicBaseUrl =
      publicUrl ||
      (endpoint
        ? `${endpoint.replace(/\/$/, '')}/${bucket}`
        : `https://${bucket}.s3.${region === 'auto' ? 'us-east-1' : region}.amazonaws.com`);

    this.s3Client = new S3Client({
      region: region === 'auto' ? 'auto' : region,
      endpoint,
      forcePathStyle: Boolean(endpoint),
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });

    this.useRemote = true;
    this.backendLabel = isR2 ? 'Cloudflare R2' : 'S3-compatible';
    this.logger.log(
      `Storage configured for ${this.backendLabel} (bucket: ${this.bucket})`,
    );
  }

  get backend(): string {
    return this.useRemote ? this.backendLabel : 'local';
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<UploadResult> {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;

    if (this.useRemote && this.s3Client && this.bucket) {
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

    if (this.useRemote && this.s3Client && this.bucket) {
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
