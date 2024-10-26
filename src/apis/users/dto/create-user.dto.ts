import { Role } from '@apis/roles/entities/role.entity';
import { REGEX_USERNAME } from '@libs/constants';
import { IsMatch } from '@libs/decorators/isMatch.decorator';
import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX_USERNAME, {
    message:
      'Username must be 3-20 characters, only letters, numbers, and underscores',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @MinLength(8)
  @IsMatch('password')
  passwordConfirm: string;

  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @ApiHideProperty()
  @Type(() => Role)
  @IsNotEmpty()
  role: Role;
}
