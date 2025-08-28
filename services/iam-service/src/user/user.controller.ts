import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtGuard } from 'src/auth/guards/authGuard';
import { updateUserDto } from './dto/UpdateUserDto';

@UseGuards(JwtGuard)  
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Get('/me')
  async getUserData(@GetUser() user: any) {
    return this.userService.getUserData(user)
  }

  @Patch('/me')
  async updateNonCriticalData(@Body() dto: updateUserDto, @GetUser() user: any) {    
    return this.userService.updateNonCriticalData(dto,user)
  } 

}
