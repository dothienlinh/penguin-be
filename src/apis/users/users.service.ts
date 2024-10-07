import { ErrorHandler } from '@libs/utils/error-handler';
import { hashPassword } from '@libs/utils/passwordUtils';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { CreateUserFacebookDto } from './dto/create-user-facebook.dto';
import { CreateUserGoogleDto } from './dto/create-user-google.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

interface FindOneByFields {
  key: keyof User;
  value: User[keyof User];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  async isExistUser<K extends keyof User>(key: K, value: User[K]) {
    try {
      const user = await this.usersRepository.findOneBy({ [key]: value });
      return !!user;
    } catch (error) {
      this.handleError(error, 'Internal server error');
    }
  }

  private async createUserAndSave(
    userDto: CreateUserDto | CreateUserFacebookDto | CreateUserGoogleDto,
  ) {
    const user = await this.usersRepository.create(userDto).save();
    return plainToInstance(User, user);
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const isExistUser = await this.isExistUser('email', createUserDto.email);

      if (isExistUser) {
        throw new ConflictException('User already exists');
      }

      createUserDto.password = await hashPassword(createUserDto.password);

      return await this.createUserAndSave(createUserDto);
    } catch (error) {
      this.handleError(error, 'Create user failed');
    }
  }

  async createWithFacebook(createUserFacebookDto: CreateUserFacebookDto) {
    try {
      return await this.createUserAndSave(createUserFacebookDto);
    } catch (error) {
      this.handleError(error, 'Create user with facebook failed');
    }
  }

  async createWithGoogle(createUserGoogleDto: CreateUserGoogleDto) {
    try {
      return await this.createUserAndSave(createUserGoogleDto);
    } catch (error) {
      this.handleError(error, 'Create user with google failed');
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

  async findOneByFields<K extends keyof User>(
    fields: FindOneByFields[] | FindOneByFields,
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
      console.log(whereClause);
      const user = await this.usersRepository.findOneBy(whereClause);
      return user || null;
    } catch (error) {
      this.handleError(error, 'Find user by fields failed');
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

  async findAll() {
    try {
      const users = await this.usersRepository.find();
      return plainToInstance(User, users);
    } catch (error) {
      this.handleError(error, 'Find all users failed');
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      await this.findOneById(id);
      const updatedUser = await this.usersRepository.update(+id, updateUserDto);
      return plainToInstance(User, updatedUser);
    } catch (error) {
      this.handleError(error, 'Update user failed');
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

  async updatePassword(id: number, password: string) {
    try {
      return await this.usersRepository.update(id, {
        password: await hashPassword(password),
      });
    } catch (error) {
      this.handleError(error, 'Update password failed');
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

  async restore(id: number) {
    try {
      const user = await this.findOneUserAllRelations(id, true);

      return this.usersRepository.recover(user);
    } catch (error) {
      this.handleError(error, 'Restore user failed');
    }
  }

  async verifyUser(id: number) {
    try {
      return await this.usersRepository.update(id, { isVerified: true });
    } catch (error) {
      this.handleError(error, 'Verify user failed');
    }
  }

  async updateActivateUser(id: number, isActive: boolean) {
    try {
      return await this.usersRepository.update(id, { isActive });
    } catch (error) {
      this.handleError(error, 'Update activate user failed');
    }
  }

  async getProfileUser(id: number) {
    try {
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.posts', 'posts')
        .leftJoinAndSelect('posts.images', 'images')
        .where('user.id = :id', { id })
        .getOne();
      return plainToInstance(User, user);
    } catch (error) {
      this.handleError(error, 'Get profile user failed');
    }
  }

  async getProfileUserWithPublishedPosts(id: number) {
    try {
      const user = await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.posts', 'posts')
        .where('user.id = :id', { id })
        .andWhere('posts.isPublished = :isPublished', { isPublished: true })
        .getOne();
      return plainToInstance(User, user);
    } catch (error) {
      this.handleError(error, 'Get profile user failed');
    }
  }
}
