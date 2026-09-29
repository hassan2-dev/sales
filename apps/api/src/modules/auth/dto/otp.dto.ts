import {
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @MinLength(8)
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  @MinLength(8)
  phone!: string;

  @IsString()
  @Matches(/^\d{4,8}$/)
  code!: string;

  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;
}
