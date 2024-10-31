import { AddCommentDto } from '@apis/comments/dto/add-comment.dto';
import { User } from '@apis/users/entities/user.entity';
import { Permissions } from '@libs/decorators/permissions.decorator';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { Permission } from '@libs/enums';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto, UpdatePostStatus } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { ListPostDto } from './dto/list-post.dto';
import { SearchPostDto } from './dto/search-post.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Permissions(Permission.READ_POST)
  @Post()
  @ApiOperation({ summary: 'Create post' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreatePostDto,
  })
  async create(
    @Body(new ValidationPipe({ transform: true }))
    createPostDto: CreatePostDto,
    @CurrentUser() user: User,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    return await this.postsService.create(
      {
        ...createPostDto,
        images: files.images || [],
        thumbnail: files.thumbnail?.[0],
      },
      user,
    );
  }

  @Permissions(Permission.WRITE_COMMENT)
  @Post(':id/comment')
  @ApiOperation({ summary: 'Add comment to post' })
  async addComment(
    @Param('id') id: number,
    @Body() addCommentDto: AddCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.addComment(user, +id, addCommentDto.content);
  }

  @Permissions(Permission.WRITE_LIKE)
  @Post(':id/like')
  @ApiOperation({ summary: 'Add like to post' })
  async addLikePost(@Param('id') id: number, @CurrentUser() user: User) {
    return await this.postsService.addLikePost(user, +id);
  }

  @Permissions(Permission.UPDATE_POST)
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore post' })
  async restore(@Param('id') id: number) {
    return await this.postsService.restore(+id);
  }

  @Permissions(Permission.UPDATE_COMMENT)
  @Post(':id/restore-comment/:commentId')
  @ApiOperation({ summary: 'Restore comment of post' })
  async restoreComment(
    @Param('id') id: number,
    @Param('commentId') commentId: number,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.restoreComment(+id, +commentId, user);
  }

  @Permissions(Permission.WRITE_COMMENT)
  @Post(':id/comment/:commentId/reply')
  @ApiOperation({ summary: 'Add reply comment to post' })
  async addReplyComment(
    @Param('id') id: number,
    @Param('commentId') commentId: number,
    @Body() addCommentDto: AddCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.addReplyComment(
      user,
      +id,
      +commentId,
      addCommentDto,
    );
  }

  @Permissions(Permission.UPDATE_SHARE)
  @Post(':id/shares/:shareId/restore')
  @ApiOperation({ summary: 'Restore a soft deleted share' })
  async restoreShare(
    @Param('id') id: number,
    @Param('shareId') shareId: number,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.restoreShare(user, +id, +shareId);
  }

  @Permissions(Permission.READ_POST)
  @Get('search')
  @ApiOperation({ summary: 'Search posts' })
  async searchPosts(@Query() query: SearchPostDto) {
    return await this.postsService.searchPosts(query);
  }

  @Permissions(Permission.READ_POST)
  @Get('my-drafts')
  @ApiOperation({ summary: 'List my post drafts' })
  async listMyPostDraft(
    @CurrentUser() user: User,
    @Query() query: ListPostDto,
  ) {
    return await this.postsService.listMyPostDraft(user, query);
  }

  @Permissions(Permission.READ_SHARE)
  @Get('shared')
  @ApiOperation({ summary: 'Get shared posts' })
  async getSharedPosts(@CurrentUser() user: User) {
    return await this.postsService.getSharedPosts(user);
  }

  @Permissions(Permission.READ_SHARE)
  @Get(':id/shares')
  @ApiOperation({ summary: 'Get post shares' })
  async getPostShares(@Param('id') id: number) {
    return await this.postsService.getPostShares(+id);
  }

  @Permissions(Permission.READ_COMMENT)
  @Get(':id/comments')
  @ApiOperation({ summary: 'List comment of post' })
  async listCommentPost(@Param('id') id: number) {
    return await this.postsService.listCommentPost(+id);
  }

  @Permissions(Permission.READ_POST)
  @Get('my-posts')
  @ApiOperation({ summary: 'List my posts' })
  async myPosts(@CurrentUser() user: User, @Query() query: ListPostDto) {
    return await this.postsService.myPosts(user, query);
  }

  @Permissions(Permission.READ_LIKE)
  @Get('list-user-liked-post/:id')
  @ApiOperation({ summary: 'List user liked post' })
  async listUserLikedPost(@Param('id') id: number) {
    return await this.postsService.listUserLikedPost(+id);
  }

  @Permissions(Permission.READ_POST)
  @Get()
  @ApiOperation({ summary: 'List all posts' })
  async findAll(@Query() query: ListPostDto) {
    return await this.postsService.findAll(query);
  }

  @Permissions(Permission.READ_POST)
  @Get(':id')
  @ApiOperation({ summary: 'Get post by id' })
  async findOne(@Param('id') id: number) {
    return await this.postsService.findOne(+id);
  }

  @Permissions(Permission.READ_COMMENT)
  @Get(':id/comments/:commentId/reply')
  @ApiOperation({ summary: 'List reply comment of post' })
  async listReplyComment(
    @Param('id') id: number,
    @Param('commentId') commentId: number,
  ) {
    return await this.postsService.listReplyComment(+id, +commentId);
  }

  @Permissions(Permission.UPDATE_STATUS_POST)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update status of post' })
  async updateStatus(
    @Param('id') id: number,
    @Body() updatePostStatus: UpdatePostStatus,
  ) {
    return await this.postsService.updateToStatus(+id, updatePostStatus.status);
  }

  @Permissions(Permission.UPDATE_TO_DRAFT)
  @Patch(':id/draft')
  @ApiOperation({ summary: 'Update to draft of post' })
  async updateToDraft(@Param('id') id: number, @CurrentUser() user: User) {
    return await this.postsService.updateToDraft(+id, user);
  }

  @Permissions(Permission.UPDATE_POST)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdatePostDto,
  })
  @ApiOperation({ summary: 'Update post' })
  async update(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    return await this.postsService.update(+id, {
      ...updatePostDto,
      images: files.images || [],
      thumbnail: files.thumbnail?.[0],
    });
  }

  @Permissions(Permission.DELETE_LIKE)
  @Delete(':id/like')
  @ApiOperation({ summary: 'Remove like from post' })
  async unLikePost(@Param('id') id: number, @CurrentUser() user: User) {
    return await this.postsService.unLikePost(user, +id);
  }

  @Permissions(Permission.DELETE_POST)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  async remove(@Param('id') id: number) {
    return await this.postsService.remove(+id);
  }

  @Permissions(Permission.DELETE_COMMENT)
  @Delete(':id/comment/:commentId')
  @ApiOperation({ summary: 'Delete comment of post' })
  async removeComment(
    @Param('id') id: number,
    @Param('commentId') commentId: number,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.removeComment(+id, +commentId, user);
  }

  @Permissions(Permission.WRITE_SHARE)
  @Post(':id/share')
  @ApiOperation({ summary: 'Share a post' })
  async sharePost(@Param('id') id: number, @CurrentUser() user: User) {
    return await this.postsService.sharePost(user, +id);
  }

  @Permissions(Permission.DELETE_SHARE)
  @Delete(':id/shares/:shareId')
  @ApiOperation({ summary: 'Soft delete a share' })
  async unsharePost(
    @Param('id') id: number,
    @Param('shareId') shareId: number,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.unsharePost(user, +id, +shareId);
  }
}
