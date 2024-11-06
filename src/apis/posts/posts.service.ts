import { CategoriesService } from '@apis/categories/categories.service';
import { CommentsService } from '@apis/comments/comments.service';
import { AddCommentDto } from '@apis/comments/dto/add-comment.dto';
import { ImagesService } from '@apis/images/images.service';
import { LikesService } from '@apis/likes/likes.service';
import { SharesService } from '@apis/shares/shares.service';
import { User } from '@apis/users/entities/user.entity';
import { ImageType, LikeType, OrderBy, PostStatus, Roles } from '@libs/enums';
import { AccessControl } from '@libs/utils/access-control.util';
import { ErrorHandler } from '@libs/utils/error-handler.utils';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { IsNull, Not, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostDto } from './dto/list-post.dto';
import { SearchPostDto } from './dto/search-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { GetPostDto } from './dto/get-post.dto';
import { UploadImagePostDto } from './dto/upload-image-post.dto';
import { DeletePostDto, RestorePostDto } from '@apis/admin/dto/action-post.dto';

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
        !isDraft || !isPublished || status !== PostStatus.APPROVED;

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
        .where(conditions.join(' AND '), parameters)
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

  async getDetailPost(id: number, query: GetPostDto, user: User) {
    try {
      const { isDraft, isPublished, status } = query;

      const checkAccess =
        isDraft === true ||
        isPublished === false ||
        (status !== undefined && status !== PostStatus.APPROVED);

      const post = await this.postsRepository.findOne({
        where: {
          id,
          ...(isDraft !== undefined && { isDraft }),
          ...(isPublished !== undefined && { isPublished }),
          ...(status !== undefined && { status }),
        },
        relations: { user: true, images: true },
        select: {
          user: { id: true, username: true, avatar: true },
          images: { id: true, url: true, type: true },
        },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (checkAccess) {
        AccessControl.checkAdminOrUserAccess(user, post.user.id);
      }

      return plainToInstance(Post, post);
    } catch (error) {
      this.handleError(error, 'Get post detail failed');
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

  async listUserLikedPost(id: number) {
    try {
      const post = await this.findOne(id);
      const users = await this.likesService.getListUserLiked(post);
      return plainToInstance(User, users);
    } catch (error) {
      this.handleError(error, 'Get user like posts failed');
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

  async remove(id: number) {
    try {
      const post = await this.findOnePostAllRelations(id);

      return await this.postsRepository.softRemove(post);
    } catch (error) {
      this.handleError(error, 'Delete post failed');
    }
  }

  async restore(id: number, user: User) {
    try {
      const post = await this.isExistPostAndCheckAccess(id, user);
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
      const post = await this.isExistPostAndCheckAccess(postId, user);
      return this.commentsService.remove(commentId, post, user);
    } catch (error) {
      this.handleError(error, 'Remove comment failed');
    }
  }

  async restoreComment(postId: number, commentId: number, user: User) {
    try {
      const post = await this.isExistPostAndCheckAccess(postId, user);
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

      return await this.getPaginatedPosts(queryBuilder, page, size);
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

  async adminGetRemovedPosts() {
    try {
      return await this.postsRepository.find({
        where: {
          status: PostStatus.REJECTED,
          removedByAdmin: Not(IsNull()),
          removedAt: Not(IsNull()),
        },
        relations: { removedByAdmin: true },
      });
    } catch (error) {
      this.handleError(error, 'Admin get removed posts failed');
    }
  }

  async adminGetRemovedPostDetail(id: number) {
    try {
      return await this.postsRepository.findOne({
        where: { id, removedByAdmin: Not(IsNull()), removedAt: Not(IsNull()) },
        relations: { removedByAdmin: true },
      });
    } catch (error) {
      this.handleError(error, 'Admin get removed post detail failed');
    }
  }

  async adminRemovePost(deletePostDto: DeletePostDto, user: User) {
    try {
      return await this.postsRepository.update(deletePostDto.id, {
        status: PostStatus.REJECTED,
        removedReason: deletePostDto.removedReason,
        removedByAdmin: user,
        removedAt: new Date(),
      });
    } catch (error) {
      this.handleError(error, 'Admin remove post failed');
    }
  }

  async adminRestorePost(restorePostDto: RestorePostDto) {
    return await this.postsRepository.update(restorePostDto.id, {
      removedByAdmin: null,
      removedAt: null,
      status: PostStatus.APPROVED,
      removedReason: null,
    });
  }
}
