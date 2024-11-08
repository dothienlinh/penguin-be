import { Post } from '@apis/posts/entities/post.entity';
import { User } from '@apis/users/entities/user.entity';
import { ErrorHandler } from '@libs/utils/error-handler.utils';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { PostsService } from '@apis/posts/posts.service';
import { ListCommentDto } from './dto/list-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly postsService: PostsService,
  ) {}

  private readonly logger = new Logger(CommentsService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  async findOne(id: number) {
    const comment = await this.commentsRepository.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async getReplyComments(comment: Comment, post: Post) {
    try {
      const replyComments = await this.commentsRepository
        .createQueryBuilder('comment')
        .leftJoin('comment.likes', 'likes')
        .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
        .leftJoin('comment.replyComments', 'replyComments')
        .loadRelationCountAndMap(
          'comment.replyCommentCount',
          'comment.replyComments',
        )
        .where('comment.parent_comment_id = :id', { id: comment.id })
        .andWhere('comment.post_id = :postId', { postId: post.id })
        .getMany();
      return plainToInstance(Comment, replyComments);
    } catch (error) {
      this.handleError(error, 'Get reply comments failed');
    }
  }

  async findOneCommentAllRelations(
    id: number,
    post: Post,
    user: User,
    withDeleted: boolean = false,
  ) {
    try {
      const comment = await this.commentsRepository.findOne({
        where: {
          id,
          post: { id: post.id },
          user: { id: user.id },
        },
        relations: {
          likes: true,
          replyComments: true,
        },
        withDeleted,
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
      return comment;
    } catch (error) {
      this.handleError(error, 'Get comment all relations failed');
    }
  }

  async listCommentPost(postId: number, query: ListCommentDto) {
    try {
      await this.postsService.isPostExist(postId);

      const { orderBy, page, parentCommentId, size } = query;

      const comments = await this.commentsRepository
        .createQueryBuilder('comment')
        .leftJoin('comment.likes', 'likes')
        .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
        .leftJoin('comment.replyComments', 'replyComments')
        .loadRelationCountAndMap(
          'comment.replyCommentCount',
          'comment.replyComments',
        )
        .where(
          `comment.post_id = :postId ${
            parentCommentId
              ? 'AND comment.parent_comment_id = :parentCommentId'
              : ''
          }`,
          { postId, ...(parentCommentId && { parentCommentId }) },
        )
        .orderBy('comment.created_at', orderBy)
        .limit(size)
        .offset((page - 1) * size)
        .getMany();
      return plainToInstance(Comment, comments);
    } catch (error) {
      this.handleError(error, 'Get comments failed');
    }
  }

  async createComment(createCommentDto: CreateCommentDto, user: User) {
    try {
      const { content, postId, parentCommentId } = createCommentDto;

      await this.postsService.isPostExist(postId);

      if (parentCommentId) {
        await this.findOne(parentCommentId);
      }

      const comment = await this.commentsRepository
        .create({
          content,
          ...(parentCommentId && {
            parentComment: { id: parentCommentId },
          }),
          post: { id: postId },
          user: { id: user.id },
        })
        .save();

      return plainToInstance(Comment, comment);
    } catch (error) {
      this.handleError(error, 'Create comment failed');
    }
  }

  async deleteComment(id: number) {
    try {
      const comment = await this.commentsRepository.findOne({
        where: { id },
        relations: { likes: true, replyComments: true },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      return this.commentsRepository.softRemove(comment);
    } catch (error) {
      this.handleError(error, 'Delete comment failed');
    }
  }

  async restoreComment(id: number) {
    try {
      const comment = await this.commentsRepository.findOne({
        where: {
          id,
        },
        relations: { likes: true, replyComments: true },
        withDeleted: true,
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const restoredComment = await this.commentsRepository.recover(comment);

      return plainToInstance(Comment, restoredComment);
    } catch (error) {
      this.handleError(error, 'Restore comment failed');
    }
  }
}
