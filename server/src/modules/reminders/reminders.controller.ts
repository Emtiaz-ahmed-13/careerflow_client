import { Controller, Get, Headers, Param, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RemindersService } from './reminders.service';

@ApiTags('reminders')
@Controller('reminders')
export class RemindersController {
  constructor(
    private reminders: RemindersService,
    private config: ConfigService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.reminders.listUpcoming(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('due-today')
  dueToday(@CurrentUser() user: { id: string }) {
    return this.reminders.listDueToday(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/complete')
  complete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.reminders.complete(user.id, id);
  }

  @Get('cron/process')
  @Post('cron/process')
  processCron(
    @Headers('x-cron-secret') cronSecret: string,
    @Headers('authorization') authorization?: string,
  ) {
    const expected = this.config.get('CRON_SECRET');
    const bearer = authorization?.replace(/^Bearer\s+/i, '');
    const valid = expected && (cronSecret === expected || bearer === expected);
    if (!valid) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    return this.reminders.processDueReminders();
  }
}
