import { Module } from '@nestjs/common';
import { LlmService } from '../../infrastructure/ai/llm.service';
import { DocumentsModule } from '../documents/documents.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [DocumentsModule],
  controllers: [AiController],
  providers: [AiService, LlmService],
  exports: [AiService],
})
export class AiModule {}
