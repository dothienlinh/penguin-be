import { PermissionsService } from '@apis/permissions/permissions.service';
import { RolesService } from '@apis/roles/roles.service';
import { OrderBy, PostStatus, Roles } from '@libs/enums';
import { hashPassword } from '@libs/utils/password.utils';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, IsNull, LessThan, Not, Repository } from 'typeorm';
import { CreateUserFacebookDto } from './dto/create-user-facebook.dto';
import { CreateUserGoogleDto } from './dto/create-user-google.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { QueryListDto } from '@libs/base/base.dto';
import { UPLOAD_FOLDER } from '@libs/constants';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SearchUserDto } from './dto/search-user.dto';
import { responsePagination } from '@libs/utils/response-pagination.util';
import { SignupDto } from './dto/signup.dto';
import { BaseService } from '@libs/base/base.service';

interface FindOneByFields {
  key: keyof User;
  value: User[keyof User];
}

@Injectable()
export class UsersService extends BaseService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly configService: ConfigService,
    private readonly permissionsService: PermissionsService,
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

  private createBuilderGetProfileUser() {
    return this.usersRepository
      .createQueryBuilder('user')
      .distinct(true)
      .loadRelationCountAndMap('user.postCount', 'user.posts', 'posts', (qb) =>
        qb.where(
          'posts.isDraft = :isDraft AND posts.status = :status AND posts.isPublished = :isPublished',
          {
            isDraft: false,
            status: PostStatus.APPROVED,
            isPublished: true,
          },
        ),
      )
      .loadRelationCountAndMap('user.followerCount', 'user.followers')
      .loadRelationCountAndMap('user.followingCount', 'user.following');
  }

  private createBaseUserFollowQuery(
    page: number,
    size: number,
    orderBy: OrderBy,
    target?: 'followers' | 'following',
  ) {
    const targetArray: string[] = [];

    if (target) {
      targetArray.push(`${target}.id`);
    }

    return this.usersRepository
      .createQueryBuilder('user')
      .distinct(true)
      .select([...this.selectUserProfile, ...targetArray])
      .orderBy('user.created_at', orderBy)
      .limit(size)
      .offset((page - 1) * size);
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

  async findOneByUsername(username: string, currentUser: User) {
    try {
      const user = await this.createBuilderGetProfileUser()
        .leftJoinAndSelect('user.followers', 'followers')
        .select([...this.selectUserProfile, 'followers.id'])
        .where('user.username = :username', { username })
        .getOne();

      if (!user) throw new NotFoundException('User not found');

      const isFollowing = user.followers.some((f) => f.id === currentUser.id);

      return {
        ...plainToInstance(User, user),
        isFollowing,
        followers: undefined,
      };
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

  async create(signupDto: SignupDto) {
    try {
      signupDto.password = await hashPassword(signupDto.password);

      const role = await this.rolesService.findOneByName(Roles.USER);

      return await this.createUserAndSave({ ...signupDto, role });
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
      const user = await this.createBuilderGetProfileUser()
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

  async searchUser(query: SearchUserDto) {
    try {
      const { page, size, username, orderBy, role } = query;
      console.log(query);
      const queryBuilder = this.createBaseUserFollowQuery(page, size, orderBy)
        .loadRelationCountAndMap(
          'user.postCount',
          'user.posts',
          'posts',
          (qb) =>
            qb.where(
              'posts.isDraft = :isDraft AND posts.status = :status AND posts.isPublished = :isPublished',
              {
                isDraft: false,
                status: PostStatus.APPROVED,
                isPublished: true,
              },
            ),
        )
        .loadRelationCountAndMap('user.followerCount', 'user.followers')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.username ILIKE :username AND role.name = :role', {
          username: `%${username}%`,
          role,
        });

      return await responsePagination(queryBuilder, page, size, User);
    } catch (error) {
      this.handleError(error, 'Search user failed');
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

  async getFollowers(userId: number, query: QueryListDto) {
    try {
      const { page, size, orderBy } = query;

      const queryBuilder = this.createBaseUserFollowQuery(page, size, orderBy)
        .leftJoinAndSelect('user.followers', 'followers')
        .where('followers.id = :userId', { userId });

      const result = await responsePagination(queryBuilder, page, size, User);

      return {
        ...result,
        result: result.result.map((user) => ({
          ...user,
          followers: undefined,
        })),
      };
    } catch (error) {
      this.handleError(error, 'Get followers failed');
    }
  }

  async getFollowing(userId: number, query: QueryListDto) {
    try {
      const { page, size, orderBy } = query;

      const queryBuilder = this.createBaseUserFollowQuery(
        page,
        size,
        orderBy,
        'followers',
      )
        .leftJoinAndSelect('user.following', 'following')
        .leftJoinAndSelect('user.followers', 'followers')
        .where('following.id = :userId', { userId });

      const result = await responsePagination(queryBuilder, page, size, User);

      result.result.forEach((user) => {
        const isFollowing = user.followers.some((f) => f.id === userId);
        user.following = undefined;
        user.followers = undefined;
        (user as any).isFollowing = isFollowing;
      });

      return result;
    } catch (error) {
      this.handleError(error, 'Get following failed');
    }
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
      if (followingId === currentUser.id) {
        throw new BadRequestException('You cannot follow yourself');
      }

      const user = await this.usersRepository.findOne({
        where: { id: followingId },
      });
      if (!user) throw new NotFoundException('User not found');

      const getCurrentUser = await this.usersRepository.findOne({
        where: { id: currentUser.id },
        relations: { following: true },
      });

      getCurrentUser.following.push(user);
      await this.usersRepository.save(getCurrentUser);

      return true;
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
      let isExistUser: User | null = null;

      if (username) {
        isExistUser = await this.usersRepository.findOne({
          where: { username },
        });
      }

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
      if (followingId === currentUser.id) {
        throw new BadRequestException('You cannot unfollow yourself');
      }

      const user = await this.usersRepository.findOne({
        where: { id: followingId },
      });
      if (!user) throw new NotFoundException('User not found');

      const getCurrentUser = await this.usersRepository.findOne({
        where: { id: currentUser.id },
        relations: { following: true },
      });

      getCurrentUser.following = getCurrentUser.following.filter(
        (followingUser) => followingUser.id !== user.id,
      );
      await this.usersRepository.save(getCurrentUser);

      return true;
    } catch (error) {
      this.handleError(error, 'Unfollow user failed');
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDeleteExpiredUsers() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const expiredPosts = await this.usersRepository.find({
        where: {
          deletedAt: LessThan(thirtyDaysAgo),
        },
        withDeleted: true,
      });

      if (expiredPosts.length > 0) {
        await this.usersRepository.remove(expiredPosts);
        this.logger.log(`Deleted ${expiredPosts.length} expired users`);
      }
    } catch (error) {
      this.logger.error('Failed to delete expired posts:', error);
    }
  }
}
