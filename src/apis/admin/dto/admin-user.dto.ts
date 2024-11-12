import { QueryListDto } from '@libs/base/base.dto';
import { ByRole, SortBy, UserStatusQuery } from '@libs/enums';
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetAdminUserDto {
  @ApiPropertyOptional({
    enum: UserStatusQuery,
    example: UserStatusQuery.DELETED_BY_ADMIN,
  })
  @IsOptional()
  @IsEnum(UserStatusQuery)
  status?: UserStatusQuery;

  @ApiPropertyOptional({
    enum: SortBy,
    example: SortBy.USERNAME,
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @ApiPropertyOptional({
    example: 'username',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    enum: ByRole,
    example: ByRole.USER,
  })
  @IsOptional()
  @IsEnum(ByRole)
  role?: ByRole;
}

export class GetAdminUserListDto extends IntersectionType(
  GetAdminUserDto,
  QueryListDto,
) {}

export class DeleteUserDto {
  @ApiProperty({
    example: 'Reason for deleting the user',
    description: 'Reason for deleting the user',
  })
  @IsNotEmpty()
  @IsString()
  deletedReason: string;
}
