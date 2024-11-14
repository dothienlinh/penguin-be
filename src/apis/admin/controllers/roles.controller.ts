import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { Roles } from '@libs/decorators/roles.decorator';
import { Roles as RoleEnum } from '@libs/enums';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';

@Roles(RoleEnum.SUPER_ADMIN)
@ApiTags('Admin Roles')
@Controller('admin/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ResponseMessage('Admin get roles successfully')
  @ApiOperation({ summary: 'Admin get roles' })
  @Get()
  getRoles() {
    return this.rolesService.getRoles();
  }
}
