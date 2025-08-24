import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
        details = responseObj.details;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      
      // Handle validation errors specifically
      if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        error = 'Validation Error';
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    if (details) {
      errorResponse.details = details;
    }

    // Log the error for monitoring
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[];
    let error: string;
    let details: any = undefined;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || exception.message;
      error = responseObj.error || exception.name;
      details = responseObj.details;
    } else {
      message = exceptionResponse as string;
      error = exception.name;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    if (details) {
      errorResponse.details = details;
    }

    // Log different levels based on status code
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse)}`,
        exception.stack,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse)}`,
      );
    } else {
      this.logger.log(
        `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}