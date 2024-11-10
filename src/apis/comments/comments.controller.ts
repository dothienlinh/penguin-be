import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { User } from '@apis/users/entities/user.entity';
import { Permissions } from '@libs/decorators/permissions.decorator';
import { Permission } from '@libs/enums';
import { QueryListDto } from '@libs/base/base.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Permissions(Permission.CREATE_COMMENT)
  @Post()
  @ApiOperation({ summary: 'Create a comment or reply comment' })
  @ResponseMessage('Create a comment successfully')
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.createComment(createCommentDto, user);
  }

  @Get('posts/:postId')
  @ApiOperation({
    summary: 'Get list comment of post comment',
  })
  @ResponseMessage('Get list comment of post successfully')
  async getListCommentOfPost(
    @Param('postId') postId: number,
    @Query() query: QueryListDto,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.listCommentPost(+postId, query, user);
  }

  @Get('posts/:postId/parent-comment/:commentId/replies')
  @ApiOperation({
    summary: 'Get list reply comment of comment',
  })
  @ResponseMessage('Get list reply comment of comment successfully')
  async getListReplyCommentOfComment(
    @Param('commentId') commentId: number,
    @Param('postId') postId: number,
    @Query() query: QueryListDto,
  ) {
    return await this.commentsService.listReplyComment(
      +commentId,
      +postId,
      query,
    );
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a comment' })
  @ResponseMessage('Restore a comment successfully')
  async restoreComment(@Param('id') id: number, @CurrentUser() user: User) {
    return await this.commentsService.restoreComment(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ResponseMessage('Delete a comment successfully')
  async deleteComment(@Param('id') id: number, @CurrentUser() user: User) {
    return await this.commentsService.deleteComment(id, user);
  }
}
