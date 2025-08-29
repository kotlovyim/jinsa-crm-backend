import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../decorators/permissions/permission.enum';
import { PERM_KEY } from '../decorators/permissions/requirePermission.decorator';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const hasPermission = requiredPermissions.every((perm) =>
      user.roles?.permission?.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('User does not have permission');
    }
    return hasPermission;
  }
}
