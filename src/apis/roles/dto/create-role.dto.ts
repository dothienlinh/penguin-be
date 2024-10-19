import { Roles } from '@libs/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsEnum(Roles)
  @IsNotEmpty()
  @ApiProperty({ enum: Roles })
  name: Roles;
}
