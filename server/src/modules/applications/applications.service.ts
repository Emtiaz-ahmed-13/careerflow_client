import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto, UpdateStatusDto } from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, status?: string) {
    return this.prisma.jobApplication.findMany({
      where: { userId, ...(status ? { status: status as any } : {}) },
      orderBy: [{ kanbanOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        coverLetters: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, content: true, createdAt: true },
        },
        applicationEmails: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, subject: true, content: true, createdAt: true },
        },
        resumeAnalyses: {
          where: { analysisType: 'Match' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { matchScore: true },
        },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const app = await this.prisma.jobApplication.findFirst({
      where: { id, userId },
      include: {
        coverLetters: { orderBy: { createdAt: 'desc' }, select: { id: true, content: true, createdAt: true } },
        applicationEmails: { orderBy: { createdAt: 'desc' }, select: { id: true, subject: true, content: true, createdAt: true } },
        resumeAnalyses: {
          where: { analysisType: 'Match' },
          orderBy: { createdAt: 'desc' },
          select: { matchScore: true, strongSkills: true, missingSkills: true, suggestions: true, createdAt: true },
        },
        reminders: {
          orderBy: { remindAt: 'asc' },
          select: { id: true, title: true, remindAt: true, isCompleted: true, createdAt: true },
        },
      },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  create(userId: string, dto: CreateApplicationDto) {
    return this.prisma.jobApplication.create({
      data: {
        userId,
        companyName: dto.companyName,
        position: dto.position,
        jobUrl: dto.jobUrl,
        salary: dto.salary,
        location: dto.location,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        notes: dto.notes,
        jobDescriptionText: dto.jobDescriptionText,
        status: dto.status,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    await this.findOne(userId, id);
    const { coverLetterContent, emailSubject, emailContent, ...appFields } = dto;

    const app = await this.prisma.jobApplication.update({
      where: { id },
      data: {
        ...appFields,
        deadline: appFields.deadline ? new Date(appFields.deadline) : undefined,
      },
    });

    if (coverLetterContent != null) {
      const letter = await this.prisma.coverLetter.findFirst({
        where: { applicationId: id, userId },
        orderBy: { createdAt: 'desc' },
      });
      if (letter) {
        await this.prisma.coverLetter.update({
          where: { id: letter.id },
          data: { content: coverLetterContent },
        });
      }
    }

    if (emailSubject != null || emailContent != null) {
      const email = await this.prisma.applicationEmail.findFirst({
        where: { applicationId: id, userId },
        orderBy: { createdAt: 'desc' },
      });
      if (email) {
        await this.prisma.applicationEmail.update({
          where: { id: email.id },
          data: {
            ...(emailSubject != null ? { subject: emailSubject } : {}),
            ...(emailContent != null ? { content: emailContent } : {}),
          },
        });
      }
    }

    return this.findOne(userId, app.id);
  }

  async updateStatus(userId: string, id: string, dto: UpdateStatusDto) {
    await this.findOne(userId, id);
    return this.prisma.jobApplication.update({
      where: { id },
      data: { status: dto.status, kanbanOrder: dto.kanbanOrder ?? 0 },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.jobApplication.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}
