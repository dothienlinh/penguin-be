import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { LikesModule } from '@apis/likes/likes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), LikesModule],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
