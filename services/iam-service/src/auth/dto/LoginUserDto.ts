import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class signInDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
