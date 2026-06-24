import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AnalysisType, ApplicationStatus, DocumentType, ResumeTrack } from '../../generated/prisma/client';
import { EmailService } from '../../infrastructure/email/email.service';
import { ImageKitService } from '../../infrastructure/storage/imagekit.service';
import { AiService, LOW_MATCH_THRESHOLD } from '../ai/ai.service';
import { ApplicationsService } from '../applications/applications.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RemindersService } from '../reminders/reminders.service';
import { COMMITMENT_OPTIONS } from './dto/set-commitment.dto';
import { GoalSessionConfirmDto } from './dto/goal-session-preview.dto';
import { GoalSessionPreviewDto } from './dto/goal-session-preview.dto';
import { GoalSessionDto } from './dto/goal-session.dto';

const TRACKS: ResumeTrack[] = ['Backend', 'Frontend', 'SoftwareEngineer'];

function normalizeTrack(track: string | undefined, fallback: ResumeTrack): ResumeTrack {
  if (track && TRACKS.includes(track as ResumeTrack)) return track as ResumeTrack;
  return fallback;
}

@Injectable()
export class GoalsService {
  private readonly logger = new Logger(GoalsService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private applications: ApplicationsService,
    private email: EmailService,
    private imagekit: ImageKitService,
    private reminders: RemindersService,
  ) {}

  private dayKey(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }

