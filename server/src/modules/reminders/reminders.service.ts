import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../infrastructure/email/email.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private config: ConfigService,
  ) {}

  listUpcoming(userId: string) {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return this.prisma.reminder.findMany({
      where: { userId, isCompleted: false, remindAt: { gt: endOfToday } },
      orderBy: { remindAt: 'asc' },
      take: 20,
      include: { application: { select: { id: true, companyName: true, position: true } } },
    });
  }

  listDueToday(userId: string) {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return this.prisma.reminder.findMany({
      where: { userId, isCompleted: false, remindAt: { lte: endOfToday } },
      orderBy: { remindAt: 'asc' },
      take: 20,
      include: { application: { select: { id: true, companyName: true, position: true } } },
    });
  }

  async complete(userId: string, id: string) {
    const reminder = await this.prisma.reminder.findFirst({ where: { id, userId } });
    if (!reminder) return null;
    return this.prisma.reminder.update({
      where: { id },
      data: { isCompleted: true },
    });
  }

  createFollowUp(userId: string, applicationId: string, companyName: string, position: string) {
    const remindAt = new Date();
    remindAt.setDate(remindAt.getDate() + 3);
    return this.prisma.reminder.create({
      data: {
        userId,
        applicationId,
        title: `Follow up: ${position} @ ${companyName}`,
        remindAt,
      },
    });
  }

  async processDueReminders() {
    const now = new Date();
    const due = await this.prisma.reminder.findMany({
      where: { isCompleted: false, remindAt: { lte: now } },
      include: {
        user: { select: { email: true, firstName: true } },
        application: { select: { id: true, companyName: true, position: true, jobUrl: true } },
      },
      take: 50,
    });

    const clientUrl = this.config.get('CLIENT_URL', 'https://client-mocha-five-q1k2xjicnj.vercel.app');
    let emailed = 0;
    let failed = 0;

    for (const reminder of due) {
      if (!this.email.isConfigured()) {
        this.logger.warn('SMTP not configured — cannot send reminder emails');
        break;
      }

      const app = reminder.application;
      const roleLine = app
        ? `${app.position} at ${app.companyName}`
        : reminder.title.replace(/^Follow up:\s*/i, '');

      const body = [
        `Hi ${reminder.user.firstName},`,
        '',
        `Time to follow up on your application for ${roleLine}.`,
        '',
        app?.jobUrl ? `Job link: ${app.jobUrl}` : '',
        `Open CareerFlow: ${clientUrl}/dashboard`,
        app?.id ? `Application: ${clientUrl}/applications/${app.id}` : '',
        '',
        'Mark the reminder done once you have followed up.',
        '',
        '— CareerFlow',
      ]
        .filter(Boolean)
        .join('\n');

      try {
        await this.email.send({
          to: reminder.user.email,
          subject: `Follow up today: ${roleLine}`,
          content: body,
        });
        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { isCompleted: true },
        });
        emailed++;
      } catch (err) {
        failed++;
        const message = err instanceof Error ? err.message : 'unknown error';
        this.logger.error(`Reminder email failed for ${reminder.id}: ${message}`);
      }
    }

    return { processed: due.length, emailed, failed };
  }
}
