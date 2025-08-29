import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterCompanyDto } from './dto/RegisterCompanyDto';
import { PrismaService } from '../prisma/prisma.service';
import { signInDto } from './dto/LoginUserDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
            roles: {
              connect: { id: ceoRole.id },
            },
          },
        });

        return {
          message:
            'Company and owner registered successfully. Please set up OTP to continue.',
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        };
      });

      return result;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to register company. Please try again.');
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
        throw new UnauthorizedException("Passwords don't match");
      }

      const payload = { id: existingUser.id };

      const accessToken = await this.jwt.signAsync(payload, {
        expiresIn: '15m',
        secret: this.config.get<string>('JWT_SECRET', 'change-me'),
      });

      if (!existingUser.refreshToken) {
        const refreshToken = await this.jwt.signAsync(payload, {
          expiresIn: '7d',
          secret: this.config.get<string>('JWT_SECRET', 'change-me'),
        });
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { refreshToken },
        });
      }

      return {
        accessToken,
        refreshToken: existingUser.refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
