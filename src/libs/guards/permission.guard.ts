import { PERMISSIONS_KEY } from '@libs/constants';
import { Permission, Roles } from '@libs/enums';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (user.role.name === Roles.SUPER_ADMIN) {
      return true;
    }

    return requiredPermissions.some((permission) =>
      user.role.permissions.includes(permission),
    );
  }
}
