import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../providers/prisma/prisma.service';
import { AuthService } from './auth.service';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterCompanyDto } from './dto/RegisterCompanyDto';
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    company: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
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
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('registerCompany', () => {
    const registerCompanyDto: RegisterCompanyDto = {
      companyName: 'Test Corp',
      firstName: 'testuser',
      lastName: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should create a new company and user, and return tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 1,
        role: 'CEO',
      });
      mockJwtService.signAsync.mockResolvedValue('mockToken');

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          company: {
            create: jest
              .fn()
              .mockResolvedValue({ id: 'company-uuid', name: 'Test Corp' }),
          },
          user: {
            create: jest.fn().mockResolvedValue({
              id: 'user-uuid',
              email: 'test@example.com',
            }),
            update: jest.fn().mockResolvedValue(true),
          },
        };
        return await callback(mockPrisma);
      });

      const result = await authService.registerCompany(registerCompanyDto);

      expect(result.message).toContain('registered successfully');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-uuid' });

      await expect(
        authService.registerCompany(registerCompanyDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if CEO role is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      await expect(
        authService.registerCompany(registerCompanyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a generic error if transaction fails', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 1,
        role: 'CEO',
      });
      mockPrismaService.$transaction.mockRejectedValue(
        new Error('Transaction failed'),
      );

      await expect(
        authService.registerCompany(registerCompanyDto),
      ).rejects.toThrow('Failed to register company. Please try again.');
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
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
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
