import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@app/providers/prisma/prisma.service';
import { updateUserDto } from './dto/UpdateUserDto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
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
          role: true,
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
          roleId: roleId,
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
  async changeRole(userId: string, roleId: number) {
    if (!userId || !roleId) {
      throw new NotFoundException('User or role not found');
    }
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          roleId: roleId,
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

  async updateUserStatus(
    id: string,
    dto: UpdateUserStatusDto,
    requestingUser: User,
  ) {
    if (id === requestingUser.id) {
      throw new ForbiddenException('You cannot deactivate yourself.');
    }

    const userToUpdate = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      throw new NotFoundException('User not found.');
    }

    if (userToUpdate.companyId !== requestingUser.companyId) {
      throw new ForbiddenException(
        'You can only manage users in your own company.',
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: dto.isActive,
        refreshToken: null,
      },
    });

    return updatedUser;
  }
}
