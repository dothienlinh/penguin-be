import { Role } from '@apis/roles/entities/role.entity';
import { REGEX_USERNAME } from '@libs/constants';
import { Provider } from '@libs/enums';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserGoogleDto {
  @IsString()
  @IsNotEmpty()
  googleId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(REGEX_USERNAME, {
    message:
      'Username must be 3-20 characters, only letters, numbers, and underscores',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  avatar: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(Provider)
  @IsNotEmpty()
  provider: Provider;

  @Type(() => Role)
  @IsNotEmpty()
  role: Role;
}
