import { BaseService } from '@libs/base/base.service';
import { PERMISSIONS_KEY } from '@libs/constants';
import { Roles } from '@libs/enums';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard extends BaseService implements CanActivate {
  constructor(private reflector: Reflector) {
    super(PermissionGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
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

      const hasPermission = requiredPermissions.some((permission) =>
        user.permissions.includes(permission),
      );

      return hasPermission;
    } catch (error) {
      return this.handleError(error, 'Permission guard error');
    }
  }
}
