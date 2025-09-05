import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaService } from '@app/providers/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PrismaService, ConfigService],
})
export class RolesModule {}
