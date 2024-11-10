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

  @Post('')
  @ApiOperation({ summary: 'Like a target' })
  @ResponseMessage('Like a target successfully')
  async likeTarget(
    @Body() createLikeDto: CreateLikeDto,
    @CurrentUser() user: User,
  ) {
    return await this.likesService.like(createLikeDto, user);
  }

  @Delete('')
  @ApiOperation({ summary: 'Unlike a target' })
  @ResponseMessage('Unlike a target successfully')
  async unLikeTarget(
    @Body() createLikeDto: CreateLikeDto,
    @CurrentUser() user: User,
  ) {
    return await this.likesService.unLike(createLikeDto, user);
  }
}
