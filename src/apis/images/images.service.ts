import { Post } from '@apis/posts/entities/post.entity';
import { ImageType } from '@libs/enums';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@libs/base/base.service';

@Injectable()
export class ImagesService extends BaseService {
  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>,
  ) {
    super(ImagesService.name);
  }

  async create(url: string[], post: Post, type: ImageType) {
    try {
      const values = url.map((url) => ({ url, post, type }));
      return await this.imagesRepository
        .createQueryBuilder('image')
        .insert()
        .values(values)
        .execute();
    } catch (error) {
      this.handleError(error, 'Create image failed');
    }
  }

  async createImagePost(url: string, post: Post, type: ImageType) {
    try {
      const image = await this.imagesRepository
        .create({
          url,
          post: { id: post.id },
          type,
        })
        .save();

      return plainToInstance(Image, image);
    } catch (error) {
      this.handleError(error, 'Create image post failed');
    }
  }

  async createThumbnail(url: string, post: Post) {
    const create = this.imagesRepository.create({
      url,
      post,
      type: ImageType.THUMBNAIL,
    });
    return await this.imagesRepository.save(create);
  }

  async updateImages(urls: string[], post: Post) {
    const images = await this.imagesRepository.find({ where: { post } });

    const update = images.map((image, index) => ({
      ...image,
      url: urls[index],
      type: ImageType.IMAGE,
    }));
    return await this.imagesRepository.save(update);
  }

  async updateThumbnail(url: string, post: Post) {
    const update = this.imagesRepository.create({
      url,
      post,
      type: ImageType.THUMBNAIL,
    });
    return await this.imagesRepository.save(update);
  }

  async deleteImage(ids: number[], post: Post) {
    try {
      return await this.imagesRepository.delete({
        id: In(ids),
        post: { id: post.id },
      });
    } catch (error) {
      this.handleError(error, 'Delete image failed');
    }
  }
}
