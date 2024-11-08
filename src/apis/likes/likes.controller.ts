import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { User } from '@apis/users/entities/user.entity';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { ListUserLikedPostDto } from './dto/list-user-liked-post.dto';

@ApiTags('Likes')
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get('users-liked/:id')
  @ApiOperation({ summary: 'List user liked post' })
  async listUserLikedPost(
    @Param('id') id: number,
    @Query() query: ListUserLikedPostDto,
  ) {
    return await this.likesService.listUserLikedPost(+id, query);
  }

  @Post('post')
  @ApiOperation({ summary: 'Like a post' })
  @ResponseMessage('Like a post successfully')
  async likePost(
    @Body() createLikeDto: CreateLikeDto,
    @CurrentUser() user: User,
  ) {
    return await this.likesService.like(createLikeDto, user);
  }

  @Delete('post')
  @ApiOperation({ summary: 'Unlike a post' })
  @ResponseMessage('Unlike a post successfully')
  async unLikePost(
    @Body() createLikeDto: CreateLikeDto,
    @CurrentUser() user: User,
  ) {
    return await this.likesService.unLike(createLikeDto, user);
  }

  @Post('comment')
  @ApiOperation({ summary: 'Like a comment' })
  @ResponseMessage('Like a comment successfully')
  async likeComment(
    @Body() createLikeDto: CreateLikeDto,
    @CurrentUser() user: User,
  ) {
    return await this.likesService.like(createLikeDto, user);
  }

  @Delete('comment')
  @ApiOperation({ summary: 'Unlike a comment' })
  @ResponseMessage('Unlike a comment successfully')
  async unLikeComment(
    @Body() createLikeDto: CreateLikeDto,
    @CurrentUser() user: User,
  ) {
    return await this.likesService.unLike(createLikeDto, user);
  }
}
