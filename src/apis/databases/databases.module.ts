import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { UsersModule } from '@apis/users/users.module';
import { RolesModule } from '@apis/roles/roles.module';
import { PermissionsModule } from '@apis/permissions/permissions.module';
import { CategoriesModule } from '@apis/categories/categories.module';

@Module({
  imports: [UsersModule, RolesModule, PermissionsModule, CategoriesModule],
  providers: [DatabasesService],
})
export class DatabasesModule {}
