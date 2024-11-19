import { User } from '@apis/users/entities/user.entity';
import { BaseService } from '@libs/base/base.service';
import { ByRole, Roles, SortBy, UserStatusQuery } from '@libs/enums';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EntityManager, In, IsNull, Not } from 'typeorm';
import {
  DeleteUserDto,
  GetAdminUserListDto,
  UpdatePermissionDto,
  UpdateUserRoleDto,
} from '../dto/admin-user.dto';
import { Role } from '@apis/roles/entities/role.entity';
import { Permission } from '@apis/permissions/entities/permission.entity';
import { DEFAULT_PERMISSIONS_USER } from '@libs/constants';

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
    'user.updatedAt',
    'user.username',
  ];

  private async getUserWithAllRelations(
    id: number,
    user: User,
    withDeleted?: boolean,
  ) {
    const userToDelete = await this.entityManager.findOne(User, {
      where: { id },
      relations: {
        posts: true,
        comments: true,
        likes: true,
        saves: true,
        role: true,
      },
      withDeleted,
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

  private async getUserDetail(by: 'username' | 'id', value: string | number) {
    const queryBuilder = this.entityManager
      .createQueryBuilder(User, 'user')
      .withDeleted()
      .where(`user.${by} = :${by}`, { [by]: value })
      .select([...this.selectUserProfile, 'user.deletedAt'])
      .leftJoin('user.role', 'role')
      .addSelect(['role.id', 'role.name'])
      .leftJoin('user.permissions', 'permissions')
      .addSelect(['permissions.id', 'permissions.name'])
      .loadRelationCountAndMap('posts.postCount', 'user.posts', 'posts', (qb) =>
        qb.withDeleted(),
      )
      .loadRelationCountAndMap(
        'user.followerCount',
        'user.followers',
        'users',
        (qb) => qb.withDeleted(),
      )
      .loadRelationCountAndMap(
        'user.followingCount',
        'user.following',
        'users',
        (qb) => qb.withDeleted(),
      );

    const user = await queryBuilder.getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { ...plainToInstance(User, user), isDeleted: !!user.deletedAt };
  }

  async getUsers(query: GetAdminUserListDto) {
    try {
      const { page, size, role, sortBy, status, deletedBy, searchTerm } = query;

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
        .select(this.selectUserProfile)
        .leftJoin('user.role', 'role')
        .addSelect(['role.id', 'role.name'])
        .where('role.name = :role', { role });

      if (status === undefined) {
        queryBuilder.withDeleted();
      } else {
        switch (status) {
          case UserStatusQuery.ACTIVE:
            queryBuilder.andWhere('user.isActive = :isActive', {
              isActive: true,
            });
            break;
          case UserStatusQuery.DELETED:
            queryBuilder.withDeleted();

            if (deletedBy === ByRole.USER) {
              queryBuilder
                .andWhere('user.deleted_at IS NOT NULL')
                .andWhere('user.deleted_by_admin_id IS NULL');
            } else if (deletedBy === ByRole.ADMIN) {
              queryBuilder.andWhere('user.deleted_by_admin_id IS NOT NULL');
            } else {
              queryBuilder.andWhere(
                '(user.deleted_at IS NOT NULL OR user.deleted_by_admin_id IS NOT NULL)',
              );
            }
            break;
          default:
            break;
        }
      }

      if (searchTerm) {
        queryBuilder.andWhere(
          'user.username ILIKE :searchTerm OR user.email ILIKE :searchTerm',
          { searchTerm: `%${searchTerm}%` },
        );
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

  async getUserById(id: number) {
    try {
      return await this.getUserDetail('id', id);
    } catch (error) {
      this.handleError(error, 'Admin get user by id failed');
    }
  }

  async getUserByUsername(username: string) {
    try {
      return await this.getUserDetail('username', username);
    } catch (error) {
      this.handleError(error, 'Admin get user by username failed');
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
      const userToRestore = await this.entityManager.findOne(User, {
        where: { id, deletedAt: Not(IsNull()) },
        relations: {
          role: true,
          posts: true,
          comments: true,
          likes: true,
          saves: true,
          followers: true,
          following: true,
          receivedMessages: true,
          sentMessages: true,
          deletedPosts: true,
          permissions: true,
          chatRooms: true,
        },
        withDeleted: true,
      });

      if (!userToRestore) {
        throw new NotFoundException('User not found');
      }

      if (userToRestore.role.name === Roles.SUPER_ADMIN) {
        throw new ForbiddenException('Cannot restore super admin');
      }

      if (
        userToRestore.role.name === Roles.ADMIN &&
        user.role.name === Roles.ADMIN
      ) {
        throw new ForbiddenException('Cannot restore admin');
      }

      await Promise.all([
        this.entityManager.recover(User, userToRestore),
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

  async updateUserRole(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    try {
      const user = await this.entityManager.findOne(User, {
        where: { id },
        relations: {
          permissions: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const role = await this.entityManager.findOne(Role, {
        where: {
          name: updateUserRoleDto.role as unknown as Roles,
        },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      const permissionNames =
        role.name === Roles.ADMIN ? [] : DEFAULT_PERMISSIONS_USER;

      const permissions = await this.entityManager.find(Permission, {
        where: {
          name: In(permissionNames),
        },
      });

      user.role = role;
      user.permissions = permissions;

      await this.entityManager.save(User, user);

      return true;
    } catch (error) {
      this.handleError(error, 'Admin update user role failed');
    }
  }

  async updateUserPermission(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ) {
    try {
      const user = await this.entityManager.findOne(User, {
        where: { id },
        relations: {
          permissions: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const permissions = await this.entityManager.find(Permission, {
        where: {
          id: In(updatePermissionDto.permissionsIds),
        },
      });

      user.permissions = permissions;

      await this.entityManager.save(User, user);

      return true;
    } catch (error) {
      this.handleError(error, 'Admin update user permission failed');
    }
  }
}
