import { PermissionsService } from '@apis/permissions/permissions.service';
import { RolesService } from '@apis/roles/roles.service';
import { Roles } from '@libs/enums';
import { ErrorHandler } from '@libs/utils/error-handler.utils';
import { hashPassword } from '@libs/utils/password.utils';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateUserFacebookDto } from './dto/create-user-facebook.dto';
import { CreateUserGoogleDto } from './dto/create-user-google.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { DeleteUserDto, RestoreUserDto } from '@apis/admin/dto/action-user.dto';
import { QueryListDto } from '@libs/base/base.dto';
import { UPLOAD_FOLDER } from '@libs/constants';

interface FindOneByFields {
  key: keyof User;
  value: User[keyof User];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly configService: ConfigService,
    private readonly permissionsService: PermissionsService,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  private async createUserAndSave(
    userDto: CreateUserDto | CreateUserFacebookDto | CreateUserGoogleDto,
  ) {
    const permissions =
      await this.permissionsService.getDefaultPermissionsUser();

    const user = await this.usersRepository
      .create({
        ...userDto,
        isVerified: true,
        permissions,
      })
      .save();
    return plainToInstance(User, user);
  }

  private async getPaginatedUsers(
    queryBuilder: SelectQueryBuilder<User>,
    page: number,
    size: number,
  ) {
    const [users, total] = await queryBuilder.getManyAndCount();
    const totalPage = Math.ceil(total / size);

    return {
      result: plainToInstance(User, users),
      meta: {
        totalPage,
        currentPage: page,
        pageSize: size,
        totalRecords: total,
      },
    };
  }

  async isExistUser<K extends keyof User>(key: K, value: User[K]) {
    try {
      const user = await this.usersRepository.findOneBy({ [key]: value });
      return !!user;
    } catch (error) {
      this.handleError(error, 'Internal server error');
    }
  }

  async findByIds(ids: number[]) {
    try {
      const users = await this.usersRepository.findBy({ id: In(ids) });
      return plainToInstance(User, users);
    } catch (error) {
      this.handleError(error, 'Find user by ids failed');
    }
  }

  async verifyUser(id: number) {
    try {
      return await this.usersRepository.update(id, { isVerified: true });
    } catch (error) {
      this.handleError(error, 'Verify user failed');
    }
  }

  async findOneByFields<K extends keyof User>(
    fields: FindOneByFields[] | FindOneByFields,
    relations: string[] = [],
  ) {
    try {
      const fieldsArray = Array.isArray(fields) ? fields : [fields];

      const whereClause = fieldsArray.reduce(
        (acc, { key, value }) => {
          acc[key] = value as any;
          return acc;
        },
        {} as { [key in K]: User[K] },
      );
      const user = await this.usersRepository.findOne({
        where: whereClause,
        relations,
      });
      return user || null;
    } catch (error) {
      this.handleError(error, 'Find user by fields failed');
    }
  }

  async findOneByUsername(username: string) {
    try {
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .where('user.username = :username', { username })
        .getOne();

      if (!user) throw new NotFoundException('User not found');
      return plainToInstance(User, user);
    } catch (error) {
      this.handleError(error, 'Find user by username failed');
    }
  }

  async updateRefreshToken(id: number, refreshToken: string | null) {
    try {
      const isExistUser = await this.isExistUser('id', +id);

      if (!isExistUser) {
        throw new NotFoundException('User not found');
      }

      await this.usersRepository.update(id, {
        refreshToken,
      });
    } catch (error) {
      this.handleError(error, 'Update refresh token failed');
    }
  }

  async createSuperAdmin() {
    const role = await this.rolesService.findOneByName(Roles.SUPER_ADMIN);
    const isExistSuperAdmin = await this.findOneByFields([
      {
        key: 'role',
        value: role.id,
      },
      {
        key: 'email',
        value: this.configService.getOrThrow<string>('SUPER_ADMIN_EMAIL'),
      },
    ]);

    if (isExistSuperAdmin) return;

    const user = this.usersRepository.create({
      email: this.configService.getOrThrow<string>('SUPER_ADMIN_EMAIL'),
      password: await hashPassword(
        this.configService.getOrThrow<string>('SUPER_ADMIN_PASSWORD'),
      ),
      username: 'Super_Admin',
      role: { id: role.id },
    });

    return await user.save();
  }

