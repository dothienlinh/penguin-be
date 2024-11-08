import { QueryListDto } from '@libs/base/base.dto';
import { IsOptional, IsNumber, IsPositive } from 'class-validator';

export class ListCommentDto extends QueryListDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  parentCommentId?: number;
}
