import { OmitType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';
import { Type } from 'class-transformer';
import { Comment } from '../entities/comment.entity';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';

export class CreateReplyCommentDto extends OmitType(
  CreateCommentDto,
  [] as const,
) {
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Comment)
  parentComment: Comment;
}
