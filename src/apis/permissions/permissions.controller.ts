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
import { Permission } from '@libs/enums';
import { Permissions } from '@libs/decorators/permissions.decorator';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Permissions(Permission.READ_PERMISSION)
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Permissions(Permission.READ_PERMISSION)
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Permissions(Permission.READ_PERMISSION)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.permissionsService.findOne(+id);
  }

  @Permissions(Permission.UPDATE_PERMISSION)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Permissions(Permission.DELETE_PERMISSION)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.permissionsService.remove(+id);
  }
}
