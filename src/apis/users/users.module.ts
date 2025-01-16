import { PermissionsModule } from '@apis/permissions/permissions.module';
import { RolesModule } from '@apis/roles/roles.module';
import { createMulterOptions } from '@libs/configs/multer/multer-options.factory';
import { RedisModule } from '@libs/configs/redis/redis.module';
import { IMAGE_TYPES } from '@libs/constants';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ActiveGateway } from './gateways/active.gateway';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MulterModule.registerAsync({
      useFactory: async () => {
        return await createMulterOptions({
          fileTypes: IMAGE_TYPES,
        });
      },
    }),
    RolesModule,
    PermissionsModule,
    JwtModule,
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, ActiveGateway],
  exports: [UsersService],
})
export class UsersModule {}
