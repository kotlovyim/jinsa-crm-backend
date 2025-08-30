import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { PrismaService } from '@app/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async generateOtp(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const secret = speakeasy.generateSecret();

    await this.prisma.user.update({
      where: { id: userId },
      data: { otpSecret: secret.base32 },
    });
    const qrCode = `otpauth://totp/${user.email}?secret=${secret.base32}`;

    return { qrCode };
  }

  async verifyOtp(userId: string, otpCode: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.otpSecret) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'base32',
      token: otpCode,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const payload = { id: user.id, isOtpEnabled: true };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get<string>('JWT_SECRET', 'change-me'),
    });

    if (!user.refreshToken) {
      const refreshToken = await this.jwt.signAsync(payload, {
        expiresIn: '7d',
        secret: this.config.get<string>('JWT_SECRET', 'change-me'),
      });
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isOtpEnabled: true },
    });

    return {
      message: 'OTP verified successfully',
      accessToken,
      refreshToken: user.refreshToken,
    };
  }
}
