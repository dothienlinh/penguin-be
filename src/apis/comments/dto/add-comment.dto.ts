import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddCommentDto {
  @ApiProperty({
    example: 'This is a comment',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
