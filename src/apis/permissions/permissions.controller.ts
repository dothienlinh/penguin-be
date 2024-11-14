import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@libs/decorators/roles.decorator';
import { ByRole, Roles as Role } from '@libs/enums';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.permissionsService.findOne(+id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('role/:role')
  getPermissionsByRole(@Param('role') role: ByRole) {
    return this.permissionsService.getPermissionsByRole(role);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.permissionsService.remove(+id);
  }
}
