import { IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import { LikeType } from '@libs/enums';

export class CreateLikeDto {
  @IsNumber()
  @IsNotEmpty()
  targetId: number;

  @IsEnum(LikeType)
  @IsNotEmpty()
  targetType: LikeType;
}
