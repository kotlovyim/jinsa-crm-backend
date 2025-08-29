import { SetMetadata } from '@nestjs/common';
import { Permission } from './permission.enum';

export const PERM_KEY = 'perm';
export const RequirePermission = (...permission: Permission[]) =>
  SetMetadata(PERM_KEY, permission);
