import { AddCommentDto } from '@apis/comments/dto/add-comment.dto';
import { User } from '@apis/users/entities/user.entity';
import { Permissions } from '@libs/decorators/permissions.decorator';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { Permission } from '@libs/enums';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostDeleteDto, ListPostDto } from './dto/list-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UploadImagePostDto } from './dto/upload-image-post.dto';
import { PostsService } from './posts.service';
import { GetPostDto } from './dto/get-post.dto';
import { DeletePostImagesDto } from './dto/dalete-post-images.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create post' })
  async create(
    @Body(new ValidationPipe({ transform: true }))
    createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.create(createPostDto, user);
  }

  @Permissions(Permission.UPDATE_POST)
  @Post('/:id/upload-images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImagePostDto })
  @ApiOperation({ summary: 'Upload image to post' })
  @ResponseMessage('Uploaded image successfully')
  async uploadImagePost(
    @Param('id') id: number,
    @Body() body: UploadImagePostDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return await this.postsService.uploadImagePost(
      +id,
      file.filename,
      body,
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
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore post' })
  async restore(@Param('id') id: number, @CurrentUser() user: User) {
    return await this.postsService.restore(+id, user);
  }

  @Permissions(Permission.UPDATE_COMMENT)
  @Patch(':id/restore-comment/:commentId')
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
  @Patch(':id/shares/:shareId/restore')
  @ApiOperation({ summary: 'Restore a soft deleted share' })
  async restoreShare(
    @Param('id') id: number,
    @Param('shareId') shareId: number,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.restoreShare(user, +id, +shareId);
  }

  @Permissions(Permission.WRITE_SHARE)
  @Post(':id/share')
  @ApiOperation({ summary: 'Share a post' })
  async sharePost(@Param('id') id: number, @CurrentUser() user: User) {
    return await this.postsService.sharePost(user, +id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search posts' })
  async searchPosts(@Query() query: SearchPostDto) {
    return await this.postsService.searchPosts(query);
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

  @Permissions(Permission.READ_LIKE)
  @Get('list-user-liked-post/:id')
  @ApiOperation({ summary: 'List user liked post' })
  async listUserLikedPost(@Param('id') id: number) {
    return await this.postsService.listUserLikedPost(+id);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get deleted posts of current user' })
  async getDeletedPosts(
    @Query() query: ListPostDeleteDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.getDeletedPosts(query, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all posts' })
  async findAll(@Query() query: ListPostDto, @CurrentUser() user: User) {
    return await this.postsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by id' })
  async getDetailPost(
    @Param('id') id: number,
    @Query() query: GetPostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.getDetailPost(+id, query, user);
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

  @Permissions(Permission.UPDATE_POST)
  @Patch(':id')
  @ApiOperation({ summary: 'Update post' })
  async update(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.update(+id, updatePostDto, user);
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

  @Permissions(Permission.UPDATE_POST)
  @Delete(':id/images')
  @ApiOperation({ summary: 'Delete image of post' })
  async deleteImage(
    @Param('id') id: number,
    @Body() body: DeletePostImagesDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.deleteImage(+id, body.imageIds, user);
  }

  @Permissions(
    Permission.PERMANENTLY_DELETE_POST,
    Permission.USER_HAS_PERMISSION,
  )
  @Delete(':id/draft')
  @ApiOperation({ summary: 'Permanently delete draft post' })
  async permanentlyDeleteDraftPost(
    @Param('id') id: number,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.permanentlyDeleteDraftPost(+id, user);
  }
}
