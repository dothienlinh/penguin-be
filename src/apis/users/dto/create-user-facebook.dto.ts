import { REGEX_USERNAME } from '@libs/constants';
import { Gender, Provider } from '@libs/enums';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateUserFacebookDto {
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX_USERNAME, {
    message:
      'Username must be 3-20 characters, only letters, numbers, and underscores',
  })
  username: string;

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
