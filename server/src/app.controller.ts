import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  root() {
    return {
      name: 'CareerFlow API',
      status: 'ok',
      docs: '/api/docs',
      api: '/api/v1',
    };
  }
}
