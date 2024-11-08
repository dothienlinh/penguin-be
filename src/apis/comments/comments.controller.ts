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
import { ListCommentDto } from './dto/list-comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a comment or reply comment' })
  @ResponseMessage('Create a comment successfully')
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.createComment(createCommentDto, user);
  }

  @Get('comments/:postId')
  @ApiOperation({
    summary: 'Get list comment of post or list reply comment of comment',
  })
  @ResponseMessage('Get list comment of post successfully')
  async getListCommentOfPost(
    @Param('postId') postId: number,
    @Query() query: ListCommentDto,
  ) {
    return await this.commentsService.listCommentPost(+postId, query);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a comment' })
  @ResponseMessage('Restore a comment successfully')
  async restoreComment(@Param('id') id: number) {
    return await this.commentsService.restoreComment(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ResponseMessage('Delete a comment successfully')
  async deleteComment(@Param('id') id: number) {
    return await this.commentsService.deleteComment(id);
  }
}
