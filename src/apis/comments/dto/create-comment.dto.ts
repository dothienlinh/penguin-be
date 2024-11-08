import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  postId: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  parentCommentId!: number;
}
