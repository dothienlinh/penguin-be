import { AuthModule } from '@apis/auth/auth.module';
import { CategoriesModule } from '@apis/categories/categories.module';
import { ChatsModule } from '@apis/chats/chats.module';
import { CommentsModule } from '@apis/comments/comments.module';
import { DatabasesModule } from '@apis/databases/databases.module';
import { ImagesModule } from '@apis/images/images.module';
import { LikesModule } from '@apis/likes/likes.module';
import { MailModule } from '@apis/mail/mail.module';
import { PermissionsModule } from '@apis/permissions/permissions.module';
import { PostsModule } from '@apis/posts/posts.module';
import { RolesModule } from '@apis/roles/roles.module';
import { SharesModule } from '@apis/shares/shares.module';
import { UploadModule } from '@apis/upload/upload.module';
import { UsersModule } from '@apis/users/users.module';
import { dataSourceOptions } from '@database/data-source';
import { JwtAuthGuard } from '@libs/guards/jwt-auth.guard';
import { PermissionGuard } from '@libs/guards/permission.guard';
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
    RolesModule,
    PermissionsModule,
    CategoriesModule,
    DatabasesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
