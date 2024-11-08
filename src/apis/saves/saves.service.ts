import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateSaveDto } from './dto/create-save.dto';
import { User } from '@apis/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Save } from './entities/save.entity';
import { Repository } from 'typeorm';
import { ErrorHandler } from '@libs/utils/error-handler.utils';
import { plainToInstance } from 'class-transformer';

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
      const isExist = await this.saveRepository.findOne({
        where: {
          postId: createSaveDto.postId,
          userId: user.id,
        },
      });

      if (isExist) {
        throw new BadRequestException('Post already saved');
      }

      const save = this.saveRepository.create({
        postId: createSaveDto.postId,
        userId: user.id,
      });

      return plainToInstance(Save, await this.saveRepository.save(save));
    } catch (error) {
      this.handleError(error, 'Error saving post');
    }
  }

  async unSavePost(createSaveDto: CreateSaveDto, user: User) {
    try {
      const isExist = await this.saveRepository.findOne({
        where: {
          postId: createSaveDto.postId,
          userId: user.id,
        },
      });

      if (!isExist) {
        throw new BadRequestException('Post not saved');
      }

      await this.saveRepository.delete(isExist.id);
    } catch (error) {
      this.handleError(error, 'Error un-saving post');
    }
  }
}
