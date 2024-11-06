import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'This is a test post',
  })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'This is a test post',
  })
  content?: string;
}
