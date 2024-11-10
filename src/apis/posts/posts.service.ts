import { CategoriesService } from '@apis/categories/categories.service';
import { ImagesService } from '@apis/images/images.service';
import { User } from '@apis/users/entities/user.entity';
import { QueryListDto } from '@libs/base/base.dto';
import { ImageType, LikeType, OrderBy, PostStatus, Roles } from '@libs/enums';
import { AccessControl } from '@libs/utils/access-control.util';
import { ErrorHandler } from '@libs/utils/error-handler.utils';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository, LessThan } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostDto } from './dto/get-post.dto';
import { ListPostDeleteDto, ListPostDto } from './dto/list-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UploadImagePostDto } from './dto/upload-image-post.dto';
import { Post } from './entities/post.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { responsePagination } from '@libs/utils/response-pagination.util';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly imagesService: ImagesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  private async isExistPostAndCheckAccess(postId: number, user: User) {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: { user: true, images: true },
      select: {
        user: { id: true, username: true, avatar: true },
        images: { id: true, url: true, type: true },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    AccessControl.checkUserAccess(user, post.user.id);

    return post;
  }

  async isPostExist(id: number) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return !!post;
  }

  async findOnePostAllRelations(id: number, withDeleted: boolean = false) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: {
        images: true,
        likes: true,
        comments: true,
        saves: true,
        thumbnail: true,
        categories: true,
        user: true,
      },
      withDeleted,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async create(createPostDto: CreatePostDto, user: User) {
    try {
      const createdPost = this.postsRepository.create({
        ...createPostDto,
        user: { id: user.id },
      });
      const post = await this.postsRepository.save(createdPost);

      return {
        ...plainToInstance(Post, post),
        user: { id: user.id, username: user.username, avatar: user.avatar },
      };
    } catch (error) {
      this.handleError(error, 'Create post failed');
    }
  }

  private createBasePostQuery(
    page: number,
    size: number,
    orderBy: OrderBy,
    withDeleted?: boolean,
  ) {
    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    if (withDeleted) {
      queryBuilder.withDeleted();
    }

    return queryBuilder
      .leftJoinAndSelect('post.images', 'images', 'images.type = :type', {
        type: ImageType.THUMBNAIL,
      })
      .loadRelationCountAndMap('post.likeCount', 'post.likes', 'likes', (qb) =>
        qb.where('likes.target_type = :target_type', {
          target_type: LikeType.POST,
        }),
      )
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .distinct(true)
      .orderBy('post.created_at', orderBy)
      .limit(size)
      .offset((page - 1) * size);
  }

  private whereCondition(
    conditionsQuery: { key: string; value: any }[],
    asTable: string,
    user: User,
    checkAccess: boolean,
  ) {
    const conditions: string[] = [];
    const parameters: Record<string, boolean | string | number> = {};

    conditionsQuery.forEach((condition) => {
      if (condition.value !== undefined && condition.value !== null) {
        conditions.push(`${asTable}.${condition.key} = :${condition.key}`);
        parameters[condition.key] = condition.value;
      }
    });

    if (checkAccess && user.role.name === Roles.USER) {
      conditions.push(`${asTable}.user_id = :user_id`);
      parameters.user_id = user.id;
    }

    return { conditions, parameters };
  }

  async findAll(query: ListPostDto, user: User) {
    try {
      const { page, size, orderBy, isDraft, isPublished, status } = query;
      const checkAccess =
        isDraft || !isPublished || status !== PostStatus.APPROVED;

      const { conditions, parameters } = this.whereCondition(
        [
          { key: 'is_draft', value: isDraft },
          { key: 'status', value: status },
          { key: 'is_published', value: isPublished },
        ],
        'post',
        user,
        checkAccess,
      );

      const queryBuilder = this.createBasePostQuery(page, size, orderBy)
        .leftJoinAndSelect('post.saves', 'saves')
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.avatar'])
        .where(conditions.join(' AND '), parameters);

      const result = await responsePagination(queryBuilder, page, size, Post);
      result.result.forEach((post) => {
        (post as any).isSaved = post.saves.some(
          (save) => save.userId === user.id,
        );
        post.saves = undefined;
      });

      return { ...result };
    } catch (error) {
      this.handleError(error, 'Get posts failed');
    }
  }

  async getDeletedPosts(query: ListPostDeleteDto, user: User) {
    try {
      const { page, size, orderBy } = query;

      const queryBuilder = this.createBasePostQuery(page, size, orderBy, true)
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.avatar'])
        .where('post.deleted_at IS NOT NULL')
        .andWhere('post.user_id = :userId', { userId: user.id });

      const result = await responsePagination(queryBuilder, page, size, Post);

      return result;
    } catch (error) {
      this.handleError(error, 'Get deleted posts failed');
    }
  }

  async getDetailDeletedPost(id: number, user: User) {
    try {
      const post = await this.postsRepository.findOne({
        where: { id },
        withDeleted: true,
        relations: { user: true },
        select: { user: { id: true, username: true, avatar: true } },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      AccessControl.checkUserAccess(user, post.user.id);

      return post;
    } catch (error) {
      this.handleError(error, 'Get detail deleted post failed');
    }
  }

  async listSaves(query: QueryListDto, user: User) {
    try {
      const { page, size, orderBy } = query;

      const queryBuilder = this.createBasePostQuery(page, size, orderBy)
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.avatar'])
        .leftJoin('post.saves', 'saves')
        .where('saves.user_id = :user_id', {
          user_id: user.id,
        });

      return await responsePagination(queryBuilder, page, size, Post);
    } catch (error) {
      this.handleError(error, 'Get saves failed');
    }
  }

  async findOne(id: number) {
    try {
      const post = await this.postsRepository.findOne({
        where: { id },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      return plainToInstance(Post, post);
    } catch (error) {
      this.handleError(error, 'Get post failed');
    }
  }

  async getDetailPost(id: number, query: GetPostDto, user: User) {
    try {
      const { isDraft, isPublished, status } = query;

      console.log('type of isDraft', typeof isDraft);
      console.log('type of isPublished', typeof isPublished);
      console.log('type of status', typeof status);

      const checkAccess =
        isDraft === true ||
        isPublished === false ||
        (status !== undefined && status !== PostStatus.APPROVED);

      const queryBuilder = this.postsRepository
        .createQueryBuilder('post')
        .where('post.id = :id', { id })
        .leftJoinAndSelect('post.images', 'images', 'images.type = :type', {
          type: ImageType.THUMBNAIL,
        })
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.avatar'])
        .leftJoinAndSelect(
          'post.likes',
          'likes',
          'likes.target_type = :target_type AND likes.user_id = :userId',
          {
            target_type: LikeType.POST,
            userId: user.id,
          },
        )
        .loadRelationCountAndMap('post.likeCount', 'post.likes')
        .loadRelationCountAndMap('post.commentCount', 'post.comments');

      if (isDraft !== undefined && isDraft !== null) {
        queryBuilder.andWhere('post.is_draft = :is_draft', {
          is_draft: isDraft,
        });
      }

      if (isPublished !== undefined && isPublished !== null) {
        queryBuilder.andWhere('post.is_published = :is_published', {
          is_published: isPublished,
        });
      }

      if (status !== undefined && status !== null) {
        queryBuilder.andWhere('post.status = :status', {
          status,
        });
      }

      const post = await queryBuilder.getOne();

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (checkAccess) {
        AccessControl.checkAdminOrUserAccess(user, post.user.id);
      }

      if (post.user.id !== user.id) {
        await this.incrementPostView(post.id);
      }

      return {
        ...plainToInstance(Post, post),
        likes: undefined,
        isLiked: post.likes.length > 0,
      };
    } catch (error) {
      this.handleError(error, 'Get post detail failed');
    }
  }

  private async incrementPostView(postId: number) {
    try {
      await this.postsRepository
        .createQueryBuilder()
        .update(Post)
        .set({
          views: () => 'views + 1',
        })
        .where('id = :id', { id: postId })
        .execute();
    } catch (error) {
      this.logger.error(`Failed to increment post view: ${error.message}`);
    }
  }

  async findOnePostNoRelations(id: number) {
    try {
      const post = await this.postsRepository.findOneBy({ id });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      return post;
    } catch (error) {
      this.handleError(error, 'Get post no relations failed');
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto, user: User) {
    try {
      const post = await this.isExistPostAndCheckAccess(id, user);

      const updatedPost = await this.postsRepository.save({
        ...post,
        ...updatePostDto,
      });
      return plainToInstance(Post, updatedPost);
    } catch (error) {
      this.handleError(error, 'Update post failed');
    }
  }

  async remove(id: number, user: User) {
    try {
      const post = await this.findOnePostAllRelations(id);

      AccessControl.checkUserAccess(user, post.user.id);

      await Promise.all([
        this.postsRepository.softRemove(post),
        this.postsRepository.update(id, {
          status: PostStatus.DELETED,
        }),
      ]);

      return true;
    } catch (error) {
      this.handleError(error, 'Delete post failed');
    }
  }

  async restore(id: number, user: User) {
    try {
      const post = await this.findOnePostAllRelations(id, true);

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      AccessControl.checkUserAccess(user, post.user.id);

      await Promise.all([
        this.postsRepository.recover(post),
        this.postsRepository.update(id, {
          status: PostStatus.APPROVED,
        }),
      ]);

      return true;
    } catch (error) {
      this.handleError(error, 'Restore post failed');
    }
  }

  async searchPosts(query: SearchPostDto) {
    try {
      const { page, size, orderBy, title } = query;

      const queryBuilder = this.postsRepository
        .createQueryBuilder('post')
        .distinct(true)
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.avatar'])
        .leftJoinAndSelect('post.images', 'images', 'images.type = :type', {
          type: ImageType.THUMBNAIL,
        })
        .where(
          'post.is_draft = :is_draft AND post.status = :status AND post.is_published = :is_published AND post.title ILIKE :query',
          {
            is_draft: false,
            status: PostStatus.APPROVED,
            is_published: true,
            query: `%${title}%`,
          },
        )
        .orderBy('post.created_at', orderBy)
        .limit(size)
        .offset((page - 1) * size);

      return await responsePagination(queryBuilder, page, size, Post);
    } catch (error) {
      this.handleError(error, 'Search posts failed');
    }
  }

  async uploadImagePost(
    postId: number,
    filename: string,
    body: UploadImagePostDto,
    user: User,
  ) {
    try {
      const post = await this.isExistPostAndCheckAccess(postId, user);

      const { type, isPublished, isDraft, status } = body;
      const parameters: Record<string, boolean | string | number> = {};

      const isPublishedPost =
        isPublished || isDraft || status === PostStatus.APPROVED;

      if (isPublished !== undefined && isPublished !== null) {
        parameters.isPublished = isPublished;
      }

      if (isDraft !== undefined && isDraft !== null) {
        parameters.isDraft = isDraft;
      }

      if (status !== undefined && status !== null) {
        parameters.status = status;
      }

      const [postUpdated, image] = await Promise.all([
        isPublishedPost &&
          this.postsRepository.save({ ...post, ...parameters }),
        this.imagesService.createImagePost(filename, post, type),
      ]);

      return {
        ...(isPublishedPost && plainToInstance(Post, postUpdated)),
        image: image,
      };
    } catch (error) {
      this.handleError(error, 'Upload image post failed');
    }
  }

  async deleteImage(postId: number, imageIds: number[], user: User) {
    try {
      const post = await this.isExistPostAndCheckAccess(postId, user);

      return this.imagesService.deleteImage(imageIds, post);
    } catch (error) {
      this.handleError(error, 'Delete image post failed');
    }
  }

  async permanentlyDeleteDraftPost(id: number, user: User) {
    try {
      const post = await this.isExistPostAndCheckAccess(id, user);

      if (!post.isDraft) {
        throw new BadRequestException('Post is not a draft');
      }

      return await this.postsRepository.delete(id);
    } catch (error) {
      this.handleError(error, 'Permanently delete draft post failed');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDeleteExpiredPosts() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const expiredPosts = await this.postsRepository.find({
        where: {
          status: PostStatus.DELETED,
          deletedAt: LessThan(thirtyDaysAgo),
        },
        withDeleted: true,
      });

      if (expiredPosts.length > 0) {
        await this.postsRepository.remove(expiredPosts);
        this.logger.log(`Deleted ${expiredPosts.length} expired posts`);
      }
    } catch (error) {
      this.logger.error('Failed to delete expired posts:', error);
    }
  }
}
