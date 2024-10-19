import { Provider } from '@libs/enums';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserGoogleDto {
  @IsString()
  @IsNotEmpty()
  googleId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  avatar: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(Provider)
  @IsNotEmpty()
  provider: Provider;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}
