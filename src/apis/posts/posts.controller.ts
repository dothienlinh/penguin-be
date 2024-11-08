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
import { QueryListDto } from '@libs/base/base.dto';

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

  @Permissions(Permission.UPDATE_POST)
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore post' })
  async restore(@Param('id') id: number, @CurrentUser() user: User) {
    return await this.postsService.restore(+id, user);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search posts' })
  async searchPosts(@Query() query: SearchPostDto) {
    return await this.postsService.searchPosts(query);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get deleted posts of current user' })
  async getDeletedPosts(
    @Query() query: ListPostDeleteDto,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.getDeletedPosts(query, user);
  }

  @Get('saves')
  @ApiOperation({ summary: 'List all saves of post' })
  async listSaves(@Query() query: QueryListDto, @CurrentUser() user: User) {
    return await this.postsService.listSaves(query, user);
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

  @Permissions(Permission.DELETE_POST)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  async remove(@Param('id') id: number) {
    return await this.postsService.remove(+id);
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
