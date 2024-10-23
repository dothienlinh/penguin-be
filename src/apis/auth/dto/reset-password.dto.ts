import { IsNotEmpty, IsString } from 'class-validator';
import { ForgotPasswordDto } from './forgot-password.dto';
import { OmitType } from '@nestjs/swagger';

export class ResetPasswordDto extends OmitType(ForgotPasswordDto, [
  'otpCode',
  'email',
] as const) {
  @IsString()
  @IsNotEmpty()
  otpCode: string;
}
