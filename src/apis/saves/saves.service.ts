import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateSaveDto } from './dto/create-save.dto';
import { User } from '@apis/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Save } from './entities/save.entity';
import { Repository } from 'typeorm';
import { ErrorHandler } from '@libs/utils/error-handler.utils';
import { plainToInstance } from 'class-transformer';
import { AccessControl } from '@libs/utils/access-control.util';
import { Post } from '@apis/posts/entities/post.entity';
import { PostStatus } from '@libs/enums';

@Injectable()
export class SavesService {
  constructor(
    @InjectRepository(Save)
    private saveRepository: Repository<Save>,
  ) {}

  private readonly logger = new Logger(SavesService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  async savePost(createSaveDto: CreateSaveDto, user: User) {
    try {
      return await this.saveRepository.manager.transaction(
        async (transaction) => {
          const post = await transaction.findOne(Post, {
            where: {
              id: createSaveDto.postId,
              isDraft: false,
              status: PostStatus.APPROVED,
              isPublished: true,
            },
          });

          if (!post) {
            throw new BadRequestException('Post not found');
          }

          const isExist = await transaction.findOne(Save, {
            where: {
              postId: createSaveDto.postId,
              userId: user.id,
            },
          });

          if (isExist) {
            throw new BadRequestException('Post already saved');
          }

          const save = transaction.create(Save, {
            postId: createSaveDto.postId,
            userId: user.id,
          });

          return plainToInstance(Save, await transaction.save(save));
        },
      );
    } catch (error) {
      this.handleError(error, 'Error saving post');
    }
  }

  async unSavePost(createSaveDto: CreateSaveDto, user: User) {
    try {
      return await this.saveRepository.manager.transaction(
        async (transaction) => {
          const post = await transaction.findOne(Post, {
            where: {
              id: createSaveDto.postId,
              isDraft: false,
              status: PostStatus.APPROVED,
              isPublished: true,
            },
          });

          if (!post) {
            throw new BadRequestException('Post not found');
          }

          const isExist = await transaction.findOne(Save, {
            where: {
              postId: createSaveDto.postId,
            },
          });
          if (!isExist) {
            throw new BadRequestException('Post not saved');
          }

          AccessControl.checkUserAccess(user, isExist.userId);

          await transaction.delete(Save, isExist.id);

          return true;
        },
      );
    } catch (error) {
      this.handleError(error, 'Error un-saving post');
    }
  }
}
