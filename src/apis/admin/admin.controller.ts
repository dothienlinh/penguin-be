import { User } from '@apis/users/entities/user.entity';
import { Permissions } from '@libs/decorators/permissions.decorator';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { Permission } from '@libs/enums';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { DeletePostDto, RestorePostDto } from './dto/action-post.dto';
import { DeleteUserDto, RestoreUserDto } from './dto/action-user.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Permissions(Permission.ADMIN_GET_REMOVED_POSTS)
  @ApiOperation({ summary: 'Admin get removed posts' })
  @ResponseMessage('Admin get removed posts successfully')
  @Get('removed-posts')
  async getRemovedPosts() {
    return await this.adminService.getRemovedPosts();
  }

  @Permissions(Permission.ADMIN_GET_REMOVED_POST_DETAIL)
  @ApiOperation({ summary: 'Admin get removed post detail' })
  @ResponseMessage('Admin get removed post detail successfully')
  @Get('removed-post/:id')
  async getRemovedPostDetail(@Param('id') id: number) {
    return await this.adminService.getRemovedPostDetail(id);
  }

  @Permissions(Permission.ADMIN_REMOVE_POST)
  @ApiOperation({ summary: 'Admin remove post' })
  @ResponseMessage('Admin remove post successfully')
  @Patch('remove-post')
  async adminRemovePost(
    @Body() deletePostDto: DeletePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.adminService.removePost(deletePostDto, user);
  }

  @Permissions(Permission.ADMIN_RESTORE_POST)
  @ApiOperation({ summary: 'Admin restore post' })
  @ResponseMessage('Admin restore post successfully')
  @Patch('restore-post')
  async restorePost(@Body() restorePostDto: RestorePostDto) {
    return await this.adminService.restorePost(restorePostDto);
  }

  @Permissions(Permission.ADMIN_GET_REMOVED_USERS)
  @ApiOperation({ summary: 'Admin get removed users' })
  @ResponseMessage('Admin get removed users successfully')
  @Get('removed-users')
  async getRemovedUsers() {
    return await this.adminService.getRemovedUsers();
  }

  @Permissions(Permission.ADMIN_GET_REMOVED_USER_DETAIL)
  @ApiOperation({ summary: 'Admin get removed user detail' })
  @ResponseMessage('Admin get removed user detail successfully')
  @Get('removed-user/:id')
  async getRemovedUserDetail(@Param('id') id: number) {
    return await this.adminService.getRemovedUserDetail(id);
  }

  @Permissions(Permission.ADMIN_REMOVE_USER)
  @ApiOperation({ summary: 'Admin remove user' })
  @ResponseMessage('Admin remove user successfully')
  @Patch('remove-user')
  async adminRemoveUser(
    @Body() deleteUserDto: DeleteUserDto,
    @CurrentUser() user: User,
  ) {
    return await this.adminService.removeUser(deleteUserDto, user);
  }

  @Permissions(Permission.ADMIN_RESTORE_USER)
  @ApiOperation({ summary: 'Admin restore user' })
  @ResponseMessage('Admin restore user successfully')
  @Patch('restore-user')
  async restoreUser(@Body() restoreUserDto: RestoreUserDto) {
    return await this.adminService.restoreUser(restoreUserDto);
  }
}