  async create(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await hashPassword(createUserDto.password);

      const role = await this.rolesService.findOneByName(Roles.USER);

      createUserDto.role = role;

      return await this.createUserAndSave(createUserDto);
    } catch (error) {
      this.handleError(error, 'Create user failed');
    }
  }

  async updatePassword(user: User, password: string) {
    try {
      return await this.usersRepository.update(user.id, {
        password: await hashPassword(password),
      });
    } catch (error) {
      this.handleError(error, 'Update password failed');
    }
  }

  async getProfileUser(id: number) {
    try {
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoin('user.permissions', 'permissions')
        .select(['user', 'role.id', 'role.name', 'permissions.name'])
        .where('user.id = :id', { id })
        .getOne();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        ...plainToInstance(User, user),
        permissions: user.permissions.map((permission) => permission.name),
      };
    } catch (error) {
      this.handleError(error, 'Get profile user failed');
    }
  }

  async createWithFacebook(createUserFacebookDto: CreateUserFacebookDto) {
    try {
      const role = await this.rolesService.findOneByName(Roles.USER);

      createUserFacebookDto.role = role;
      return await this.createUserAndSave(createUserFacebookDto);
    } catch (error) {
      this.handleError(error, 'Create user with facebook failed');
    }
  }

  async createWithGoogle(createUserGoogleDto: CreateUserGoogleDto) {
    try {
      const role = await this.rolesService.findOneByName(Roles.USER);
      createUserGoogleDto.role = role;
      return await this.createUserAndSave(createUserGoogleDto);
    } catch (error) {
      this.handleError(error, 'Create user with google failed');
    }
  }

  async findAll() {
    try {
      const users = await this.usersRepository.find();
      return plainToInstance(User, users);
    } catch (error) {
      this.handleError(error, 'Find all users failed');
    }
  }

  async findOneById(id: number) {
    try {
      const user = await this.usersRepository.findOneBy({ id: +id });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return plainToInstance(User, user);
    } catch (error) {
      this.handleError(error, 'Find user by id failed');
    }
  }

  async getFollowers(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['followers'],
    });
    if (!user) throw new NotFoundException('User not found');

    return user.followers;
  }

  async getFollowing(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['following'],
    });
    if (!user) throw new NotFoundException('User not found');

    return user.following;
  }

  async findOneUserAllRelations(id: number, withDeleted: boolean = false) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
        relations: {
          posts: true,
          followers: true,
          following: true,
          comments: true,
          likes: true,
          shares: true,
        },
        withDeleted,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return plainToInstance(User, user);
    } catch (error) {
      this.handleError(error, 'Find user by id failed');
    }
  }

  async restore(id: number) {
    try {
      const user = await this.findOneUserAllRelations(id, true);

      return this.usersRepository.recover(user);
    } catch (error) {
      this.handleError(error, 'Restore user failed');
    }
  }

  async followUser(followingId: number, currentUser: User) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: followingId },
      });
      if (!user) throw new NotFoundException('User not found');

      currentUser.following.push(user);
      await this.usersRepository.save(currentUser);

      return currentUser;
    } catch (error) {
      this.handleError(error, 'Follow user failed');
    }
  }

  async update(
    updateUserDto: UpdateUserDto,
    avatarUrl: string | null,
    user: User,
  ) {
    try {
      const { username, ...rest } = updateUserDto;

      const isExistUser = await this.usersRepository.findOne({
        where: { username },
      });

      if (isExistUser && isExistUser.id !== user.id) {
        throw new ConflictException('Username already exists');
      }

      const updateData: Partial<User> = {
        ...rest,
        avatar: avatarUrl,
        username,
      };

      if (avatarUrl) {
        const fullUrlAvatar = `${this.configService.getOrThrow<string>(
          'BACKEND_URL',
        )}/${UPLOAD_FOLDER}/${avatarUrl}`;
        updateData.avatar = fullUrlAvatar;
      } else {
        delete updateData.avatar;
      }

      await this.usersRepository.update(user.id, {
        ...updateData,
      });

      return updateData;
    } catch (error) {
      this.handleError(error, 'Update user failed');
    }
  }

  async updateActivateUser(isActive: boolean, user: User) {
    try {
      return await this.usersRepository.update(user.id, { isActive });
    } catch (error) {
      this.handleError(error, 'Update activate user failed');
    }
  }

  async delete(id: number) {
    try {
      const user = await this.findOneUserAllRelations(id);

      return this.usersRepository.softRemove(user);
    } catch (error) {
      this.handleError(error, 'Delete user failed');
    }
  }
  async unfollowUser(followingId: number, currentUser: User) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: followingId },
      });
      if (!user) throw new NotFoundException('User not found');

      currentUser.following = currentUser.following.filter(
        (followingUser) => followingUser.id !== user.id,
      );
      await this.usersRepository.save(currentUser);

      return currentUser;
    } catch (error) {
      this.handleError(error, 'Unfollow user failed');
    }
  }

  async adminGetRemovedUsers(query: QueryListDto) {
    try {
      const { page, size, orderBy } = query;

      const queryBuilder = this.usersRepository
        .createQueryBuilder('user')
        .where(
          'user.removed_by_admin_id IS NOT NULL AND user.removed_at IS NOT NULL',
        )
        .orderBy('user.removed_at', orderBy)
        .limit(size)
        .offset((page - 1) * size);

      return this.getPaginatedUsers(queryBuilder, page, size);
    } catch (error) {
      this.handleError(error, 'Admin get removed users failed');
    }
  }

  async adminGetRemovedUserDetail(id: number) {
    try {
      return await this.usersRepository.findOne({
        where: {
          id,
          removedByAdmin: Not(IsNull()),
          removedAt: Not(IsNull()),
        },
        relations: { removedByAdmin: true },
      });
    } catch (error) {
      this.handleError(error, 'Admin get removed user detail failed');
    }
  }

  async adminRemoveUser(deleteUserDto: DeleteUserDto, user: User) {
    try {
      return await this.usersRepository.update(deleteUserDto.id, {
        removedByAdmin: user,
        removedReason: deleteUserDto.removedReason,
        removedAt: new Date(),
      });
    } catch (error) {
      this.handleError(error, 'Admin remove user failed');
    }
  }

  async adminRestoreUser(restoreUserDto: RestoreUserDto) {
    try {
      return await this.usersRepository.update(restoreUserDto.id, {
        removedByAdmin: null,
        removedAt: null,
        removedReason: null,
      });
    } catch (error) {
      this.handleError(error, 'Admin restore user failed');
    }
  }

  async adminGetRemovedUsersByUser(query: QueryListDto) {
    try {
      const { page, size, orderBy } = query;

      return await this.usersRepository.find({
        where: { deletedAt: Not(IsNull()) },
        order: { deletedAt: orderBy },
        take: size,
        skip: (page - 1) * size,
      });
    } catch (error) {
      this.handleError(error, 'Admin get removed users by user failed');
    }
  }
}
