import { Permission } from '@libs/enums';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsEnum(Permission)
  @IsNotEmpty()
  name: Permission;
}
