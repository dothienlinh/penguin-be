import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: '1',
  })
  @IsNumber()
  @IsNotEmpty()
  postId: number;
}
