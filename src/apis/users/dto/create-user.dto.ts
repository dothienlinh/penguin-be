import { IsMatch } from '@libs/decorators/isMatch.decorator';
import { Gender } from '@libs/enums';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsDateString()
  @IsNotEmpty()
  birthDate: Date;

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
}
