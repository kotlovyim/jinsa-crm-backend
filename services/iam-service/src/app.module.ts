import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './providers/prisma/prisma.module';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { OtpModule } from './otp/otp.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserModule,
    RolesModule,
    OtpModule,
    InvitationsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    AppService,
  ],
})
export class AppModule {}
