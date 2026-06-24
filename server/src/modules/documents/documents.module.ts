import { Module } from '@nestjs/common';
import { ImageKitService } from '../../infrastructure/storage/imagekit.service';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, ImageKitService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
