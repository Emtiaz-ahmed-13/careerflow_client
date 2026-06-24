import { BadRequestException, Injectable } from '@nestjs/common';
import { AnalysisType } from '../../generated/prisma/client';
import { LlmService } from '../../infrastructure/ai/llm.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { DocumentsService } from '../documents/documents.service';

export const LOW_MATCH_THRESHOLD = 50;

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private llm: LlmService,
    private documents: DocumentsService,
  ) {}

  private async getUser(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }

  private mapUser(user: Awaited<ReturnType<typeof this.getUser>>) {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      linkedinUrl: user.linkedinUrl,
      githubUrl: user.githubUrl,
      headline: user.headline ?? undefined,
      emailStyle: user.emailStyle ?? undefined,
      coverLetterStyle: user.coverLetterStyle ?? undefined,
    };
  }

  async matchResumePreview(userId: string, documentId: string, jobDescriptionText: string) {
    const doc = await this.documents.findOne(userId, documentId);
    if (!doc.extractedText) throw new BadRequestException('No text extracted from resume');
    return this.llm.analyzeResumeMatch(doc.extractedText, jobDescriptionText);
  }

  async matchResume(userId: string, documentId: string, jobDescriptionText: string, applicationId?: string) {
    const result = await this.matchResumePreview(userId, documentId, jobDescriptionText);
    return this.prisma.resumeAnalysis.create({
      data: {
        userId,
        documentId,
        applicationId,
        analysisType: AnalysisType.Match,
        matchScore: result.matchScore,
        strongSkills: result.strongSkills,
        missingSkills: result.missingSkills,
        weakAreas: result.weakAreas,
        suggestions: result.suggestions,
        rawAiResponse: result,
      },
    });
  }

  async quickMatch(userId: string, jobDescriptionText: string, documentId?: string) {
    if (!documentId) {
      const latest = await this.prisma.document.findFirst({
        where: { userId, type: 'Resume' },
        orderBy: { createdAt: 'desc' },
      });
      if (!latest?.extractedText) throw new BadRequestException('Upload a resume first');
      documentId = latest.id;
    }
    return this.matchResume(userId, documentId, jobDescriptionText);
  }

  async reviewResume(userId: string, documentId: string) {
    const doc = await this.documents.findOne(userId, documentId);
    if (!doc.extractedText) throw new BadRequestException('No text extracted from resume');
    const result = await this.llm.reviewResume(doc.extractedText);
    return this.prisma.resumeAnalysis.create({
      data: {
        userId,
        documentId,
        analysisType: AnalysisType.Review,
        atsScore: result.atsScore,
        grammarIssues: result.grammarIssues,
        formattingIssues: result.formattingIssues,
        missingKeywords: result.missingKeywords,
        suggestions: result.suggestions,
        rawAiResponse: result,
      },
    });
  }

  async generateCoverLetterContent(userId: string, resumeDocumentId: string, jobDescriptionText: string) {
    const user = await this.getUser(userId);
    const doc = await this.documents.findOne(userId, resumeDocumentId);
    if (!doc.extractedText) throw new BadRequestException('No text extracted from resume');
    return this.llm.generateCoverLetter(
      doc.extractedText,
      jobDescriptionText,
      this.mapUser(user),
      user.coverLetterStyle ?? undefined,
    );
  }

  async generateCoverLetter(userId: string, resumeDocumentId: string, jobDescriptionText: string, applicationId?: string) {
    const result = await this.generateCoverLetterContent(userId, resumeDocumentId, jobDescriptionText);
    return this.prisma.coverLetter.create({
      data: {
        userId,
        applicationId,
        resumeDocumentId,
        jobDescriptionText,
        content: result.content,
        tone: 'Custom',
      },
    });
  }

  async generateEmailContent(
    userId: string,
    jobDescriptionText: string,
    companyName: string,
    position: string,
  ) {
    const user = await this.getUser(userId);
    return this.llm.generateApplicationEmail(
      jobDescriptionText,
      this.mapUser(user),
      companyName,
      position,
      user.emailStyle ?? undefined,
    );
  }

  async generateEmail(
    userId: string,
    jobDescriptionText: string,
    companyName: string,
    position: string,
    applicationId?: string,
  ) {
    const result = await this.generateEmailContent(userId, jobDescriptionText, companyName, position);
    return this.prisma.applicationEmail.create({
      data: {
        userId,
        applicationId,
        companyName,
        position,
        jobDescriptionText,
        subject: result.subject,
        content: result.content,
      },
    });
  }

  async generateInterviewQuestions(userId: string, jobDescriptionText: string, category: 'HR' | 'Technical' | 'Behavioral', applicationId?: string) {
    const result = await this.llm.generateInterviewQuestions(jobDescriptionText, category);
    return this.prisma.interviewQuestion.create({
      data: {
        userId,
        applicationId,
        jobDescriptionText,
        category,
        questions: result.questions,
      },
    });
  }

  async careerInsights(userId: string) {
    const apps = await this.prisma.jobApplication.findMany({
      where: { userId },
      select: { companyName: true, position: true, status: true, jobDescriptionText: true },
    });
    const summary = apps.map((a) => `${a.position} at ${a.companyName} — ${a.status}`).join('\n');
    return this.llm.generateCareerInsights(summary || 'No applications yet');
  }

  async parseJobDescription(jobDescriptionText: string) {
    const text = jobDescriptionText.trim();
    if (text.length < 50) {
      throw new BadRequestException('Paste a longer job description (at least 50 characters)');
    }
    return this.llm.extractJobDetails(text);
  }

  async suggestResumeTrack(jobDescriptionText: string) {
    const text = jobDescriptionText.trim();
    if (text.length < 50) {
      throw new BadRequestException('Paste a longer job description to suggest resume type');
    }
    return this.llm.suggestResumeTrack(text);
  }

  async fetchJobFromUrl(url: string) {
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    const res = await fetch(parsed.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new BadRequestException(`Could not fetch URL (${res.status}). Copy-paste the job description instead.`);
    }

    const html = await res.text();
    const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1];
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1];
    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const description = (ogDesc ?? bodyText).slice(0, 15000);
    if (description.length < 80) {
      throw new BadRequestException(
        'Could not extract job text from URL (LinkedIn often blocks bots). Copy-paste the full job description.',
      );
    }

    return {
      url: parsed.toString(),
      title: ogTitle ?? null,
      description,
    };
  }

  getAnalyses(userId: string) {
    return this.prisma.resumeAnalysis.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  getCoverLetters(userId: string) {
    return this.prisma.coverLetter.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  getEmails(userId: string) {
    return this.prisma.applicationEmail.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  getInterviewQuestions(userId: string) {
    return this.prisma.interviewQuestion.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}
