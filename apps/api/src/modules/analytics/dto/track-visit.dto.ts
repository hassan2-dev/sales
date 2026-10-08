import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class TrackVisitDto {
  @IsIn(['store', 'corporate'])
  surface!: 'store' | 'corporate';

  @IsString()
  @MinLength(8)
  @MaxLength(80)
  visitorId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  path?: string;
}
