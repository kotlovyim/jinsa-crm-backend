import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [OtpService],
  controllers: [OtpController],
  imports: [PrismaModule, JwtModule],
})
export class OtpModule {}
