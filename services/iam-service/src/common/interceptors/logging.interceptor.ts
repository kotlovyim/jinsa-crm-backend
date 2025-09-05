import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ApiLogger');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const contentLength = response.get('content-length');
        const responseTime = Date.now() - startTime;

        this.logger.log(
          `${method} ${originalUrl} - ${response.statusCode} - ${responseTime}ms`,
        );

        if (contentLength) {
          this.logger.debug(`Response size: ${contentLength}`);
        }
      }),
    );
  }
}
