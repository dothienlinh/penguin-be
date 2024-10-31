import { IsImage } from '@libs/decorators/file-validator.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'This is a test post',
  })
  title: string;

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
  images?: Express.Multer.File[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  @IsImage({
    message:
      'Thumbnail must be a valid image (jpg, jpeg, png) and less than 5MB',
  })
  thumbnail?: Express.Multer.File;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof +value === 'number' && !isNaN(+value)) {
      return [+value];
    }

    return value.split(',').map((v: string) => +v);
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  categoriesId?: number[];
}
