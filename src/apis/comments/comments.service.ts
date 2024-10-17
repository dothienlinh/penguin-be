import { LikesService } from '@apis/likes/likes.service';
import { Post } from '@apis/posts/entities/post.entity';
import { User } from '@apis/users/entities/user.entity';
import { ErrorHandler } from '@libs/utils/error-handler';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyCommentDto } from './dto/create-reply-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly likesService: LikesService,
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

  async create(createCommentDto: CreateCommentDto) {
    try {
      const comment = this.commentsRepository.create(createCommentDto);
      await this.commentsRepository.save(comment);
      return { success: true };
    } catch (error) {
      this.handleError(error, 'Create comment failed');
    }
  }

  async createReplyComment(createReplyCommentDto: CreateReplyCommentDto) {
    try {
      const comment = this.commentsRepository.create(createReplyCommentDto);
      await this.commentsRepository.save(comment);
      return { success: true };
    } catch (error) {
      this.handleError(error, 'Create reply comment failed');
    }
  }

  async listCommentPost(post: Post) {
    try {
      const comments = await this.commentsRepository
        .createQueryBuilder('comment')
        .leftJoin('comment.likes', 'likes')
        .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
        .leftJoin('comment.replyComments', 'replyComments')
        .loadRelationCountAndMap(
          'comment.replyCommentCount',
          'comment.replyComments',
        )
        .where('comment.post_id = :postId', { postId: post.id })
        .getMany();
      return plainToInstance(Comment, comments);
    } catch (error) {
      this.handleError(error, 'Get comments failed');
    }
  }

  async remove(id: number, post: Post, user: User) {
    try {
      const comment = await this.findOneCommentAllRelations(
        id,
        post,
        user,
        true,
      );
      return this.commentsRepository.softRemove(comment);
    } catch (error) {
      this.handleError(error, 'Remove comment failed');
    }
  }

  async restore(id: number, post: Post, user: User) {
    try {
      const comment = await this.findOneCommentAllRelations(
        id,
        post,
        user,
        true,
      );
      return this.commentsRepository.recover(comment);
    } catch (error) {
      this.handleError(error, 'Restore comment failed');
    }
  }
}
