import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
@Injectable()
export class OtpEnabledGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    console.log(user);
    if (!user?.isOtpEnabled) {
      throw new ForbiddenException({
        message: 'User OTP is not enabled',
        code: 'OTP_NOT_ENABLED',
      });
    }
    return true;
  }
}
