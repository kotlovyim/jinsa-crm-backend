import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { updateUserDto } from './dto/UpdateUserDto';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { User } from '@app/user/types/user.types';
import { GetUser } from '@app/auth/decorators/get-user.decorator';
import { JwtGuard } from '@app/auth/guards/authGuard';
import { PermissionGuard } from '@app/auth/guards/permissionGuard';
import { Permission } from '@app/auth/decorators/permissions/permission.enum';
import { RequirePermission } from '@app/auth/decorators/permissions/requirePermission.decorator';

@Controller('user')
@UseGuards(JwtGuard, PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @ApiOperation({ summary: 'Get user data' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User data retrieved successfully',
    type: updateUserDto,
  })
  async getUserData(@GetUser() user: User) {
    return this.userService.getUserData(user);
  }

  @Patch('/me')
  @ApiOperation({ summary: 'Update user data' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User data updated successfully',
    type: updateUserDto,
  })
  @ApiBody({ type: updateUserDto })
  async updateNonCriticalData(
    @Body()
    dto: updateUserDto,
    @GetUser() user: User,
  ) {
    return this.userService.updateNonCriticalData(dto, user);
  }

  @Post('/:userId/roles/:roleId')
  @RequirePermission(Permission.manage_roles)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Role assigned to user successfully',
  })
  async assignRoleToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userService.assignRoleToUser(userId, roleId);
  }

  @Delete('/:userId/roles/:roleId')
  @RequirePermission(Permission.manage_roles)
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Role removed from user successfully',
  })
  async removeRoleFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userService.removeRoleFromUser(userId, roleId);
  }
}
