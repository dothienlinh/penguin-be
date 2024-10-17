import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from '@libs/configs/multer/multer.config';
import { ImagesModule } from '@apis/images/images.module';
import { LikesModule } from '@apis/likes/likes.module';
import { CommentsModule } from '@apis/comments/comments.module';
import { SharesModule } from '@apis/shares/shares.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
    ImagesModule,
    LikesModule,
    CommentsModule,
    SharesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
