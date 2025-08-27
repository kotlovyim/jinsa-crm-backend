import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { signUpDto } from './dto/RegisterUserDto';
import { signInDto } from './dto/LoginUserDto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const signUpData: signUpDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should call authService.signUp with correct parameters', async () => {
      const expectedResult = { id: 1, ...signUpData };
      mockAuthService.signUp.mockResolvedValue(expectedResult);

      const result = await controller.signUp(signUpData);
      expect(authService.signUp).toHaveBeenCalledWith(signUpData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('signIn', () => {
    const signInData: signInDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should call authService.signIn with correct parameters', async () => {
      const expectedResult = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      };
      mockAuthService.signIn.mockResolvedValue(expectedResult);

      const result = await controller.signIn(signInData);
      expect(authService.signIn).toHaveBeenCalledWith(signInData);
      expect(result).toEqual(expectedResult);
    });
  });
});
