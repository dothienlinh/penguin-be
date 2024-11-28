import { PermissionsModule } from '@apis/permissions/permissions.module';
import { RolesModule } from '@apis/roles/roles.module';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { createMulterOptions } from '@libs/configs/multer/multer-options.factory';
import { IMAGE_TYPES } from '@libs/constants';
import { JwtModule } from '@nestjs/jwt';
import { ActiveGateway } from './gateways/active.gateway';

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
  ],
  controllers: [UsersController],
  providers: [UsersService, ActiveGateway],
  exports: [UsersService],
})
export class UsersModule {}
