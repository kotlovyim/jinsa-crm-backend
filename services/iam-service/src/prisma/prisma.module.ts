import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  controllers: [],
  providers: [PrismaService, ConfigService],
})
export class PrismaModule {}
