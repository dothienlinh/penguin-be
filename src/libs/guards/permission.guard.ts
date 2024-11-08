import { PERMISSIONS_KEY } from '@libs/constants';
import { Roles } from '@libs/enums';
import { ErrorHandler } from '@libs/utils/error-handler.utils';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private readonly logger = new Logger(PermissionGuard.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
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
