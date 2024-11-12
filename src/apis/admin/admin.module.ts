import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';
import { UsersController } from './controllers/users.controller';
import { PostsService } from './services/posts.service';
import { UsersService } from './services/users.service';

@Module({
  controllers: [PostsController, UsersController],
  providers: [PostsService, UsersService],
})
export class AdminModule {}
