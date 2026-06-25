import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const r = res as any;
        if (r.code) {
          code = r.code;
          message = r.message || message;
        } else if (r.message) {
          message = Array.isArray(r.message) ? r.message.join(', ') : r.message;
          code = r.error?.toUpperCase().replace(/\s+/g, '_') || code;
        }
      } else if (typeof res === 'string') {
        message = res;
      }
    }

    response.status(status).json({ error: { code, message } });
  }
}
