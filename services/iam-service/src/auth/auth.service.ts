import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { signUpDto } from './dto/RegisterUserDto';
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

  async signUp(dto: signUpDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      const hash = await bcrypt.hash(dto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          password: hash,
        },
      });

      const accessToken = await this.jwt.signAsync({
        expiresIn: '1h',
        id: user.id,
      });

      const refreshToken = await this.jwt.signAsync({
        expiresIn: '7d',
        id: user.id,
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      return {
        message: 'User created successfully',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Credentials errors');
        }
      }
      throw error;
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
        expiresIn: '1h',
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
      throw error;
    }
  }
}
