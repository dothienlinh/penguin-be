import { Gender, Provider } from '@libs/enums';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserFacebookDto {
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  facebookId: string;

  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(Provider)
  @IsNotEmpty()
  provider: Provider;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}
