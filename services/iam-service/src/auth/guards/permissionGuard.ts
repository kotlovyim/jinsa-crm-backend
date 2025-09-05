import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../decorators/permissions/permission.enum';
import { PERM_KEY } from '../decorators/permissions/requirePermission.decorator';
import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    const userWithRole = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        role: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!userWithRole || !userWithRole.role) {
      return false;
    }

    const userPermissions = userWithRole.role.permission.map(
      (p: { title: string }) => p.title,
    );

    const hasPermission = () =>
      requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

    if (!hasPermission()) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
