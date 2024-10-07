import { IsNotEmpty, IsString } from 'class-validator';
import { IsMatch } from '@libs/decorators/isMatch.decorator';

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsMatch('password')
  confirmPassword: string;
}
