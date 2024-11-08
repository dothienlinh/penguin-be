import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateSaveDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  postId!: number;
}
