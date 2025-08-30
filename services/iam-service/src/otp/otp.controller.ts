import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { User } from '@app/user/types/user.types';
import { GetUser } from '@app/auth/decorators/get-user.decorator';
import { JwtGuard } from '@app/auth/guards/jwtGuard';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { SetupOtpResponseDto } from './dto/setupOtpResponse.dto';
import { VerifyOtpResponseDto } from './dto/verifyOtpResponse.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('otp')
@UseGuards(JwtGuard)
export class OtpController {
  constructor(private otpService: OtpService) {}
  @Post('/setup')
  @ApiOperation({ summary: 'Get user data' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User data retrieved successfully',
    type: SetupOtpResponseDto,
  })
  async getUserData(@GetUser() user: User) {
    return this.otpService.generateOtp(user.id);
  }

  @Post('/verify')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Otp verified successfully',
    type: VerifyOtpResponseDto,
  })
  @ApiBody({ type: VerifyOtpDto })
  async verifyOtp(@GetUser() user: User, @Body() body: VerifyOtpDto) {
    return this.otpService.verifyOtp(user.id, body.otpCode);
  }
}
