import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
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

@Controller('user')
@UseGuards(JwtGuard)
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
}