  private todayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private async getApplyDays(userId: string) {
    const apps = await this.prisma.jobApplication.findMany({
      where: { userId },
      select: { createdAt: true },
    });
    const counts = new Map<string, number>();
    for (const app of apps) {
      const key = this.dayKey(app.createdAt);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }

  private calculateStreak(
    applyDays: Map<string, number>,
    dailyTarget: number,
    startedAt: Date,
  ) {
    const started = new Date(startedAt);
    started.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = this.dayKey(today);

    let cursor = new Date(today);
    if ((applyDays.get(todayKey) ?? 0) < dailyTarget) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    while (cursor >= started) {
      if ((applyDays.get(this.dayKey(cursor)) ?? 0) >= dailyTarget) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  private async getOrCreateGoal(userId: string) {
    const existing = await this.prisma.userGoal.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.userGoal.create({
      data: { userId, dailyTarget: 1, commitmentDays: 30 },
    });
  }

  private async resolveJobInput(dto: GoalSessionPreviewDto) {
    let jobDescriptionText = dto.jobDescriptionText?.trim() ?? '';
    let jobUrl = dto.jobUrl?.trim();

    const urlInText = jobDescriptionText.match(/https?:\/\/[^\s]+/i)?.[0];
    if (!jobUrl && urlInText) jobUrl = urlInText;

    if (jobUrl && jobDescriptionText.length < 150) {
      try {
        const fetched = await this.ai.fetchJobFromUrl(jobUrl);
        if (fetched.description.length > jobDescriptionText.length) {
          jobDescriptionText = fetched.description;
        }
      } catch {
        if (jobDescriptionText.length < 50) {
          throw new BadRequestException(
            'Could not fetch job from URL. Copy-paste the full LinkedIn job description.',
          );
        }
      }
    }

    if (jobDescriptionText.length < 50) {
      throw new BadRequestException('Paste job description or a LinkedIn job URL');
    }

    return { jobDescriptionText, jobUrl: jobUrl ?? null };
  }

  async setCommitment(userId: string, commitmentDays: number) {
    if (!COMMITMENT_OPTIONS.includes(commitmentDays as (typeof COMMITMENT_OPTIONS)[number])) {
      throw new BadRequestException('Invalid commitment length');
    }
    const now = new Date();
    return this.prisma.userGoal.upsert({
      where: { userId },
      create: { userId, commitmentDays, dailyTarget: 1, startedAt: now },
      update: { commitmentDays, startedAt: now },
    });
  }

  async getDailyGoal(userId: string) {
    const goal = await this.getOrCreateGoal(userId);
    const { start, end } = this.todayRange();
    const completedToday = await this.prisma.jobApplication.count({
      where: { userId, createdAt: { gte: start, lte: end } },
    });

    const applyDays = await this.getApplyDays(userId);
    const streak = this.calculateStreak(applyDays, goal.dailyTarget, goal.startedAt);
    const met = completedToday >= goal.dailyTarget;

    const started = new Date(goal.startedAt);
    started.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    const commitmentDay = Math.min(
      goal.commitmentDays,
      Math.floor((today.getTime() - started.getTime()) / msPerDay) + 1,
    );
    const commitmentDaysRemaining = Math.max(0, goal.commitmentDays - commitmentDay);

    let commitmentDaysHit = 0;
    for (let i = 0; i < goal.commitmentDays; i++) {
      const day = new Date(started);
      day.setDate(day.getDate() + i);
      if (day > today) break;
      if ((applyDays.get(this.dayKey(day)) ?? 0) >= goal.dailyTarget) {
        commitmentDaysHit++;
      }
    }

    const commitmentActive = commitmentDay <= goal.commitmentDays;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const missedYesterday =
      commitmentDay > 1 &&
      yesterday >= started &&
      (applyDays.get(this.dayKey(yesterday)) ?? 0) < goal.dailyTarget;
    const streakBroken = !met && missedYesterday;

    let message: string;
    if (!commitmentActive) {
      message = `${goal.commitmentDays}-day commitment complete! Set a new one to keep going.`;
    } else if (met) {
      message = `Day ${commitmentDay}/${goal.commitmentDays} done — ${streak} day streak!`;
    } else if (streakBroken) {
      message = `Streak broke! Apply today to restart your ${goal.commitmentDays}-day challenge.`;
    } else {
      message = `Day ${commitmentDay}/${goal.commitmentDays} — apply today to keep your ${streak > 0 ? `${streak} day ` : ''}streak alive`;
    }

    return {
      target: goal.dailyTarget,
      completedToday: met ? goal.dailyTarget : Math.min(completedToday, goal.dailyTarget),
      appliesToday: completedToday,
      met,
      streak,
      streakBroken,
      commitmentDays: goal.commitmentDays,
      commitmentDay,
      commitmentDaysRemaining,
      commitmentDaysHit,
      commitmentActive,
      startedAt: goal.startedAt.toISOString(),
      message,
    };
  }

  async getResumeVault(userId: string) {
    const docs = await this.prisma.document.findMany({
      where: { userId, type: DocumentType.Resume, resumeTrack: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    const byTrack = Object.fromEntries(
      TRACKS.map((track) => [track, docs.find((d) => d.resumeTrack === track) ?? null]),
    ) as Record<ResumeTrack, (typeof docs)[0] | null>;

    return { tracks: TRACKS, resumes: byTrack };
  }

  async getOnboardingStatus(userId: string) {
    const [resumeCount, goal, applicationCount] = await Promise.all([
      this.prisma.document.count({ where: { userId, type: DocumentType.Resume } }),
      this.prisma.userGoal.findUnique({ where: { userId } }),
      this.prisma.jobApplication.count({ where: { userId } }),
    ]);
    const hasResume = resumeCount > 0;
    const hasCommitment = !!goal;
    const completed = applicationCount > 0 || (hasResume && hasCommitment);
    return { completed, hasResume, hasCommitment, applicationCount };
  }

  completeOnboarding(userId: string) {
    return this.getOnboardingStatus(userId).then((status) => {
      if (!status.hasResume) {
        throw new BadRequestException('Upload a resume to finish onboarding');
      }
      if (!status.hasCommitment) {
        throw new BadRequestException('Pick a commitment period first');
      }
      return { ...status, completed: true };
    });
  }

  async skipOnboarding(userId: string) {
    await this.getOrCreateGoal(userId);
    return { completed: true, skipped: true, hasResume: false, hasCommitment: true };
  }

  async previewSession(userId: string, dto: GoalSessionPreviewDto) {
    const { jobDescriptionText, jobUrl } = await this.resolveJobInput(dto);

    const [suggested, parsed] = await Promise.all([
      this.ai.suggestResumeTrack(jobDescriptionText),
      this.ai.parseJobDescription(jobDescriptionText),
    ]);

    const resumeTrack = normalizeTrack(
      dto.resumeTrack ?? suggested.track,
      dto.resumeTrack ?? 'SoftwareEngineer',
    );
    const resume = await this.prisma.document.findFirst({
      where: { userId, type: DocumentType.Resume, resumeTrack },
    });
    if (!resume?.extractedText) {
      throw new BadRequestException(
        `Upload your ${resumeTrack} resume once in the vault above`,
      );
    }

    const companyName =
      parsed.companyName !== 'Unknown Company' ? parsed.companyName : 'Unknown Company';
    const position = parsed.position !== 'Unknown Position' ? parsed.position : 'Unknown Position';

    const [match, email] = await Promise.all([
      this.ai.matchResumePreview(userId, resume.id, jobDescriptionText),
      this.ai.generateEmailContent(userId, jobDescriptionText, companyName, position),
    ]);

    return {
      jobDescriptionText,
      jobUrl: jobUrl ?? parsed.jobUrl,
      resumeTrack,
      suggestedTrack: suggested,
      parsed: {
        companyName,
        position,
        jobUrl: jobUrl ?? parsed.jobUrl,
        recruiterEmail: parsed.recruiterEmail,
      },
      match,
      email: { subject: email.subject, content: email.content },
      lowMatch: match.matchScore < LOW_MATCH_THRESHOLD,
      matchThreshold: LOW_MATCH_THRESHOLD,
      emailConfigured: this.email.isConfigured(),
    };
  }

  async confirmSession(userId: string, dto: GoalSessionConfirmDto) {
    if (dto.skipApply) {
      return { skipped: true, message: 'Application skipped due to low match score' };
    }

    let companyName = dto.companyName?.trim();
    let position = dto.position?.trim();
    let jobUrl = dto.jobUrl;
    let recruiterEmail = dto.recruiterEmail;

    if (!companyName || !position) {
      const parsed = await this.ai.parseJobDescription(dto.jobDescriptionText);
      companyName =
        companyName ||
        (parsed.companyName !== 'Unknown Company' ? parsed.companyName : 'Unknown Company');
      position =
        position || (parsed.position !== 'Unknown Position' ? parsed.position : 'Unknown Position');
      jobUrl = jobUrl || parsed.jobUrl || undefined;
      recruiterEmail = recruiterEmail || parsed.recruiterEmail || undefined;
    }

    const resume = await this.prisma.document.findFirst({
      where: { userId, type: DocumentType.Resume, resumeTrack: dto.resumeTrack },
    });
    if (!resume) {
      throw new BadRequestException(`Upload your ${dto.resumeTrack} resume first`);
    }

    const application = await this.applications.create(userId, {
      companyName,
      position,
      jobUrl,
      jobDescriptionText: dto.jobDescriptionText,
      notes: recruiterEmail ? `Recruiter: ${recruiterEmail}` : undefined,
      status: ApplicationStatus.Applied,
    });

    const [matchRecord, emailRecord, dailyGoal, reminder] = await Promise.all([
      dto.matchScore != null
        ? this.prisma.resumeAnalysis.create({
            data: {
              userId,
              documentId: resume.id,
              applicationId: application.id,
              analysisType: AnalysisType.Match,
              matchScore: dto.matchScore,
              strongSkills: [],
              missingSkills: [],
              weakAreas: [],
              suggestions: [],
            },
          })
        : this.ai.matchResume(userId, resume.id, dto.jobDescriptionText, application.id),
      this.prisma.applicationEmail.create({
        data: {
          userId,
          applicationId: application.id,
          companyName,
          position,
          jobDescriptionText: dto.jobDescriptionText,
          subject: dto.emailSubject,
          content: dto.emailContent,
        },
      }),
      this.getDailyGoal(userId),
      this.reminders.createFollowUp(userId, application.id, companyName, position),
    ]);

    let emailSent = false;
    let resumeAttached = false;
    let emailError: string | undefined;
    if (dto.sendEmail && recruiterEmail) {
      const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
      try {
        const resumeBuffer = await this.imagekit.downloadBuffer(resume.fileUrl, resume.fileId);
        const resumeFileName = resume.fileName.toLowerCase().endsWith('.pdf')
          ? resume.fileName
          : `${resume.fileName.replace(/\.[^.]+$/, '')}.pdf`;

        await this.email.send({
          to: recruiterEmail,
          subject: dto.emailSubject,
          content: dto.emailContent,
          replyTo: user.email,
          attachments: [{ filename: resumeFileName, content: resumeBuffer }],
        });
        emailSent = true;
        resumeAttached = true;
        this.logger.log(`Resume attached (${resumeBuffer.length} bytes): ${resumeFileName}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Email send failed';
        this.logger.error(`Failed to send application email to ${recruiterEmail}: ${message}`);
        emailError = message;
      }
    }

    return {
      application,
      match: matchRecord,
      email: emailRecord,
      dailyGoal,
      reminder,
      recruiterEmail: recruiterEmail ?? null,
      emailSent,
      resumeAttached,
      emailError,
      parsed: { companyName, position, jobUrl: jobUrl ?? null, recruiterEmail: recruiterEmail ?? null },
    };
  }

  /** @deprecated Use previewSession + confirmSession */
  async runSession(userId: string, dto: GoalSessionDto) {
    const preview = await this.previewSession(userId, {
      resumeTrack: dto.resumeTrack,
      jobDescriptionText: dto.jobDescriptionText,
      jobUrl: dto.jobUrl,
    });
    return this.confirmSession(userId, {
      resumeTrack: dto.resumeTrack,
      jobDescriptionText: preview.jobDescriptionText,
      companyName: dto.companyName,
      position: dto.position,
      jobUrl: dto.jobUrl ?? preview.jobUrl ?? undefined,
      recruiterEmail: dto.recruiterEmail,
      emailSubject: preview.email.subject,
      emailContent: preview.email.content,
      matchScore: preview.match.matchScore,
    });
  }
}
