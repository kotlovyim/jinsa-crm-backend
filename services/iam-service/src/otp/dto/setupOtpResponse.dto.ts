import { ApiProperty } from '@nestjs/swagger';

export class SetupOtpResponseDto {
  @ApiProperty({ example: 'OTP generated successfully' })
  message: string;
  @ApiProperty({ example: 'accessToken' })
  accessToken: string;
  @ApiProperty({ example: 'refreshToken' })
  refreshToken: string;
}
