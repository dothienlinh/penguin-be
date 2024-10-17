import { AuthModule } from '@apis/auth/auth.module';
import { ChatsModule } from '@apis/chats/chats.module';
import { CommentsModule } from '@apis/comments/comments.module';
import { ImagesModule } from '@apis/images/images.module';
import { LikesModule } from '@apis/likes/likes.module';
import { MailModule } from '@apis/mail/mail.module';
import { PostsModule } from '@apis/posts/posts.module';
import { SharesModule } from '@apis/shares/shares.module';
import { UploadModule } from '@apis/upload/upload.module';
import { UsersModule } from '@apis/users/users.module';
import { dataSourceOptions } from '@database/data-source';
import { JwtAuthGuard } from '@libs/guards/jwt-auth.guard';
import { TransformInterceptor } from '@libs/interceptors/response.interceptor';
import { interpolateEnvVariables } from '@libs/utils/env-utils';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [() => interpolateEnvVariables(process.env)],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        return dataSourceOptions;
      },
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    ImagesModule,
    CommentsModule,
    LikesModule,
    SharesModule,
    ChatsModule,
    MailModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
