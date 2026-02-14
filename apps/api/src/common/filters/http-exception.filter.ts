import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;

        // Handle NestJS ValidationPipe errors (array of messages)
        if (Array.isArray(resObj.message)) {
          message = resObj.message[0] || 'Validation failed';
          // Group validation messages by field if possible
          errors = {};
          for (const msg of resObj.message) {
            // NestJS validation messages are like "name should not be empty"
            const field = msg.split(' ')[0];
            if (!errors[field]) errors[field] = [];
            errors[field].push(msg);
          }
        } else {
          message = resObj.message || 'An error occurred';
        }
      }
    }

    // Prisma-specific errors
    if ((exception as any)?.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      const target = (exception as any).meta?.target;
      message = `A record with this ${target?.join(', ') || 'value'} already exists`;
    }

    if ((exception as any)?.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Record not found';
    }

    response.status(status).json({
      statusCode: status,
      message,
      ...(errors && { errors }),
      success: false,
    });
  }
}
