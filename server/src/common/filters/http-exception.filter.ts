import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ?? exception.message);

      response.status(status).json({
        statusCode: status,
        message: Array.isArray(message) ? message.join(', ') : message,
        path: request.url,
      });
      return;
    }

    const err = exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error(`${request.method} ${request.url}: ${err.message}`, err.stack);

    const isTimeout =
      /timeout|timed out|ETIMEDOUT|ECONNRESET|abort/i.test(err.message) ||
      err.name === 'AbortError';

    const isAi =
      isTimeout ||
      /groq|anthropic|gemini|openai|AI did not return|JSON\.parse|invalid json/i.test(
        err.message,
      );

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: isAi
        ? 'AI failed — please try again in a moment. If it keeps failing, paste the full job description and retry.'
        : 'Something went wrong — please try again.',
      path: request.url,
    });
  }
}
