import { Module } from '@nestjs/common';
import { ImageKitService } from '../../infrastructure/storage/imagekit.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ImageKitService],
  exports: [UsersService],
})
export class UsersModule {}
