import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterCompanyDto } from './dto/RegisterCompanyDto';
import { signInDto } from './dto/LoginUserDto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    registerCompany: jest.fn(),
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

  describe('registerCompany', () => {
    const registerCompanyData: RegisterCompanyDto = {
      companyName: 'Test Corp',
      firstName: 'testuser',
      lastName: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should call authService.registerCompany with correct parameters', async () => {
      const expectedResult = { 
        message: 'Company and owner registered successfully. Please set up OTP to continue.',
        accessToken: 'some-token',
        refreshToken: 'some-refresh-token',
        user: { id: 'some-uuid', email: 'test@example.com', firstName: 'testuser', lastName: 'testuser' }
      };
      mockAuthService.registerCompany.mockResolvedValue(expectedResult);

      const result = await controller.registerCompany(registerCompanyData);
      expect(authService.registerCompany).toHaveBeenCalledWith(registerCompanyData);
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
