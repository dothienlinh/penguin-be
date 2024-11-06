import { Injectable } from '@nestjs/common';
import { DeletePostDto, RestorePostDto } from './dto/action-post.dto';
import { PostsService } from '@apis/posts/posts.service';
import { UsersService } from '@apis/users/users.service';
import { DeleteUserDto, RestoreUserDto } from './dto/action-user.dto';
import { User } from '@apis/users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  async getRemovedPosts() {
    return await this.postsService.adminGetRemovedPosts();
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

  async getRemovedUsers() {
    return await this.usersService.adminGetRemovedUsers();
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
}
