import { QueryListDto } from '@libs/base/base.dto';
import { LikeType } from '@libs/enums';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ListUserLikedPostDto extends QueryListDto {
  @IsEnum(LikeType)
  @IsNotEmpty()
  targetType: LikeType;
}
