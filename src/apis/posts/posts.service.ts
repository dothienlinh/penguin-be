import { CategoriesService } from '@apis/categories/categories.service';
import { Category } from '@apis/categories/entities/category.entity';
import { CommentsService } from '@apis/comments/comments.service';
import { AddCommentDto } from '@apis/comments/dto/add-comment.dto';
import { Image } from '@apis/images/entities/image.entity';
import { ImagesService } from '@apis/images/images.service';
import { LikesService } from '@apis/likes/likes.service';
import { SharesService } from '@apis/shares/shares.service';
import { User } from '@apis/users/entities/user.entity';
import {
  ImageType,
  LikeType,
  OrderBy,
  PostStatus,
  UpdatePostStatus,
} from '@libs/enums';
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
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostDto } from './dto/list-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly imagesService: ImagesService,
    private readonly likesService: LikesService,
    private readonly commentsService: CommentsService,
    private readonly sharesService: SharesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
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
        shares: true,
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
      const {
        images = [],
        thumbnail,
        categoriesId,
        ...dataPost
      } = createPostDto;

      let categories: Category[] = [];

      if (categoriesId && categoriesId.length > 0) {
        categories =
          await this.categoriesService.findCategoriesByIds(categoriesId);
      }

      const post = this.postsRepository.create({
        ...dataPost,
        user,
        categories,
      });
      const savedPost = await this.postsRepository.save(post);

      const imagePromises = [];

      if (images && images.length > 0) {
        imagePromises.push(
          this.imagesService.create(
            images.map((image) => image.filename),
            savedPost,
            ImageType.IMAGE,
          ),
        );
      }

      if (thumbnail) {
        imagePromises.push(
          this.imagesService.createThumbnail(thumbnail.filename, savedPost),
        );
      }

      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
      }

      return { success: true };
    } catch (error) {
      this.handleError(error, 'Create post failed');
    }
  }

  private createBasePostQuery(page: number, size: number, orderBy: OrderBy) {
    return this.postsRepository
      .createQueryBuilder('post')
      .distinct(true)
      .leftJoinAndSelect('post.images', 'images', 'images.type = :type', {
        type: ImageType.THUMBNAIL,
      })
      .leftJoin('post.likes', 'likes', 'likes.target_type = :target_type', {
        target_type: LikeType.POST,
      })
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .leftJoin('post.comments', 'comments')
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .leftJoin('post.shares', 'shares')
      .loadRelationCountAndMap('post.shareCount', 'post.shares')
      .orderBy('post.created_at', orderBy)
      .limit(size)
      .offset((page - 1) * size);
  }

  private async getPaginatedPosts(
    queryBuilder: any,
    page: number,
    size: number,
  ) {
    const [posts, total] = await queryBuilder.getManyAndCount();
    const totalPage = Math.ceil(total / size);

    return {
      result: plainToInstance(Post, posts),
      meta: {
        totalPage,
        currentPage: page,
        pageSize: size,
        totalRecords: total,
      },
    };
  }

  async findAll(query: ListPostDto) {
    try {
      const { page, size, orderBy } = query;

      const queryBuilder = this.createBasePostQuery(page, size, orderBy)
        .where(
          'post.is_draft = :is_draft AND post.status = :status AND post.is_published = :is_published',
          {
            is_draft: false,
            status: PostStatus.APPROVED,
            is_published: true,
          },
        )
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.avatar']);

      return await this.getPaginatedPosts(queryBuilder, page, size);
    } catch (error) {
      this.handleError(error, 'Get posts failed');
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

  async myPosts(user: User, query: ListPostDto) {
    try {
      const { page, size, orderBy } = query;

      const queryBuilder = this.createBasePostQuery(page, size, orderBy).where(
        'post.user_id = :user_id AND post.is_draft = :is_draft',
        {
          user_id: user.id,
          is_draft: false,
        },
      );

      return await this.getPaginatedPosts(queryBuilder, page, size);
    } catch (error) {
      this.handleError(error, 'Get my posts failed');
    }
  }

  async listUserLikedPost(id: number) {
    try {
      const post = await this.findOne(id);
      const users = await this.likesService.getListUserLiked(post);
      return plainToInstance(User, users);
    } catch (error) {
      this.handleError(error, 'Get user like posts failed');
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.findOne(id);
      const { images, thumbnail, ...postData } = updatePostDto;

      let imagesResult: Image[];
      let thumbnailResult: Image;
      if (images.length > 0 || thumbnail) {
        [imagesResult, thumbnailResult] = await Promise.all([
          images.length > 0 &&
            this.imagesService.updateImages(
              images.map((image) => image.filename),
              post,
            ),
          thumbnail &&
            this.imagesService.updateThumbnail(thumbnail.filename, post),
        ]);
      }

      const updatedPost = await this.postsRepository.save({
        ...post,
        ...postData,
        images: imagesResult,
        thumbnail: thumbnailResult,
      });
      return plainToInstance(Post, updatedPost);
    } catch (error) {
      this.handleError(error, 'Update post failed');
    }
  }

  async remove(id: number) {
    try {
      const post = await this.findOnePostAllRelations(id);

      return await this.postsRepository.softRemove(post);
    } catch (error) {
      this.handleError(error, 'Delete post failed');
    }
  }

  async restore(id: number) {
    try {
      const post = await this.findOnePostAllRelations(id, true);
      return await this.postsRepository.recover(post);
    } catch (error) {
      this.handleError(error, 'Restore post failed');
    }
  }

  async addLikePost(user: User, postId: number) {
    try {
      const post = await this.findOne(postId);
      return this.likesService.addLike(user, post);
    } catch (error) {
      this.handleError(error, 'Add like post failed');
    }
  }

  async unLikePost(user: User, postId: number) {
    try {
      const post = await this.findOne(postId);
      return this.likesService.unLike(user, post);
    } catch (error) {
      this.handleError(error, 'Remove like post failed');
    }
  }

  async addComment(user: User, postId: number, content: string) {
    try {
      const post = await this.findOne(postId);
      return this.commentsService.create({ user, post, content });
    } catch (error) {
      this.handleError(error, 'Add comment failed');
    }
  }

  async removeComment(postId: number, commentId: number, user: User) {
    try {
      const post = await this.findOnePostNoRelations(postId);
      return this.commentsService.remove(commentId, post, user);
    } catch (error) {
      this.handleError(error, 'Remove comment failed');
    }
  }

  async restoreComment(postId: number, commentId: number, user: User) {
    try {
      const post = await this.findOnePostAllRelations(postId);
      return this.commentsService.restore(commentId, post, user);
    } catch (error) {
      this.handleError(error, 'Restore comment failed');
    }
  }

  async listCommentPost(postId: number) {
    try {
      const post = await this.findOne(postId);

      return this.commentsService.listCommentPost(post);
    } catch (error) {
      this.handleError(error, 'Get comments failed');
    }
  }

  async addReplyComment(
    user: User,
    postId: number,
    commentId: number,
    addCommentDto: AddCommentDto,
  ) {
    try {
      const post = await this.findOne(postId);
      const parentComment = await this.commentsService.findOne(commentId);
      return this.commentsService.createReplyComment({
        user,
        post,
        content: addCommentDto.content,
        parentComment,
      });
    } catch (error) {
      this.handleError(error, 'Add reply comment failed');
    }
  }

  async listReplyComment(postId: number, commentId: number) {
    try {
      const post = await this.findOne(postId);
      const comment = await this.commentsService.findOne(commentId);
      return this.commentsService.getReplyComments(comment, post);
    } catch (error) {
      this.handleError(error, 'Get reply comments failed');
    }
  }

  async sharePost(user: User, postId: number) {
    try {
      const post = await this.findOne(postId);
      return this.sharesService.createShare(user, post);
    } catch (error) {
      this.handleError(error, 'Share post failed');
    }
  }

  async unsharePost(user: User, postId: number, shareId: number) {
    try {
      const post = await this.findOne(postId);
      return this.sharesService.removeShare(shareId, user, post);
    } catch (error) {
      this.handleError(error, 'Unshare post failed');
    }
  }

  async restoreShare(user: User, postId: number, shareId: number) {
    try {
      const post = await this.findOne(postId);
      return this.sharesService.restoreShare(shareId, user, post);
    } catch (error) {
      this.handleError(error, 'Restore share failed');
    }
  }

  async getSharedPosts(user: User) {
    try {
      const shares = await this.sharesService.getSharesByUser(user);
      return shares.map((share) => share.post);
    } catch (error) {
      this.handleError(error, 'Get shared posts failed');
    }
  }

  async getPostShares(postId: number) {
    try {
      return this.sharesService.getSharesByPost(postId);
    } catch (error) {
      this.handleError(error, 'Get post shares failed');
    }
  }

  async searchPosts(query: SearchPostDto) {
    try {
      const { page, size, orderBy, value } = query;
      const searchValue = value || '';

      const queryBuilder = this.postsRepository
        .createQueryBuilder('post')
        .distinct(true)
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.username', 'user.avatar'])
        .where(
          'post.is_draft = :is_draft AND post.status = :status AND post.is_published = :is_published',
          {
            is_draft: false,
            status: PostStatus.APPROVED,
            is_published: true,
          },
        )
        .andWhere('post.title LIKE :query OR post.content LIKE :query', {
          query: `%${searchValue}%`,
        })
        .orderBy('post.created_at', orderBy)
        .limit(size)
        .offset((page - 1) * size);

      return await this.getPaginatedPosts(queryBuilder, page, size);
    } catch (error) {
      this.handleError(error, 'Search posts failed');
    }
  }

  async listMyPostDraft(user: User, query: ListPostDto) {
    try {
      const { page, size, orderBy } = query;

      const queryBuilder = this.postsRepository
        .createQueryBuilder('post')
        .where('post.user_id = :user_id AND post.is_draft = :is_draft', {
          user_id: user.id,
          is_draft: true,
        })
        .leftJoinAndSelect('post.images', 'images', 'images.type = :type', {
          type: ImageType.THUMBNAIL,
        })
        .orderBy('post.created_at', orderBy)
        .limit(size)
        .offset((page - 1) * size);

      return await this.getPaginatedPosts(queryBuilder, page, size);
    } catch (error) {
      this.handleError(error, 'Get list my post draft failed');
    }
  }

  async updateToDraft(id: number, user: User) {
    try {
      const post = await this.postsRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      AccessControl.checkUserAccess(user, post.user.id);

      if (post.isDraft === false) {
        throw new BadRequestException('Post is not a draft');
      }

      return this.postsRepository.update(id, {
        isDraft: false,
      });
    } catch (error) {
      this.handleError(error, 'Update is draft post failed');
    }
  }

  async updateToStatus(id: number, status: UpdatePostStatus) {
    try {
      return this.postsRepository.update(id, {
        status: status as unknown as PostStatus,
      });
    } catch (error) {
      this.handleError(error, 'Update to status post failed');
    }
  }
}
