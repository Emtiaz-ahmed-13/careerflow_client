import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class HealthController {
  @Get()
  v1Root() {
    return {
      name: 'CareerFlow API',
      version: '1.0',
      status: 'ok',
      docs: '/api/docs',
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'careerflow-api' };
  }
}
