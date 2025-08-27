import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signUpDto } from './dto/RegisterUserDto';
import { signInDto } from './dto/LoginUserDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async signUp(@Body() dto: signUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  async signIn(@Body() dto: signInDto) {
    return this.authService.signIn(dto);
  }
}
