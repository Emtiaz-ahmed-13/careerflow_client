import { Module } from '@nestjs/common';
import { ImageKitService } from '../../infrastructure/storage/imagekit.service';
import { AiModule } from '../ai/ai.module';
import { ApplicationsModule } from '../applications/applications.module';
import { RemindersModule } from '../reminders/reminders.module';
import { AiQuotaService } from './ai-quota.service';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

@Module({
  imports: [AiModule, ApplicationsModule, RemindersModule],
  controllers: [GoalsController],
  providers: [GoalsService, ImageKitService, AiQuotaService],
  exports: [GoalsService],
})
export class GoalsModule {}
