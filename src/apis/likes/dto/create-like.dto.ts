import { IsNumber, IsEnum, IsNotEmpty, IsPositive } from 'class-validator';
import { LikeType } from '@libs/enums';

export class CreateLikeDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  targetId: number;

  @IsEnum(LikeType)
  @IsNotEmpty()
  targetType: LikeType;
}
