import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export const DAILY_AI_LIMIT = 4;

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

@Injectable()
export class AiQuotaService {
  constructor(private prisma: PrismaService) {}

  private todayKey() {
    return new Date(Date.now() + DHAKA_OFFSET_MS).toISOString().slice(0, 10);
  }

  async getUsage(userId: string) {
    const date = this.todayKey();
    const row = await this.prisma.dailyAiUsage.findUnique({
      where: { userId_date: { userId, date } },
    });
    const used = Math.min(row?.count ?? 0, DAILY_AI_LIMIT);
    return {
      aiAppliesUsed: used,
      aiAppliesLimit: DAILY_AI_LIMIT,
      aiAppliesRemaining: Math.max(0, DAILY_AI_LIMIT - used),
    };
  }

  async assertWithinLimit(userId: string) {
    const { aiAppliesRemaining } = await this.getUsage(userId);
    if (aiAppliesRemaining <= 0) {
      throw new HttpException(
        `Daily AI limit reached (${DAILY_AI_LIMIT}/day). Resets at midnight (Bangladesh time).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async consume(userId: string) {
    const date = this.todayKey();
    await this.prisma.dailyAiUsage.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, count: 1 },
      update: { count: { increment: 1 } },
    });
  }
}
