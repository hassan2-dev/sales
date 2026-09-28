import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MediaType } from '@prisma/client';
import { Type } from 'class-transformer';

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
