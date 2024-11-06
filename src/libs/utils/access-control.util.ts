import { ForbiddenException } from '@nestjs/common';
import { User } from '../../apis/users/entities/user.entity';
import { Roles } from '@libs/enums';

export class AccessControl {
  static checkUserAccess(currentUser: User, targetUserId: number): void {
    if (currentUser.role.name !== Roles.USER) return;

    const hasAccess = currentUser.id === targetUserId;

    if (!hasAccess) {
      throw new ForbiddenException(
        'You are not allowed to perform this action on another user',
      );
    }
  }

  static checkAdminAccess(currentUser: User): void {
    const isAdmin = currentUser.role.name !== Roles.USER;

    if (!isAdmin) {
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );
    }
  }

  static checkAdminOrUserAccess(currentUser: User, targetUserId: number): void {
    const isAdmin = currentUser.role.name !== Roles.USER;
    const isSameUser = currentUser.id === targetUserId;

    if (isAdmin || isSameUser) return;

    throw new ForbiddenException('You are not allowed to perform this action');
  }
}
