import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { UploadFileDto } from '@apis/upload/dto/upload-file.dto';

class UploadImageDto extends UploadFileDto {}

export class CreatePostWithImagesDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'This is a test post',
  })
  content: string;

  @IsNotEmpty()
  @Transform(
    ({ value }: TransformFnParams) => value === 'true' || value === true,
  )
  @ApiProperty({
    example: true,
    type: 'boolean',
  })
  isPublished: boolean;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadImageDto)
  images?: Express.Multer.File[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoriesId?: number[];
}
