import { PermissionsService } from '@apis/permissions/permissions.service';
import { RolesService } from '@apis/roles/roles.service';
import { UsersService } from '@apis/users/users.service';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class DatabasesService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async onModuleInit() {
    await this.usersService.createSuperAdmin();
    await this.rolesService.createRoles();
    await this.permissionsService.createPermissions();
  }
}
