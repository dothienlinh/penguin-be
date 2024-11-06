import { PostStatus } from '@libs/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class GetPostDto {
  @ApiProperty({
    example: true,
    description: 'Check post is draft',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isDraft?: boolean;

  @ApiProperty({
    example: true,
    description: 'Check post is published',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isPublished?: boolean;

  @ApiProperty({
    enum: PostStatus,
    example: PostStatus.APPROVED,
    description: 'Check post status',
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
