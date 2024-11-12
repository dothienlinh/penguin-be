import { Post } from '@apis/posts/entities/post.entity';
import { User } from '@apis/users/entities/user.entity';
import { BaseService } from '@libs/base/base.service';
import { ByRole, LikeType, PostStatus } from '@libs/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import {
  DeletePostDto,
  GetAdminPostDto,
  GetAdminPostListDto,
} from '../dto/admin-post.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PostsService extends BaseService {
  constructor(private readonly entityManager: EntityManager) {
    super(PostsService.name);
  }

  private buildBasePostQuery(
    query: GetAdminPostDto | GetAdminPostListDto,
  ): SelectQueryBuilder<Post> {
    const { status, deletedBy } = query;
    const queryBuilder = this.entityManager
      .createQueryBuilder(Post, 'post')
      .distinct(true);

    let condition = '';
    if (status === PostStatus.DELETED) {
      queryBuilder.withDeleted();
      condition =
        deletedBy === ByRole.ADMIN
          ? 'post.deleted_by_admin_id IS NOT NULL AND '
          : 'post.deleted_by_admin_id IS NULL AND ';
    }

    queryBuilder
      .where(`${condition}post.status = :status`, { status })
      .leftJoin('post.user', 'user')
      .addSelect(['user.id', 'user.username', 'user.avatar'])
      .leftJoinAndSelect('post.thumbnail', 'thumbnail');

    return queryBuilder;
  }

  private addPostCounts(
    queryBuilder: SelectQueryBuilder<Post>,
    isDeleted = false,
  ): void {
    queryBuilder
      .loadRelationCountAndMap(
        'post.likeCount',
        'post.likes',
        'likes',
        (qb) => {
          if (isDeleted) qb.withDeleted();

          return qb.where('likes.target_type = :target_type', {
            target_type: LikeType.POST,
          });
        },
      )
      .loadRelationCountAndMap(
        'post.commentCount',
        'post.comments',
        'comments',
        (qb) => {
          if (isDeleted) qb.withDeleted();

          return qb.where('comments.parent_comment_id IS NULL');
        },
      );
  }

  private async getPostWithAllRelations(id: number): Promise<Post> {
    const post = await this.entityManager.findOne(Post, {
      where: { id },
      relations: {
        thumbnail: true,
        images: true,
        likes: true,
        comments: true,
        saves: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async getPosts(query: GetAdminPostListDto) {
    try {
      const { orderBy, page, size } = query;
      const queryBuilder = this.buildBasePostQuery(query)
        .leftJoin('post.deletedByAdmin', 'deletedByAdmin')
        .addSelect([
          'deletedByAdmin.id',
          'deletedByAdmin.username',
          'deletedByAdmin.avatar',
        ])
        .orderBy('post.deleted_at', orderBy)
        .limit(size)
        .offset((page - 1) * size);

      return await this.getPaginated(queryBuilder, page, size, Post);
    } catch (error) {
      this.handleError(error, 'Admin get removed posts failed');
    }
  }

  async getPostsById(id: number, query: GetAdminPostDto) {
    try {
      const queryBuilder = this.buildBasePostQuery(query)
        .where('post.id = :id AND post.is_draft = :isDraft', {
          id,
          isDraft: false,
        })
        .leftJoin('user.role', 'role')
        .addSelect(['role.id', 'role.name'])
        .leftJoin('post.categories', 'categories')
        .addSelect(['categories.id', 'categories.name']);

      this.addPostCounts(queryBuilder, query.status === PostStatus.DELETED);

      const post = await queryBuilder.getOne();
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      return plainToInstance(Post, post);
    } catch (error) {
      this.handleError(error, 'Admin get posts by id failed');
    }
  }

  async getPostsOfUser(id: number, query: GetAdminPostListDto) {
    try {
      const { page, size, orderBy, status } = query;
      const user = await this.entityManager.findOne(User, {
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const queryBuilder = this.buildBasePostQuery(query)
        .where('user.id = :id', { id })
        .leftJoin('post.categories', 'categories')
        .addSelect(['categories.id', 'categories.name'])
        .orderBy('post.created_at', orderBy)
        .limit(size)
        .offset((page - 1) * size);

      this.addPostCounts(queryBuilder, status === PostStatus.DELETED);

      return await this.getPaginated(queryBuilder, page, size, Post);
    } catch (error) {
      this.handleError(error, 'Admin get posts of user failed');
    }
  }

  async deletePost(id: number, user: User, body: DeletePostDto) {
    try {
      const post = await this.getPostWithAllRelations(id);

      await Promise.all([
        this.entityManager.softRemove(Post, post),
        this.entityManager.update(
          Post,
          { id },
          {
            status: PostStatus.DELETED,
            deletedByAdmin: { id: user.id },
            deletedReason: body.deletedReason,
          },
        ),
      ]);

      return true;
    } catch (error) {
      this.handleError(error, 'Admin delete post failed');
    }
  }

  async restorePost(id: number) {
    try {
      const post = await this.getPostWithAllRelations(id);

      await Promise.all([
        this.entityManager.recover(Post, post),
        this.entityManager.update(
          Post,
          { id },
          {
            status: PostStatus.APPROVED,
            deletedByAdmin: null,
            deletedReason: null,
          },
        ),
      ]);

      return true;
    } catch (error) {
      this.handleError(error, 'Admin restore post failed');
    }
  }
}
