import { UpdatePostStatus as PostStatus } from '@libs/enums';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class UpdatePostStatus {
  @ApiProperty({ enum: PostStatus, example: PostStatus.APPROVED })
  @IsEnum(PostStatus)
  @IsNotEmpty()
  status: PostStatus;
}
