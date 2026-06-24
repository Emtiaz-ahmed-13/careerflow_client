import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const apps = await this.prisma.jobApplication.findMany({ where: { userId } });
    const total = apps.length;
    const interviews = apps.filter((a) =>
      ['Interview', 'FinalInterview', 'Offer'].includes(a.status),
    ).length;
    const offers = apps.filter((a) => a.status === 'Offer').length;
    const rejections = apps.filter((a) => a.status === 'Rejected').length;
    const responded = apps.filter((a) => a.status !== 'Applied').length;

    return {
      totalApplications: total,
      interviews,
      offers,
      rejections,
      responseRate: total ? Math.round((responded / total) * 100) : 0,
      interviewRate: total ? Math.round((interviews / total) * 100) : 0,
      offerRate: total ? Math.round((offers / total) * 100) : 0,
      byStatus: {
        Applied: apps.filter((a) => a.status === 'Applied').length,
        Assessment: apps.filter((a) => a.status === 'Assessment').length,
        Interview: apps.filter((a) => a.status === 'Interview').length,
        FinalInterview: apps.filter((a) => a.status === 'FinalInterview').length,
        Offer: offers,
        Rejected: rejections,
      },
      weeklyApplies: this.getWeeklyApplies(apps),
    };
  }

  private getWeeklyApplies(apps: { createdAt: Date }[]) {
    const weeks: { week: string; count: number }[] = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      const label = i === 0 ? 'This week' : `W-${i}`;
      const count = apps.filter((a) => a.createdAt >= start && a.createdAt < end).length;
      weeks.push({ week: label, count });
    }
    return weeks;
  }
}
