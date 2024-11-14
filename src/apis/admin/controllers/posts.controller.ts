import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '@libs/decorators/roles.decorator';
import { Permission, Roles as Role } from '@libs/enums';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostsService } from '../services/posts.service';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { Permissions } from '@libs/decorators/permissions.decorator';
import { DeletePostDto, GetAdminPostListDto } from '../dto/admin-post.dto';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { User } from '@apis/users/entities/user.entity';

@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiTags('Admin Posts')
@Controller('admin/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Permissions(Permission.ADMIN_GET_POSTS)
  @ApiOperation({ summary: 'Admin get posts' })
  @ResponseMessage('Admin get posts successfully')
  @Get('')
  async getPosts(@Query() query: GetAdminPostListDto) {
    return await this.postsService.getPosts(query);
  }

  @Permissions(Permission.ADMIN_GET_POST_DETAIL)
  @ApiOperation({ summary: 'Admin get post detail' })
  @ResponseMessage('Admin get post detail successfully')
  @Get(':id')
  async getPostsById(@Param('id') id: number) {
    return await this.postsService.getPostsById(+id);
  }

  @Permissions(Permission.ADMIN_GET_POSTS_OF_USER)
  @ApiOperation({ summary: 'Admin get posts of user' })
  @ResponseMessage('Admin get posts of user successfully')
  @Get('users/:userId')
  async getPostsOfUser(
    @Param('userId') userId: number,
    @Query() query: GetAdminPostListDto,
  ) {
    return await this.postsService.getPostsOfUser(+userId, query);
  }

  @Permissions(Permission.ADMIN_DELETE_POST)
  @ApiOperation({ summary: 'Admin delete post' })
  @ResponseMessage('Admin delete post successfully')
  @Delete(':id')
  async deletePost(
    @Param('id') id: number,
    @CurrentUser() user: User,
    @Body() body: DeletePostDto,
  ) {
    return await this.postsService.deletePost(+id, user, body);
  }

  @Permissions(Permission.ADMIN_RESTORE_POST)
  @ApiOperation({ summary: 'Admin restore post' })
  @ResponseMessage('Admin restore post successfully')
  @Post(':id/restore')
  async restorePost(@Param('id') id: number) {
    return await this.postsService.restorePost(+id);
  }
}
