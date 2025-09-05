import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterCompanyDto } from './dto/RegisterCompanyDto';
import { PrismaService } from '../providers/prisma/prisma.service';
import { signInDto } from './dto/LoginUserDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import { RedisService } from '../providers/redis/redis.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  async registerCompany(dto: RegisterCompanyDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const ceoRole = await this.prisma.role.findUnique({
      where: { role: 'CEO' },
    });

    if (!ceoRole) {
      throw new NotFoundException(
        'CEO role not found. Please seed the database.',
      );
    }

    const hash = await bcrypt.hash(dto.password, 10);

    try {
      const result = await this.prisma.$transaction(
        async (prisma: PrismaService) => {
          const company = await prisma.company.create({
            data: {
              name: dto.companyName,
            },
          });

          const user = await prisma.user.create({
            data: {
              firstName: dto.firstName,
              lastName: dto.lastName,
              email: dto.email,
              password: hash,
              companyId: company.id,
              roleId: ceoRole.id,
            },
          });

          if (!user || !user.id) {
            throw new BadRequestException('Failed to create user');
          }

          const verificationToken = randomBytes(32).toString('hex');

          await this.redis
            .getClient()
            .set(`verify-email:${verificationToken}`, user.id, 'EX', 86400);

          // TODO: Send event to notification service to send email
          console.log(
            `Email verification token for ${user.email}: ${verificationToken}`,
          );

          const payload = { id: user.id, isOtpEnabled: false };

          const accessToken = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: this.config.get<string>('JWT_SECRET', 'change-me'),
          });

          const refreshToken = await this.jwt.signAsync(payload, {
            expiresIn: '7d',
            secret: this.config.get<string>('JWT_SECRET', 'change-me'),
          });

          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
          });

          if (!updatedUser) {
            throw new BadRequestException(
              'Failed to update user with refresh token',
            );
          }

          return {
            message: 'Company and owner registered successfully',
            accessToken,
            refreshToken,
          };
        },
      );

      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw new BadRequestException(
        'Failed to register company. Please try again.',
      );
    }
  }

  async verifyEmail(token: string) {
    const userId = await this.redis.getClient().get(`verify-email:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });

    await this.redis.getClient().del(`verify-email:${token}`);

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = randomBytes(32).toString('hex');
    await this.redis
      .getClient()
      .set(`password-reset:${resetToken}`, user.id, 'EX', 3600);

    // TODO: Send event to notification service to send email
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return { message: 'Password reset link sent to your email' };
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redis.getClient().get(`password-reset:${token}`);
    if (!userId) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });

    await this.redis.getClient().del(`password-reset:${token}`);

    return { message: 'Password reset successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_SECRET', 'change-me'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new BadRequestException('Invalid refresh token');
      }

      const newPayload = { id: user.id, companyId: user.companyId };

      const newAccessToken = await this.jwt.signAsync(newPayload, {
        expiresIn: '15m',
        secret: this.config.get<string>('JWT_SECRET', 'change-me'),
      });

      const newRefreshToken = await this.jwt.signAsync(newPayload, {
        expiresIn: '7d',
        secret: this.config.get<string>('JWT_SECRET', 'change-me'),
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async signIn(dto: signInDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (!existingUser.isActive) {
      throw new ForbiddenException('User is deactivated');
    }

    const undecoded = await bcrypt.compare(
      dto.password,
      existingUser.password,
    );

    if (!undecoded) {
      throw new BadRequestException("Passwords don't match");
    }

    const payload = {
      id: existingUser.id,
      companyId: existingUser.companyId,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '2h',
      secret: this.config.get<string>('JWT_SECRET', 'change-me'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: this.config.get<string>('JWT_SECRET', 'change-me'),
    });

    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyOtp(email: string, otpCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.otpSecret || '',
      encoding: 'base32',
      token: otpCode,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    const payload = { id: user.id, isOtpEnabled: true };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get<string>('JWT_SECRET', 'change-me'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: this.config.get<string>('JWT_SECRET', 'change-me'),
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      message: 'OTP verified successfully',
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }
}
