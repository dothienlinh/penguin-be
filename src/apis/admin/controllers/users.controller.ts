import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@libs/decorators/roles.decorator';
import { Permission, Roles as Role } from '@libs/enums';
import { UsersService } from '../services/users.service';
import {
  DeleteUserDto,
  GetAdminUserListDto,
  UpdatePermissionDto,
  UpdateUserRoleDto,
} from '../dto/admin-user.dto';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { Permissions } from '@libs/decorators/permissions.decorator';
import { User } from '@apis/users/entities/user.entity';
import { CurrentUser } from '@libs/decorators/user.decorator';

@ApiTags('Admin Users')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions(Permission.ADMIN_GET_USERS)
  @ApiOperation({ summary: 'Admin get users' })
  @ResponseMessage('Admin get users successfully')
  @ResponseMessage('Admin get users successfully')
  @Get()
  getUsers(@Query() query: GetAdminUserListDto) {
    return this.usersService.getUsers(query);
  }

  @Permissions(Permission.ADMIN_GET_USER_DETAIL)
  @ApiOperation({ summary: 'Admin get user detail' })
  @ResponseMessage('Admin get user detail successfully')
  @ResponseMessage('Admin get user detail successfully')
  @Get(':id')
  getUserDetail(@Param('id') id: number) {
    return this.usersService.getUserById(+id);
  }

  @Permissions(Permission.ADMIN_GET_USER_DETAIL)
  @ApiOperation({ summary: 'Admin get user by username' })
  @ResponseMessage('Admin get user by username successfully')
  @ResponseMessage('Admin get user by username successfully')
  @Get('username/:username')
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Permissions(Permission.ADMIN_DELETE_USER)
  @ApiOperation({ summary: 'Admin delete user' })
  @ResponseMessage('Admin delete user successfully')
  @ResponseMessage('Admin delete user successfully')
  @Delete(':id')
  deleteUser(
    @Param('id') id: number,
    @CurrentUser() user: User,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    return this.usersService.deleteUser(+id, user, deleteUserDto);
  }

  @Permissions(Permission.ADMIN_RESTORE_USER)
  @ApiOperation({ summary: 'Admin restore user' })
  @ResponseMessage('Admin restore user successfully')
  @ResponseMessage('Admin restore user successfully')
  @Post(':id/restore')
  restoreUser(@Param('id') id: number, @CurrentUser() user: User) {
    return this.usersService.restoreUser(+id, user);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin update user role' })
  @ResponseMessage('Admin update user role successfully')
  @ResponseMessage('Admin update user role successfully')
  @Put(':id/role')
  updateUserRole(
    @Param('id') id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(+id, updateUserRoleDto);
  }

  @Permissions(Permission.ADMIN_UPDATE_USER_PERMISSION)
  @ApiOperation({ summary: 'Admin update permission for user' })
  @ResponseMessage('Admin update permission for user successfully')
  @ResponseMessage('Admin update permission for user successfully')
  @Put(':id/permission')
  updatePermission(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.usersService.updateUserPermission(+id, updatePermissionDto);
  }
}
