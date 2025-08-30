import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterCompanyDto } from './dto/RegisterCompanyDto';
import { PrismaService } from '../prisma/prisma.service';
import { signInDto } from './dto/LoginUserDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
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
      const result = await this.prisma.$transaction(async (prisma) => {
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
      });

      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw new BadRequestException(
        'Failed to register company. Please try again.',
      );
    }
  }

  async signIn(dto: signInDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const undecoded = await bcrypt.compare(
        dto.password,
        existingUser.password,
      );

      if (!undecoded) {
        throw new BadRequestException("Passwords don't match");
      }

      if (existingUser.isOtpEnabled) {
        return {
          otpRequired: true,
        };
      }

      const payload = {
        id: existingUser.id,
        isOtpEnabled: existingUser.isOtpEnabled,
      };

      const accessToken = await this.jwt.signAsync(payload, {
        expiresIn: '15m',
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
    } catch (error) {
      throw new BadRequestException(error);
    }
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
}
