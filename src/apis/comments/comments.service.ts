import { Post } from '@apis/posts/entities/post.entity';
import { User } from '@apis/users/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { PostsService } from '@apis/posts/posts.service';
import { AccessControl } from '@libs/utils/access-control.util';
import { QueryListDto } from '@libs/base/base.dto';
import { responsePagination } from '@libs/utils/response-pagination.util';
import { LikeType } from '@libs/enums';
import { BaseService } from '@libs/base/base.service';

@Injectable()
export class CommentsService extends BaseService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly postsService: PostsService,
  ) {
    super(CommentsService.name);
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
        .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
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

  async listCommentPost(postId: number, query: QueryListDto, user: User) {
    try {
      await this.postsService.isPostExist(postId);

      const { orderBy, page, size } = query;

      const queryBuilder = this.commentsRepository
        .createQueryBuilder('comment')
        .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
        .loadRelationCountAndMap(
          'comment.replyCommentCount',
          'comment.replyComments',
        )
        .where(
          `comment.post_id = :postId AND comment.parent_comment_id IS NULL`,
          {
            postId,
          },
        )
        .leftJoin('comment.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.avatar'])
        .leftJoinAndSelect(
          'comment.likes',
          'likes',
          'likes.user_id = :userId AND likes.target_type = :targetType',
          {
            userId: user.id,
            targetType: LikeType.COMMENT,
          },
        )
        .orderBy('comment.created_at', orderBy)
        .limit(size)
        .offset((page - 1) * size);

      const result = await responsePagination(
        queryBuilder,
        page,
        size,
        Comment,
      );

      return {
        ...result,
        result: result.result.map((comment) => ({
          ...comment,
          likes: undefined,
          isLiked: comment.likes.length > 0,
        })),
      };
    } catch (error) {
      this.handleError(error, 'Get comments failed');
    }
  }

  async listReplyComment(
    commentId: number,
    postId: number,
    query: QueryListDto,
  ) {
    try {
      await Promise.all([
        this.postsService.isPostExist(postId),
        this.findOne(commentId),
      ]);

      const { orderBy, page, size } = query;

      const queryBuilder = this.commentsRepository
        .createQueryBuilder('comment')
        .distinct(true)
        .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
        .loadRelationCountAndMap(
          'comment.replyCommentCount',
          'comment.replyComments',
        )
        .leftJoin('comment.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.avatar'])
        .where('comment.parent_comment_id = :id', { id: commentId })
        .andWhere('comment.post_id = :postId', { postId })
        .orderBy('comment.created_at', orderBy)
        .limit(size)
        .offset((page - 1) * size);

      return await responsePagination(queryBuilder, page, size, Comment);
    } catch (error) {
      this.handleError(error, 'Get reply comments failed');
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

      return {
        ...plainToInstance(Comment, comment),
        user: { id: user.id, username: user.username },
      };
    } catch (error) {
      this.handleError(error, 'Create comment failed');
    }
  }

  async deleteComment(id: number, user: User) {
    try {
      const comment = await this.commentsRepository.findOne({
        where: { id },
        relations: { likes: true, replyComments: true },
      });

      AccessControl.checkUserAccess(user, comment.user.id);

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      return this.commentsRepository.softRemove(comment);
    } catch (error) {
      this.handleError(error, 'Delete comment failed');
    }
  }

  async restoreComment(id: number, user: User) {
    try {
      const comment = await this.commentsRepository.findOne({
        where: {
          id,
        },
        relations: { likes: true, replyComments: true },
        withDeleted: true,
      });

      AccessControl.checkUserAccess(user, comment.user.id);

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
