import { User } from '@apis/users/entities/user.entity';
import { Permissions } from '@libs/decorators/permissions.decorator';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { Permission } from '@libs/enums';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { DeletePostDto, RestorePostDto } from './dto/action-post.dto';
import { DeleteUserDto, RestoreUserDto } from './dto/action-user.dto';
import { QueryListDto } from '@libs/base/base.dto';
import { Roles } from '@libs/decorators/roles.decorator';
import { Roles as Role } from '@libs/enums';
import { SearchUserDto } from './dto/search.dto';

@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Admin search user' })
  @ResponseMessage('Admin search user successfully')
  @Get('users/search')
  async searchUser(@Query() query: SearchUserDto) {
    return await this.adminService.searchUser(query);
  }

  @Permissions(Permission.ADMIN_GET_REMOVED_POSTS)
  @ApiOperation({ summary: 'Admin get removed posts' })
  @ResponseMessage('Admin get removed posts successfully')
  @Get('removed-posts')
  async getRemovedPosts(@Query() query: QueryListDto) {
    return await this.adminService.getRemovedPosts(query);
  }

  @Permissions(Permission.ADMIN_GET_REMOVED_POSTS_BY_USER)
  @ApiOperation({ summary: 'Admin get removed posts by user' })
  @ResponseMessage('Admin get removed posts by user successfully')
  @Get('removed-posts-by-user')
  async getRemovedPostsByUser(@Query() query: QueryListDto) {
    return await this.adminService.getRemovedPostsByUser(query);
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
  async getRemovedUsers(@Query() query: QueryListDto) {
    return await this.adminService.getRemovedUsers(query);
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

  @Permissions(Permission.ADMIN_GET_REMOVED_USERS_BY_USER)
  @ApiOperation({ summary: 'Admin get removed users by user' })
  @ResponseMessage('Admin get removed users by user successfully')
  @Get('removed-users-by-user')
  async getRemovedUsersByUser(@Query() query: QueryListDto) {
    return await this.adminService.getRemovedUsersByUser(query);
  }
}
