import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { LikesController } from './likes.controller';
import { CommentsModule } from '@apis/comments/comments.module';
import { PostsModule } from '@apis/posts/posts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), PostsModule, CommentsModule],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
