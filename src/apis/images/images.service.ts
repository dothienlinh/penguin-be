import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { Post } from '@apis/posts/entities/post.entity';
import { ErrorHandler } from '@libs/utils/error-handler';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>,
  ) {}

  private readonly logger = new Logger(ImagesService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  async create({ url, post }: { url: string[]; post: Post }) {
    try {
      const values = url.map((url) => ({ url, post }));
      return await this.imagesRepository
        .createQueryBuilder('image')
        .insert()
        .values(values)
        .execute();
    } catch (error) {
      this.handleError(error, 'Create image failed');
    }
  }
}
