import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpResponseDto {
  @ApiProperty({ example: 'Otp verified successfully' })
  message: string;
  @ApiProperty({ example: 'accessToken' })
  accessToken: string;
  @ApiProperty({ example: 'refreshToken' })
  refreshToken: string;
}
