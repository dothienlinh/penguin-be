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

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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

  @Post()
  @ApiOperation({ summary: 'Create post' })
  async create(
    @Body(new ValidationPipe({ transform: true }))
    createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.create(createPostDto, user);
  }

  @Post(':id/comment')
  @ApiOperation({ summary: 'Add comment to post' })
  async addComment(
    @Param('id') id: string,
    @Body() addCommentDto: AddCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.addComment(user, +id, addCommentDto.content);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Add like to post' })
  async addLikePost(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.postsService.addLikePost(user, +id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore post' })
  async restore(@Param('id') id: string) {
    return await this.postsService.restore(+id);
  }

  @Post(':id/restore-comment/:commentId')
  @ApiOperation({ summary: 'Restore comment of post' })
  async restoreComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.restoreComment(+id, +commentId, user);
  }

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

  @Get(':id/comments')
  @ApiOperation({ summary: 'List comment of post' })
  async listCommentPost(@Param('id') id: string) {
    return await this.postsService.listCommentPost(+id);
  }

  @Get('my-posts')
  @ApiOperation({ summary: 'List my posts' })
  async myPosts(@CurrentUser() user: User) {
    return await this.postsService.myPosts(user);
  }

  @Get('list-user-liked-post/:id')
  @ApiOperation({ summary: 'List user liked post' })
  async listUserLikedPost(@Param('id') id: string) {
    return await this.postsService.listUserLikedPost(+id);
  }

  @Get()
  @ApiOperation({ summary: 'List all posts' })
  async findAll() {
    return await this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by id' })
  async findOne(@Param('id') id: string) {
    return await this.postsService.findOne(+id);
  }

  @Get(':id/comments/:commentId/reply')
  @ApiOperation({ summary: 'List reply comment of post' })
  async listReplyComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return await this.postsService.listReplyComment(+id, +commentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post' })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return await this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id/like')
  @ApiOperation({ summary: 'Remove like from post' })
  async unLikePost(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.postsService.unLikePost(user, +id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  async remove(@Param('id') id: string) {
    return await this.postsService.remove(+id);
  }

  @Delete(':id/comment/:commentId')
  @ApiOperation({ summary: 'Delete comment of post' })
  async removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.removeComment(+id, +commentId, user);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share a post' })
  async sharePost(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.postsService.sharePost(user, +id);
  }

  @Delete(':id/shares/:shareId')
  @ApiOperation({ summary: 'Soft delete a share' })
  async unsharePost(
    @Param('id') id: string,
    @Param('shareId') shareId: string,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.unsharePost(user, +id, +shareId);
  }

  @Post(':id/shares/:shareId/restore')
  @ApiOperation({ summary: 'Restore a soft deleted share' })
  async restoreShare(
    @Param('id') id: string,
    @Param('shareId') shareId: string,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.restoreShare(user, +id, +shareId);
  }

  @Get('shared')
  @ApiOperation({ summary: 'Get shared posts' })
  async getSharedPosts(@CurrentUser() user: User) {
    return await this.postsService.getSharedPosts(user);
  }

  @Get(':id/shares')
  @ApiOperation({ summary: 'Get post shares' })
  async getPostShares(@Param('id') id: string) {
    return await this.postsService.getPostShares(+id);
  }
}
