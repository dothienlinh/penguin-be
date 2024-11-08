import { REGEX_USERNAME } from '@libs/constants';
import { Gender } from '@libs/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @MinLength(3)
  @Matches(REGEX_USERNAME, {
    message:
      'Username must be 3-20 characters, only letters, numbers, and underscores',
  })
  @ApiProperty({
    required: false,
    type: 'string',
    description: 'Username',
    example: 'john_doe',
  })
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    type: 'string',
    description: 'Bio',
    example: 'I am a software engineer',
  })
  bio: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    type: 'string',
    description: 'Address',
    example: '123 Main St, Anytown, USA',
  })
  address: string;

  @IsEnum(Gender)
  @IsOptional()
  @ApiProperty({
    required: false,
    type: 'string',
    description: 'Gender (male, female or other)',
    example: 'male',
  })
  gender: Gender;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Avatar',
  })
  @IsOptional()
  @Type(() => Object)
  avatar: Express.Multer.File;
}
