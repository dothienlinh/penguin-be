import { QueryListDto } from '@libs/base/base.dto';
import { Roles, SortBy, UserStatus } from '@libs/enums';
import { OmitType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchUserDto extends OmitType(QueryListDto, ['orderBy']) {
  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @IsEnum(Roles)
  role?: Roles;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;
}
