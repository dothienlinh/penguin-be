import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { QueryListDto } from '@libs/base/base.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Roles } from '@libs/enums';

export class SearchUserDto extends PartialType(QueryListDto) {
  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: Roles.USER })
  @IsEnum(Roles)
  @IsOptional()
  role?: Roles;
}
