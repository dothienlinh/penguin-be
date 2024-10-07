import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';
import { User } from '@apis/users/entities/user.entity';
import { LikeType } from '@libs/enums';
import { Comment } from '@apis/comments/entities/comment.entity';
import { Post } from '@apis/posts/entities/post.entity';
import { ErrorHandler } from '@libs/utils/error-handler';

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

  async isLike(user: User, target: Post | Comment): Promise<boolean> {
    const like = await this.likesRepository.findOne({
      where: {
        user: { id: user.id },
        ...this.target(target),
      },
    });
    return !!like;
  }

  async addLike(user: User, target: Post | Comment) {
    try {
      const isLiked = await this.isLike(user, target);
      if (isLiked) {
        throw new BadRequestException('Already liked');
      }

      const createLike = this.likesRepository.create({
        user,
        ...this.target(target),
      });

      await this.likesRepository.save(createLike);
      return { success: true };
    } catch (error) {
      this.handleError(error, 'Like failed');
    }
  }

  async unLike(user: User, target: Post | Comment) {
    try {
      const isLiked = await this.isLike(user, target);
      if (!isLiked) {
        throw new BadRequestException('Not liked');
      }

      await this.likesRepository.delete({ user, ...this.target(target) });

      return { success: true };
    } catch (error) {
      this.handleError(error, 'Unlike failed');
    }
  }

  async getListUserLiked(target: Post | Comment): Promise<User[]> {
    const likes = await this.likesRepository.find({
      where: {
        ...this.target(target),
      },
      relations: ['user'],
      select: {
        user: { id: true, avatar: true, lastName: true, firstName: true },
      },
    });

    return likes.map((like) => like.user);
  }
}
