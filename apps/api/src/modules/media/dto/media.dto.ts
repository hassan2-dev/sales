import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MediaType } from '@prisma/client';
import { Type } from 'class-transformer';
import { STORAGE_FOLDERS } from '../../../storage/storage.folders.js';

export class MediaQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @IsOptional()
  @IsString()
  search?: string;
}

export class MediaUploadQueryDto {
  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsIn([...STORAGE_FOLDERS])
  folder?: (typeof STORAGE_FOLDERS)[number];
}
