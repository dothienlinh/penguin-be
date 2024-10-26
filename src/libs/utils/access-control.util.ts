import { ForbiddenException } from '@nestjs/common';
import { User } from '../../apis/users/entities/user.entity';

export class AccessControl {
  static checkUserAccess(currentUser: User, targetUserId: number): void {
    if (currentUser.id !== targetUserId) {
      throw new ForbiddenException(
        'You are not allowed to perform this action on another user',
      );
    }
  }
}
