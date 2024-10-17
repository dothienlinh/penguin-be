import { CommentsService } from '@apis/comments/comments.service';
import { AddCommentDto } from '@apis/comments/dto/add-comment.dto';
import { ImagesService } from '@apis/images/images.service';
import { LikesService } from '@apis/likes/likes.service';
import { User } from '@apis/users/entities/user.entity';
import { LikeType } from '@libs/enums';
import { ErrorHandler } from '@libs/utils/error-handler';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreatePostWithImagesDto } from './dto/create-post-with-images.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { SharesService } from '@apis/shares/shares.service';

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
  ) {}

  private getPostQueryBuilder() {
    return this.postsRepository
      .createQueryBuilder('post')
      .leftJoin('post.user', 'user')
      .addSelect(['user.id', 'user.lastName', 'user.firstName', 'user.avatar'])
      .leftJoinAndSelect('post.images', 'images')
      .leftJoin('post.likes', 'likes', 'likes.target_type = :target_type', {
        target_type: LikeType.POST,
      })
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .leftJoin('post.comments', 'comments')
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .leftJoin('post.shares', 'shares')
      .loadRelationCountAndMap('post.shareCount', 'post.shares');
  }

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
      relations: { images: true, likes: true, comments: true, shares: true },
      withDeleted,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async createWithImages(
    createPostWithImagesDto: CreatePostWithImagesDto,
    user: User,
  ) {
    try {
      const { images, ...postData } = createPostWithImagesDto;
      const post = this.postsRepository.create({ ...postData, user });
      const savedPost = await this.postsRepository.save(post);
      await this.imagesService.create({
        url: images.map((image) => image.filename),
        post: savedPost,
      });
      return { success: true };
    } catch (error) {
      this.handleError(error, 'Create post with images failed');
    }
  }

  async create(createPostDto: CreatePostDto, user: User) {
    try {
      const post = this.postsRepository.create({ ...createPostDto, user });
      await this.postsRepository.save(post);
      return { success: true };
    } catch (error) {
      this.handleError(error, 'Create post failed');
    }
  }

  async findAll() {
    try {
      const posts = await this.getPostQueryBuilder().getMany();
      return plainToInstance(Post, posts);
    } catch (error) {
      this.handleError(error, 'Get posts failed');
    }
  }

  async findOne(id: number) {
    try {
      const post = await this.getPostQueryBuilder()
        .where('post.id = :id', { id })
        .getOne();
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

  async myPosts(user: User) {
    try {
      const posts = await this.getPostQueryBuilder()
        .where('post.user_id = :user_id', { user_id: user.id })
        .orderBy('post.createdAt', 'DESC')
        .getMany();
      return plainToInstance(Post, posts);
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
}
