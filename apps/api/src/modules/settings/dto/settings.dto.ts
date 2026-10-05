import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSiteSettingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  usdToIqdRate?: number;

  @IsOptional()
  @IsBoolean()
  enableIqdDisplay?: boolean;
}
