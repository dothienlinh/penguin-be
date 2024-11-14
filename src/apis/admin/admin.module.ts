import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';
import { RolesController } from './controllers/roles.controller';
import { UsersController } from './controllers/users.controller';
import { PostsService } from './services/posts.service';
import { RolesService } from './services/roles.service';
import { UsersService } from './services/users.service';

@Module({
  controllers: [PostsController, UsersController, RolesController],
  providers: [PostsService, UsersService, RolesService],
})
export class AdminModule {}
