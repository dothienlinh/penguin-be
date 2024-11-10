import { ROLES_KEY } from '@libs/constants';
import { Roles as Role } from '@libs/enums';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
