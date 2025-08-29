import { BadRequestException, Injectable } from '@nestjs/common';
import { createRoleDto } from './dto/createRoleDto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAllRoles() {
    try {
      return await this.prisma.role.findMany();
    } catch (error) {
      throw error;
    }
  }

  async createRole(dto: createRoleDto) {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { role: dto.role },
      });
      if (existingRole) {
        throw new BadRequestException('Role already existed');
      }

      const create = await this.prisma.role.create({
        data: { role: dto.role },
      });

      return create;
    } catch (error) {
      throw error;
    }
  }

  async addPermissionForRole(roleId: number, permissionId: number) {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      const existingPermission = await this.prisma.permission.findUnique({
        where: { id: permissionId },
      });

      if (!existingRole) {
        throw new BadRequestException("Role doesn't exist");
      }

      if (!existingPermission) {
        throw new BadRequestException("Permission doesn't exist ");
      }

      return await this.prisma.role.update({
        where: {
          id: roleId,
        },
        data: {
          permission: {
            connect: { id: permissionId },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateRole(id: number, dto: createRoleDto) {
    try {
      const existingRole = await this.prisma.role.findUnique({ where: { id } });
      if (!existingRole) {
        throw new BadRequestException("Role doesn't exist");
      }

      const updateRole = await this.prisma.role.update({
        where: { id },
        data: {
          role: dto.role,
        },
      });

      return updateRole;
    } catch (error) {
      throw error;
    }
  }

  async deleteRole(id: number) {
    try {
      const existingRole = await this.prisma.role.findUnique({ where: { id } });
      if (!existingRole) {
        throw new BadRequestException("Role doesn't exist");
      }

      await this.prisma.role.delete({ where: { id } });

      return { message: 'Role deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async deletePermissionForRole(roleId: number, permissionId: number) {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      const existingPermission = await this.prisma.permission.findUnique({
        where: { id: permissionId },
      });

      if (!existingRole) {
        throw new BadRequestException("Role doesn't exist");
      }

      if (!existingPermission) {
        throw new BadRequestException("Permission doesn't exist ");
      }

      return await this.prisma.role.update({
        where: {
          id: roleId,
        },
        data: {
          permission: {
            disconnect: { id: permissionId },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
