import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeletePostDto, RestorePostDto } from './dto/action-post.dto';
import { DeleteUserDto, RestoreUserDto } from './dto/action-user.dto';
import { User } from '@apis/users/entities/user.entity';
import { QueryListDto } from '@libs/base/base.dto';
import { EntityManager, IsNull, Not, SelectQueryBuilder } from 'typeorm';
import { ErrorHandler } from '@libs/utils/error-handler.utils';
import { plainToInstance } from 'class-transformer';
import { ImageType, PostStatus, SortBy, UserStatus } from '@libs/enums';
import { Post } from '@apis/posts/entities/post.entity';
import { SearchUserDto } from './dto/search.dto';

@Injectable()
export class AdminService {
  constructor(private readonly entityManager: EntityManager) {}

  private readonly logger = new Logger(AdminService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  private async getPaginated<T>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number,
    size: number,
    classType: new () => T,
  ) {
    const [result, total] = await queryBuilder.getManyAndCount();
    const totalPage = Math.ceil(total / size);

    return {
      result: plainToInstance(classType, result),
      meta: {
        totalPage,
        currentPage: page,
        pageSize: size,
        totalRecords: total,
      },
    };
  }

  private async findOnePostAllRelations(
    id: number,
    withDeleted: boolean = false,
  ) {
    try {
      const post = await this.entityManager.findOne(Post, {
        where: { id },
        relations: {
          images: true,
          likes: true,
          comments: true,
          saves: true,
          thumbnail: true,
          categories: true,
        },
        withDeleted,
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      return post;
    } catch (error) {
      this.handleError(error, 'Admin find one post all relations failed');
    }
  }

  private async findOneUserAllRelations(
    id: number,
    withDeleted: boolean = false,
  ) {
    try {
      const user = await this.entityManager.findOne(User, {
        where: { id },
        withDeleted,
        relations: {
          following: true,
          followers: true,
          posts: true,
          comments: true,
          likes: true,
          saves: true,
          sentMessages: true,
          receivedMessages: true,
          removedPosts: true,
          removedUsers: true,
          chatRooms: true,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.handleError(error, 'Admin find one user all relations failed');
    }
  }

  async getRemovedPosts(query: QueryListDto) {
    try {
      return await this.entityManager.transaction(
        async (transactionManager) => {
          const { page, size, orderBy } = query;

          const queryBuilder = transactionManager
            .createQueryBuilder(Post, 'post')
            .withDeleted()
            .where(
              'post.status = :status AND post.deleted_at IS NOT NULL AND post.removed_by_admin_id IS NOT NULL',
              {
                status: PostStatus.DELETED,
              },
            )
            .leftJoin('post.user', 'user')
            .addSelect(['user.id', 'user.username', 'user.avatar'])
            .leftJoin('post.removedByAdmin', 'removedByAdmin')
            .addSelect([
              'removedByAdmin.id',
              'removedByAdmin.username',
              'removedByAdmin.avatar',
            ])
            .leftJoin('post.images', 'images', 'images.type = :type', {
              type: ImageType.THUMBNAIL,
            })
            .addSelect(['images.id', 'images.url', 'images.type'])
            .orderBy('post.deleted_at', orderBy)
            .limit(size)
            .offset((page - 1) * size);

          return await this.getPaginated(queryBuilder, page, size, Post);
        },
      );
    } catch (error) {
      this.handleError(error, 'Admin get removed posts failed');
    }
  }

  async getRemovedPostsByUser(query: QueryListDto) {
    try {
      return await this.entityManager.transaction(
        async (transactionManager) => {
          const { page, size, orderBy } = query;

          const queryBuilder = transactionManager
            .createQueryBuilder(Post, 'post')
            .where('post.status = :status AND post.deleted_at IS NOT NULL', {
              status: PostStatus.DELETED,
            })
            .withDeleted()
            .leftJoin('post.user', 'user')
            .addSelect(['user.id', 'user.username', 'user.avatar'])
            .leftJoin('post.images', 'images', 'images.type = :type', {
              type: ImageType.THUMBNAIL,
            })
            .addSelect(['images.id', 'images.url', 'images.type'])
            .orderBy('post.deleted_at', orderBy)
            .limit(size)
            .offset((page - 1) * size);

          return await this.getPaginated(queryBuilder, page, size, Post);
        },
      );
    } catch (error) {
      this.handleError(error, 'Admin get removed posts by user failed');
    }
  }

  async getRemovedPostDetail(id: number) {
    try {
      return await this.entityManager.transaction(
        async (transactionManager) => {
          return await transactionManager.findOne(Post, {
            where: {
              id,
              removedByAdmin: Not(IsNull()),
              removedAt: Not(IsNull()),
              status: PostStatus.DELETED,
            },
            relations: { removedByAdmin: true },
          });
        },
      );
    } catch (error) {
      this.handleError(error, 'Admin get removed post detail failed');
    }
  }

  async removePost(deletePostDto: DeletePostDto, user: User) {
    try {
      return await this.entityManager.transaction(
        async (transactionManager) => {
          const post = await this.findOnePostAllRelations(deletePostDto.id);

          await Promise.all([
            transactionManager.update(Post, deletePostDto.id, {
              status: PostStatus.DELETED,
              removedReason: deletePostDto.removedReason,
              removedByAdmin: user,
            }),
            transactionManager.softRemove(Post, post),
          ]);

          return true;
        },
      );
    } catch (error) {
      this.handleError(error, 'Admin remove post failed');
    }
  }

  async restorePost(restorePostDto: RestorePostDto) {
    try {
      return await this.entityManager.transaction(
        async (transactionManager) => {
          const post = await this.findOnePostAllRelations(restorePostDto.id);

          await Promise.all([
            transactionManager.update(Post, restorePostDto.id, {
              status: PostStatus.APPROVED,
              removedByAdmin: null,
              removedReason: null,
            }),
            transactionManager.recover(post),
          ]);

          return true;
        },
      );
    } catch (error) {
      this.handleError(error, 'Admin restore post failed');
    }
  }

  async getRemovedUsers(query: QueryListDto) {
    try {
      return await this.entityManager.transaction(
        async (transactionManager) => {
          const { page, size, orderBy } = query;

          const queryBuilder = transactionManager
            .createQueryBuilder(User, 'user')
            .where(
              'user.removed_by_admin_id IS NOT NULL AND user.removed_at IS NOT NULL',
            )
            .orderBy('user.removed_at', orderBy)
            .limit(size)
            .offset((page - 1) * size);

          return await this.getPaginated(queryBuilder, page, size, User);
        },
      );
    } catch (error) {
      this.handleError(error, 'Admin get removed users failed');
    }
  }

  async getRemovedUserDetail(id: number) {
    try {
      return await this.entityManager.transaction(
        async (transactionManager) => {
          return await transactionManager.findOne(User, {
            where: {
              id,
              removedByAdmin: Not(IsNull()),
              removedAt: Not(IsNull()),
            },
            relations: { removedByAdmin: true },
          });
        },
      );
    } catch (error) {
      this.handleError(error, 'Admin get removed user detail failed');
    }
  }

  async removeUser(deleteUserDto: DeleteUserDto, user: User) {
    try {
      return await this.entityManager.transaction(
        async (transactionManager) => {
          const isUserExist = await this.findOneUserAllRelations(
            deleteUserDto.id,
          );

          await Promise.all([
            transactionManager.update(User, deleteUserDto.id, {
              removedByAdmin: user,
              removedReason: deleteUserDto.removedReason,
              removedAt: new Date(),
            }),
            transactionManager.softRemove(User, isUserExist),
          ]);

          return true;
        },
      );
    } catch (error) {
      this.handleError(error, 'Admin remove user failed');
    }
  }

  async restoreUser(restoreUserDto: RestoreUserDto) {
    try {
      return await this.entityManager.transaction(
        async (transactionManager) => {
          const isUserExist = await this.findOneUserAllRelations(
            restoreUserDto.id,
            true,
          );

          await Promise.all([
            transactionManager.update(User, restoreUserDto.id, {
              removedByAdmin: null,
              removedAt: null,
              removedReason: null,
            }),
            transactionManager.recover(isUserExist),
          ]);

          return true;
        },
      );
    } catch (error) {
      this.handleError(error, 'Admin restore user failed');
    }
  }

  async getRemovedUsersByUser(query: QueryListDto) {
    try {
      return await this.entityManager.transaction(
        async (transactionManager) => {
          const { page, size, orderBy } = query;

          return await transactionManager.find(User, {
            where: { deletedAt: Not(IsNull()) },
            order: { deletedAt: orderBy },
            take: size,
            skip: (page - 1) * size,
          });
        },
      );
    } catch (error) {
      this.handleError(error, 'Admin get removed users by user failed');
    }
  }

  async searchUser(searchUserDto: SearchUserDto) {
    try {
      const { page, size, role, sortBy, status, username } = searchUserDto;

      const mapSortBy: Record<SortBy, string> = {
        [SortBy.NEWEST]: 'user.createdAt',
        [SortBy.OLDEST]: 'user.createdAt',
        [SortBy.USERNAME]: 'user.username',
        [SortBy.EMAIL]: 'user.email',
      };

      const mapOrderBy: Record<SortBy, 'ASC' | 'DESC'> = {
        [SortBy.NEWEST]: 'DESC',
        [SortBy.OLDEST]: 'ASC',
        [SortBy.USERNAME]: 'ASC',
        [SortBy.EMAIL]: 'ASC',
      };

      const queryBuilder = this.entityManager
        .createQueryBuilder(User, 'user')
        .where('user.username ILIKE :username', {
          username: `%${username || ''}%`,
        })
        .leftJoin('user.role', 'role')
        .addSelect(['role.id', 'role.name'])
        .andWhere('role.name = :role', { role });

      if (status) {
        switch (status) {
          case UserStatus.ALL:
            queryBuilder
              .andWhere(
                '(user.isActive = :isActive OR user.isBlocked = :isBlocked OR user.removed_by_admin_id IS NOT NULL OR (user.deleted_at IS NOT NULL AND user.removed_by_admin_id IS NULL))',
                {
                  isActive: true,
                  isBlocked: true,
                },
              )
              .withDeleted();
            break;
          case UserStatus.ACTIVE:
            queryBuilder.andWhere('user.isActive = :isActive', {
              isActive: true,
            });
            break;
          case UserStatus.BLOCKED:
            queryBuilder.andWhere('user.isBlocked = :isBlocked', {
              isBlocked: true,
            });
            break;
          case UserStatus.REMOVED_BY_ADMIN:
            queryBuilder.andWhere('user.removed_by_admin_id IS NOT NULL');
            break;
          case UserStatus.REMOVED_BY_USER:
            queryBuilder
              .andWhere(
                'user.deleted_at IS NOT NULL AND user.removed_by_admin_id IS NULL',
              )
              .withDeleted();
            break;
        }
      }

      queryBuilder.orderBy(
        sortBy ? mapSortBy[sortBy] : 'user.createdAt',
        sortBy ? mapOrderBy[sortBy] : 'DESC',
      );

      return await this.getPaginated(queryBuilder, page, size, User);
    } catch (error) {
      this.handleError(error, 'Admin search user failed');
    }
  }
}
