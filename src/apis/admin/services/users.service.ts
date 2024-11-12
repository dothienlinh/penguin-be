import { User } from '@apis/users/entities/user.entity';
import { BaseService } from '@libs/base/base.service';
import { Roles, SortBy, UserStatusQuery } from '@libs/enums';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EntityManager } from 'typeorm';
import { DeleteUserDto, GetAdminUserListDto } from '../dto/admin-user.dto';

@Injectable()
export class UsersService extends BaseService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    super(UsersService.name);
  }

  private readonly selectUserProfile = [
    'user.id',
    'user.address',
    'user.avatar',
    'user.bio',
    'user.birthDate',
    'user.createdAt',
    'user.email',
    'user.gender',
    'user.isActive',
    'user.isPublished',
    'user.updatedAt',
    'user.username',
  ];

  private async getUserWithAllRelations(id: number, user: User) {
    const userToDelete = await this.entityManager.findOne(User, {
      where: { id },
      relations: {
        posts: true,
        comments: true,
        likes: true,
        saves: true,
      },
    });

    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }

    if (userToDelete.role.name === Roles.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot delete super admin');
    }

    if (
      userToDelete.role.name === Roles.ADMIN &&
      user.role.name === Roles.ADMIN
    ) {
      throw new ForbiddenException('Cannot delete admin');
    }

    return userToDelete;
  }

  async getUsers(query: GetAdminUserListDto) {
    try {
      const { page, size, role, sortBy, status, username } = query;

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
        .select(this.selectUserProfile)
        .leftJoin('user.role', 'role')
        .addSelect(['role.id', 'role.name'])
        .andWhere('role.name = :role', { role });

      if (status) {
        switch (status) {
          case UserStatusQuery.ALL:
            queryBuilder.withDeleted();
            break;
          case UserStatusQuery.ACTIVE:
            queryBuilder.andWhere('user.isActive = :isActive', {
              isActive: true,
            });
            break;
          case UserStatusQuery.BLOCKED:
            queryBuilder.andWhere('user.isBlocked = :isBlocked', {
              isBlocked: true,
            });
            break;
          case UserStatusQuery.DELETED_BY_ADMIN:
            queryBuilder.andWhere('user.removed_by_admin_id IS NOT NULL');
            break;
          case UserStatusQuery.DELETED_BY_USER:
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

  async getUserDetail(id: number) {
    try {
      const queryBuilder = this.entityManager
        .createQueryBuilder(User, 'user')
        .withDeleted()
        .where('user.id = :id', { id })
        .select(this.selectUserProfile)
        .leftJoin('user.role', 'role')
        .addSelect(['role.id', 'role.name'])
        .loadRelationCountAndMap('posts.postCount', 'user.posts')
        .loadRelationCountAndMap(
          'posts.postCountDeleted',
          'user.posts',
          'posts',
          (qb) => qb.withDeleted(),
        )
        .loadRelationCountAndMap('user.followerCount', 'user.followers')
        .loadRelationCountAndMap('user.followingCount', 'user.following');

      return plainToInstance(User, await queryBuilder.getOne());
    } catch (error) {
      this.handleError(error, 'Admin get user detail failed');
    }
  }

  async deleteUser(id: number, user: User, deleteUserDto: DeleteUserDto) {
    try {
      const userToDelete = await this.getUserWithAllRelations(id, user);

      await Promise.all([
        this.entityManager.softRemove(User, userToDelete),
        this.entityManager.update(
          User,
          { id: userToDelete.id },
          {
            deletedByAdmin: { id: user.id },
            deletedReason: deleteUserDto.deletedReason,
          },
        ),
      ]);

      return true;
    } catch (error) {
      this.handleError(error, 'Admin delete user failed');
    }
  }

  async restoreUser(id: number, user: User) {
    try {
      const userToRestore = await this.getUserWithAllRelations(id, user);

      await Promise.all([
        this.entityManager.restore(User, userToRestore),
        this.entityManager.update(
          User,
          { id: userToRestore.id },
          {
            deletedByAdmin: null,
            deletedReason: null,
          },
        ),
      ]);

      return true;
    } catch (error) {
      this.handleError(error, 'Admin restore user failed');
    }
  }
}
