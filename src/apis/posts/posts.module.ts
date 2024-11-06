import { CategoriesModule } from '@apis/categories/categories.module';
import { CommentsModule } from '@apis/comments/comments.module';
import { ImagesModule } from '@apis/images/images.module';
import { LikesModule } from '@apis/likes/likes.module';
import { SharesModule } from '@apis/shares/shares.module';
import { MulterConfigService } from '@libs/configs/multer/multer.config';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

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
    CategoriesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
