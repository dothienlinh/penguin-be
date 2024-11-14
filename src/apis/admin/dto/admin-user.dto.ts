import { QueryListDto } from '@libs/base/base.dto';
import { ByRole, SortBy, UserStatusQuery } from '@libs/enums';
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetAdminUserDto {
  @ApiPropertyOptional({
    enum: UserStatusQuery,
    example: UserStatusQuery.DELETED,
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
    enum: ByRole,
    example: ByRole.USER,
  })
  @IsOptional()
  @IsEnum(ByRole)
  role?: ByRole;

  @ApiPropertyOptional({
    enum: ByRole,
    example: ByRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(ByRole)
  deletedBy?: ByRole;

  @ApiPropertyOptional({
    example: 'username',
    description: 'Search username or email',
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;
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

export class UpdateUserRoleDto {
  @ApiPropertyOptional({
    enum: ByRole,
    example: ByRole.USER,
  })
  @IsNotEmpty()
  @IsEnum(ByRole)
  role: ByRole;
}

export class UpdatePermissionDto {
  @ApiProperty({
    example: [],
  })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionsIds: number[];
}
