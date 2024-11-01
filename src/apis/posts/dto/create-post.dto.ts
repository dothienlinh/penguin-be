import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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

  // @IsOptional()
  // @Transform(({ value }) => {
  //   if (typeof +value === 'number' && !isNaN(+value)) {
  //     return [+value];
  //   }

  //   return value.split(',').map((v: string) => +v);
  // })
  // @IsArray()
  // @IsNumber({}, { each: true })
  // @ArrayNotEmpty()
  // categoriesId?: number[];
}
