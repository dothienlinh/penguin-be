import { PERMISSIONS_KEY } from '@libs/constants';
import { Permission } from '@libs/enums';
import { SetMetadata } from '@nestjs/common';

export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
