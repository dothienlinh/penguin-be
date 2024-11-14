import { QueryListDto } from '@libs/base/base.dto';
import { ByRole, PostStatus } from '@libs/enums';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetAdminPostDto {
  @ApiProperty({
    enum: PostStatus,
    example: PostStatus.APPROVED,
    description: 'Check post status',
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({
    enum: ByRole,
    example: ByRole.ADMIN,
    description: 'Deleted by',
  })
  @IsEnum(ByRole)
  @IsOptional()
  deletedBy?: ByRole;

  @ApiProperty({
    example: 'Title',
    description: 'Title of the post',
  })
  @IsOptional()
  @IsString()
  title?: string;
}

export class GetAdminPostListDto extends IntersectionType(
  GetAdminPostDto,
  QueryListDto,
) {}

export class DeletePostDto {
  @ApiProperty({
    example: 'Reason for deleting the post',
    description: 'Reason for deleting the post',
  })
  @IsNotEmpty()
  @IsString()
  deletedReason: string;
}
