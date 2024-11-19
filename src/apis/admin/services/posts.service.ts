import { Post } from '@apis/posts/entities/post.entity';
import { User } from '@apis/users/entities/user.entity';
import { BaseService } from '@libs/base/base.service';
import { ByRole, LikeType, PostStatus } from '@libs/enums';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { DeletePostDto, GetAdminPostListDto } from '../dto/admin-post.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PostsService extends BaseService {
  constructor(private readonly entityManager: EntityManager) {
    super(PostsService.name);
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

  private async getPostWithAllRelations(
    id: number,
    withDeleted = false,
  ): Promise<Post> {
    const post = await this.entityManager.findOne(Post, {
      where: { id },
      relations: {
        thumbnail: true,
        images: true,
        likes: true,
        comments: true,
        saves: true,
      },
      withDeleted,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async getPosts(query: GetAdminPostListDto) {
    try {
      const { orderBy, page, size, title, deletedBy, status } = query;

      const queryBuilder = this.entityManager
        .createQueryBuilder(Post, 'post')
        .where('post.title ILIKE :title', { title: `%${title || ''}%` })
        .andWhere('post.is_draft = :isDraft', { isDraft: false });

      if (status === undefined) {
        queryBuilder.withDeleted();
      } else {
        queryBuilder.andWhere('post.status = :status', { status });
        if (status === PostStatus.DELETED) {
          queryBuilder.withDeleted();

          if (deletedBy === ByRole.ADMIN) {
            queryBuilder.andWhere('post.deleted_by_admin_id IS NOT NULL');
          } else if (deletedBy === ByRole.USER) {
            queryBuilder
              .andWhere('post.deleted_by_admin_id IS NULL')
              .andWhere('post.deleted_at IS NOT NULL');
          } else {
            queryBuilder.andWhere('post.deleted_at IS NOT NULL');
          }
        }
      }

      queryBuilder
        .leftJoin('post.deletedByAdmin', 'deletedByAdmin')
        .addSelect([
          'deletedByAdmin.id',
          'deletedByAdmin.username',
          'deletedByAdmin.avatar',
        ])
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.avatar'])
        .leftJoin('post.thumbnail', 'thumbnail')
        .addSelect(['thumbnail.id', 'thumbnail.url'])
        .orderBy(
          `post.${status === PostStatus.DELETED ? 'deleted_at' : 'created_at'}`,
          orderBy,
        )
        .limit(size)
        .offset((page - 1) * size);

      return await this.getPaginated(queryBuilder, page, size, Post);
    } catch (error) {
      this.handleError(error, 'Admin get removed posts failed');
    }
  }

  async getPostsById(id: number) {
    try {
      const queryBuilder = this.entityManager
        .createQueryBuilder(Post, 'post')
        .withDeleted()
        .where('post.id = :id AND post.is_draft = :isDraft', {
          id,
          isDraft: false,
        })
        .leftJoin('post.user', 'user', 'user.id = post.user_id', {
          withDeleted: true,
        })
        .addSelect(['user.id', 'user.username', 'user.avatar']);

      const post = await queryBuilder.getOne();

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const isUserDeleted =
        !!post.user?.deletedAt || !!post.user?.deletedByAdmin;

      this.addPostCounts(queryBuilder, isUserDeleted);

      return plainToInstance(Post, await queryBuilder.getOne());
    } catch (error) {
      this.handleError(error, 'Admin get posts by id failed');
    }
  }

  async getPostsOfUser(id: number, query: GetAdminPostListDto) {
    try {
      const { page, size, orderBy, status, title, deletedBy } = query;

      const user = await this.entityManager.findOne(User, {
        where: { id },
        relations: {
          deletedByAdmin: true,
        },
        withDeleted: true,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isUserDeleted = !!user.deletedAt || !!user.deletedByAdmin;

      const queryBuilder = this.entityManager
        .createQueryBuilder(Post, 'post')
        .withDeleted()
        .distinct(true)
        .where('post.user_id = :id', { id })
        .andWhere('post.title ILIKE :title', { title: `%${title || ''}%` })
        .andWhere('post.is_draft = :isDraft', { isDraft: false });

      if (status !== undefined) {
        if (status !== PostStatus.DELETED) {
          queryBuilder.andWhere('post.status = :status', { status });
        } else {
          queryBuilder.andWhere(
            'post.deleted_at IS NOT NULL AND post.status = :status',
            { status },
          );

          if (deletedBy === ByRole.ADMIN) {
            queryBuilder.andWhere('post.deleted_by_admin_id IS NOT NULL');
          } else if (deletedBy === ByRole.USER) {
            queryBuilder
              .andWhere('post.deleted_by_admin_id IS NULL')
              .andWhere('post.deleted_at IS NOT NULL');
          } else {
            queryBuilder.andWhere('post.deleted_at IS NOT NULL');
          }
        }
      }

      queryBuilder
        .leftJoinAndSelect('post.thumbnail', 'thumbnail')
        .orderBy('post.created_at', orderBy)
        .limit(size)
        .offset((page - 1) * size);

      this.addPostCounts(queryBuilder, isUserDeleted);

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
      const post = await this.getPostWithAllRelations(id, true);

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
