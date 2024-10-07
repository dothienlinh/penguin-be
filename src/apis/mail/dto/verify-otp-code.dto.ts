import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpCodeDto {
  @IsString()
  @IsNotEmpty()
  otpCode: string;
}
