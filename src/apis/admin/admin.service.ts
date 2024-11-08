import { Injectable } from '@nestjs/common';
import { DeletePostDto, RestorePostDto } from './dto/action-post.dto';
import { PostsService } from '@apis/posts/posts.service';
import { UsersService } from '@apis/users/users.service';
import { DeleteUserDto, RestoreUserDto } from './dto/action-user.dto';
import { User } from '@apis/users/entities/user.entity';
import { QueryListDto } from '@libs/base/base.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  async getRemovedPosts(query: QueryListDto) {
    return await this.postsService.adminGetRemovedPosts(query);
  }

  async getRemovedPostsByUser(query: QueryListDto) {
    return await this.postsService.adminGetRemovedPostsByUser(query);
  }

  async getRemovedPostDetail(id: number) {
    return await this.postsService.adminGetRemovedPostDetail(id);
  }

  async removePost(deletePostDto: DeletePostDto, user: User) {
    return await this.postsService.adminRemovePost(deletePostDto, user);
  }

  async restorePost(restorePostDto: RestorePostDto) {
    return await this.postsService.adminRestorePost(restorePostDto);
  }

  async getRemovedUsers(query: QueryListDto) {
    return await this.usersService.adminGetRemovedUsers(query);
  }

  async getRemovedUserDetail(id: number) {
    return await this.usersService.adminGetRemovedUserDetail(id);
  }

  async removeUser(deleteUserDto: DeleteUserDto, user: User) {
    return await this.usersService.adminRemoveUser(deleteUserDto, user);
  }

  async restoreUser(restoreUserDto: RestoreUserDto) {
    return await this.usersService.adminRestoreUser(restoreUserDto);
  }

  async getRemovedUsersByUser(query: QueryListDto) {
    return await this.usersService.adminGetRemovedUsersByUser(query);
  }
}
