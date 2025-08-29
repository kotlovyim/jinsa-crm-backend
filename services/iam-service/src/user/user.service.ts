import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { updateUserDto } from './dto/UpdateUserDto';
import { User } from './types/user.types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserData(user: User) {
    try {
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const userData = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          position: true,
          roles: true,
        },
      });

      if (!userData) {
        throw new NotFoundException('User not found');
      }

      return userData;
    } catch (error) {
      throw error;
    }
  }

  async updateNonCriticalData(dto: updateUserDto, user: User) {
    try {
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const update = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          position: dto.position,
        },
      });

      return update;
    } catch (error) {
      throw error;
    }
  }
  async assignRoleToUser(userId: string, roleId: number) {
    if (!userId || !roleId) {
      throw new NotFoundException('User or role not found');
    }
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          roles: {
            connect: {
              id: roleId,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
  async removeRoleFromUser(userId: string, roleId: number) {
    if (!userId || !roleId) {
      throw new NotFoundException('User or role not found');
    }
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          roles: {
            disconnect: {
              id: roleId,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
