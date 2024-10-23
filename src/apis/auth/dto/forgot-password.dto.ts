import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsMatch } from '@libs/decorators/isMatch.decorator';

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsMatch('password')
  confirmPassword: string;
}
