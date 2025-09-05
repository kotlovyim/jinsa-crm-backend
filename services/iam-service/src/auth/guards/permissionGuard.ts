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

    const userRole = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        roleId: true,
      },
    });
    console.log(userRole);

    const userPermission = await this.prisma.role.findUnique({
      where: {
        id: userRole?.roleId,
      },
    });
    console.log(userPermission);

    return true;
  }
}
