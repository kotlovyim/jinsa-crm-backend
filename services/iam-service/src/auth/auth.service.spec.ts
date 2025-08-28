import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const signUpDto = {
      firstName: 'testuser',
      lastName: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should create a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...signUpDto,
        password: 'hashedPassword',
        id: 1,
      });

      const result = await authService.signUp(signUpDto);
      expect(result).toBeDefined();
      expect(result.message).toBe('User created successfully');
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        email: 'test@example.com',
        id: 1,
        firstName: 'existinguser',
        lastName: 'existinguser',
      });

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle Prisma P2002 error (unique constraint)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const prismaError = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '1.0' } as any,
      );
      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        'Credentials errors',
      );
    });

    it('should handle other Prisma errors', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const prismaError = new PrismaClientKnownRequestError(
        'Some database error',
        { code: 'P1001', clientVersion: '1.0' } as any,
      );
      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        PrismaClientKnownRequestError,
      );
    });

    it('should handle unexpected errors', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(authService.signUp(signUpDto)).rejects.toThrow(Error);
    });
  });

  describe('signIn', () => {
    const signInDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password',
      firstName: 'testuser',
      lastName: 'testuser',
    };

    it('should return tokens for valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mockToken');

      const result = await authService.signIn(signInDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.signIn({
          ...signInDto,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle JWT signing errors', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockRejectedValue(
        new Error('JWT signing error'),
      );

      await expect(authService.signIn(signInDto)).rejects.toThrow(Error);
    });

    it('should handle bcrypt compare errors', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => {
        throw new Error('bcrypt error');
      });

      await expect(authService.signIn(signInDto)).rejects.toThrow(Error);
    });

    it('should handle unexpected errors during sign in', async () => {
      mockPrismaService.user.findUnique.mockImplementation(() => {
        throw new Error('Unexpected database error');
      });

      await expect(authService.signIn(signInDto)).rejects.toThrow(Error);
    });
  });
});
