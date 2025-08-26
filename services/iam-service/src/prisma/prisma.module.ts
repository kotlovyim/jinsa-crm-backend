import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [],
  providers: [PrismaService, ConfigService],
})
export class PrismaModule {}
