import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class signInDto {
  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'qwerty123@',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
