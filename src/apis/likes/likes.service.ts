import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '@apis/users/entities/user.entity';
import { LikeType } from '@libs/enums';
import { Comment } from '@apis/comments/entities/comment.entity';
import { Post } from '@apis/posts/entities/post.entity';
import { ErrorHandler } from '@libs/utils/error-handler.utils';
import { CreateLikeDto } from './dto/create-like.dto';
import { plainToInstance } from 'class-transformer';
import { ListUserLikedPostDto } from './dto/list-user-liked-post.dto';
import { AccessControl } from '@libs/utils/access-control.util';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
  ) {}

  private readonly logger = new Logger(LikesService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  private async getPaginatedPosts(
    queryBuilder: SelectQueryBuilder<Like>,
    page: number,
    size: number,
  ) {
    const [likes, total] = await queryBuilder.getManyAndCount();
    const totalPage = Math.ceil(total / size);

    return {
      result: plainToInstance(Like, likes),
      meta: {
        totalPage,
        currentPage: page,
        pageSize: size,
        totalRecords: total,
      },
    };
  }

  private target(target: Post | Comment) {
    const targetType =
      target instanceof Post ? LikeType.POST : LikeType.COMMENT;

    const _target =
      target instanceof Post ? { postId: target.id } : { commentId: target.id };

    return {
      targetType,
      ..._target,
    };
  }

  async like(createLikeDto: CreateLikeDto, user: User) {
    try {
      const { targetId, targetType } = createLikeDto;

      const like = await this.likesRepository.findOne({
        where: {
          ...(targetType === LikeType.POST
            ? { postId: targetId }
            : { commentId: targetId }),
          user: { id: user.id },
        },
      });

      if (like) {
        throw new BadRequestException('You have already liked this target');
      }

      const newLike = await this.likesRepository
        .create({
          ...(targetType === LikeType.POST
            ? { postId: targetId }
            : { commentId: targetId }),
          user,
        })
        .save();

      return plainToInstance(Like, newLike);
    } catch (error) {
      this.handleError(error, 'Like target failed');
    }
  }

  async unLike(createLikeDto: CreateLikeDto, user: User) {
    try {
      const { targetId, targetType } = createLikeDto;

      const like = await this.likesRepository.findOne({
        where: {
          ...(targetType === LikeType.POST
            ? { postId: targetId }
            : { commentId: targetId }),
          user: { id: user.id },
        },
      });

      AccessControl.checkUserAccess(user, like.user.id);

      if (!like) {
        throw new BadRequestException('You have not liked this target');
      }

      await this.likesRepository.delete(like.id);

      return true;
    } catch (error) {
      this.handleError(error, 'Unlike target failed');
    }
  }

  async listUserLikedPost(id: number, query: ListUserLikedPostDto) {
    try {
      const { page, size, orderBy, targetType } = query;

      const queryBuilder = this.likesRepository
        .createQueryBuilder('like')
        .leftJoin('like.user', 'user')
        .where(
          `${targetType === LikeType.POST ? 'like.postId' : 'like.commentId'} = :id`,
          { id },
        )
        .orderBy('like.created_at', orderBy)
        .limit(size)
        .offset((page - 1) * size);

      return await this.getPaginatedPosts(queryBuilder, page, size);
    } catch (error) {
      this.handleError(error, 'Get list user liked post failed');
    }
  }
}
