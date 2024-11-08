import { CategoriesModule } from '@apis/categories/categories.module';
import { ImagesModule } from '@apis/images/images.module';
import { createMulterOptions } from '@libs/configs/multer/multer-options.factory';
import { IMAGE_TYPES } from '@libs/constants';
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
      useFactory: async () => {
        return await createMulterOptions({
          fileTypes: IMAGE_TYPES,
        });
      },
    }),
    ImagesModule,
    CategoriesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
