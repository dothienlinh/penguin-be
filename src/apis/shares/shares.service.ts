import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Share } from './entities/share.entity';
import { User } from '@apis/users/entities/user.entity';
import { Post } from '@apis/posts/entities/post.entity';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(Share)
    private sharesRepository: Repository<Share>,
  ) {}

  async createShare(user: User, post: Post): Promise<Share> {
    const share = this.sharesRepository.create({ user, post });
    return await this.sharesRepository.save(share);
  }

  async removeShare(id: number, user: User, post: Post): Promise<void> {
    const share = await this.sharesRepository.findOne({
      where: { id, user: { id: user.id }, post: { id: post.id } },
      relations: ['user'],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    await this.sharesRepository.softRemove(share);
  }

  async restoreShare(id: number, user: User, post: Post): Promise<Share> {
    const share = await this.sharesRepository.findOne({
      where: { id, user: { id: user.id }, post: { id: post.id } },
      relations: ['user'],
      withDeleted: true,
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    return await this.sharesRepository.recover(share);
  }

  async getSharesByUser(user: User): Promise<Share[]> {
    return await this.sharesRepository.find({
      where: { user: { id: user.id } },
      relations: ['post'],
    });
  }

  async getSharesByPost(postId: number): Promise<Share[]> {
    return await this.sharesRepository.find({
      where: { post: { id: postId } },
      relations: ['user'],
    });
  }
}
