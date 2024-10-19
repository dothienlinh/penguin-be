import { AddCommentDto } from '@apis/comments/dto/add-comment.dto';
import { User } from '@apis/users/entities/user.entity';
import { CurrentUser } from '@libs/decorators/user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { CreatePostWithImagesDto } from './dto/create-post-with-images.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { Permissions } from '@libs/decorators/permissions.decorator';
import { Permission } from '@libs/enums';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Permissions(Permission.READ_POST)
  @Post('with-images')
  @ApiOperation({ summary: 'Create post with images' })
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreatePostWithImagesDto,
  })
  async createWithImages(
    @Body(new ValidationPipe({ transform: true }))
    createPostWithImagesDto: CreatePostWithImagesDto,
    @CurrentUser() user: User,
    @UploadedFiles(new ParseFilePipe({ validators: [] }))
    images: Array<Express.Multer.File>,
  ) {
    return await this.postsService.createWithImages(
      { ...createPostWithImagesDto, images },
      user,
    );
  }

  @Permissions(Permission.WRITE_POST)
  @Post()
  @ApiOperation({ summary: 'Create post' })
  async create(
    @Body(new ValidationPipe({ transform: true }))
    createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.create(createPostDto, user);
  }

  @Permissions(Permission.WRITE_COMMENT)
  @Post(':id/comment')
  @ApiOperation({ summary: 'Add comment to post' })
  async addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.addComment(user, +id, addCommentDto.content);
  }

  @Permissions(Permission.WRITE_LIKE)
  @Post(':id/like')
  @ApiOperation({ summary: 'Add like to post' })
  async addLikePost(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.postsService.addLikePost(user, +id);
  }

  @Permissions(Permission.UPDATE_POST)
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore post' })
  async restore(@Param('id') id: string) {
    return await this.postsService.restore(+id);
  }

  @Permissions(Permission.UPDATE_COMMENT)
  @Post(':id/restore-comment/:commentId')
  @ApiOperation({ summary: 'Restore comment of post' })
  async restoreComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.restoreComment(+id, +commentId, user);
  }

  @Permissions(Permission.WRITE_COMMENT)
  @Post(':id/comment/:commentId/reply')
  @ApiOperation({ summary: 'Add reply comment to post' })
  async addReplyComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
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

  @Permissions(Permission.READ_COMMENT)
  @Get(':id/comments')
  @ApiOperation({ summary: 'List comment of post' })
  async listCommentPost(@Param('id') id: string) {
    return await this.postsService.listCommentPost(+id);
  }

  @Permissions(Permission.READ_POST)
  @Get('my-posts')
  @ApiOperation({ summary: 'List my posts' })
  async myPosts(@CurrentUser() user: User) {
    return await this.postsService.myPosts(user);
  }

  @Permissions(Permission.READ_LIKE)
  @Get('list-user-liked-post/:id')
  @ApiOperation({ summary: 'List user liked post' })
  async listUserLikedPost(@Param('id') id: string) {
    return await this.postsService.listUserLikedPost(+id);
  }

  @Permissions(Permission.READ_POST)
  @Get()
  @ApiOperation({ summary: 'List all posts' })
  async findAll() {
    return await this.postsService.findAll();
  }

  @Permissions(Permission.READ_POST)
  @Get(':id')
  @ApiOperation({ summary: 'Get post by id' })
  async findOne(@Param('id') id: string) {
    return await this.postsService.findOne(+id);
  }

  @Permissions(Permission.READ_COMMENT)
  @Get(':id/comments/:commentId/reply')
  @ApiOperation({ summary: 'List reply comment of post' })
  async listReplyComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return await this.postsService.listReplyComment(+id, +commentId);
  }

  @Permissions(Permission.UPDATE_POST)
  @Patch(':id')
  @ApiOperation({ summary: 'Update post' })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return await this.postsService.update(+id, updatePostDto);
  }

  @Permissions(Permission.DELETE_LIKE)
  @Delete(':id/like')
  @ApiOperation({ summary: 'Remove like from post' })
  async unLikePost(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.postsService.unLikePost(user, +id);
  }

  @Permissions(Permission.DELETE_POST)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  async remove(@Param('id') id: string) {
    return await this.postsService.remove(+id);
  }

  @Permissions(Permission.DELETE_COMMENT)
  @Delete(':id/comment/:commentId')
  @ApiOperation({ summary: 'Delete comment of post' })
  async removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.removeComment(+id, +commentId, user);
  }

  @Permissions(Permission.WRITE_SHARE)
  @Post(':id/share')
  @ApiOperation({ summary: 'Share a post' })
  async sharePost(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.postsService.sharePost(user, +id);
  }

  @Permissions(Permission.DELETE_SHARE)
  @Delete(':id/shares/:shareId')
  @ApiOperation({ summary: 'Soft delete a share' })
  async unsharePost(
    @Param('id') id: string,
    @Param('shareId') shareId: string,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.unsharePost(user, +id, +shareId);
  }

  @Permissions(Permission.UPDATE_SHARE)
  @Post(':id/shares/:shareId/restore')
  @ApiOperation({ summary: 'Restore a soft deleted share' })
  async restoreShare(
    @Param('id') id: string,
    @Param('shareId') shareId: string,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.restoreShare(user, +id, +shareId);
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
  async getPostShares(@Param('id') id: string) {
    return await this.postsService.getPostShares(+id);
  }
}
