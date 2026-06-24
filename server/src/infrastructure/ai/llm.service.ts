import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

type AiProvider = 'groq' | 'anthropic' | 'gemini';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly provider: AiProvider;
  private groq?: Groq;
  private anthropic?: Anthropic;
  private geminiModel?: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;
  private groqModel: string;
  private anthropicModel: string;
  private geminiModelName: string;

  constructor(config: ConfigService) {
    this.provider = config.get('AI_PROVIDER', 'groq') as AiProvider;
    this.groqModel = config.get('GROQ_MODEL', 'llama-3.3-70b-versatile');
    this.anthropicModel = config.get('ANTHROPIC_MODEL', 'claude-3-5-haiku-latest');
    this.geminiModelName = config.get('GEMINI_MODEL', 'gemini-2.0-flash-lite');

    if (this.provider === 'groq') {
      this.groq = new Groq({ apiKey: config.getOrThrow('GROQ_API_KEY').trim() });
      this.logger.log(`AI provider: Groq (${this.groqModel})`);
    } else if (this.provider === 'anthropic') {
      this.anthropic = new Anthropic({ apiKey: config.getOrThrow('ANTHROPIC_API_KEY').trim() });
      this.logger.log(`AI provider: Anthropic (${this.anthropicModel})`);
    } else {
      const genAI = new GoogleGenerativeAI(config.getOrThrow('GEMINI_API_KEY').trim());
      this.geminiModel = genAI.getGenerativeModel({ model: this.geminiModelName });
      this.logger.log(`AI provider: Gemini (${this.geminiModelName})`);
    }
  }

  private aiUnavailable(err: unknown): never {
    const detail = err instanceof Error ? err.message : String(err);
    this.logger.error(`AI request failed: ${detail}`);
    throw new ServiceUnavailableException(
      'AI failed — please try again in a moment. If it keeps failing, paste the full job description and retry.',
    );
  }

  private async generateJson<T>(prompt: string): Promise<T> {
    try {
      const text = await this.generateText(
        prompt + '\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no explanation.',
      );
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI did not return valid JSON');
      }
      return JSON.parse(jsonMatch[0]) as T;
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      this.aiUnavailable(err);
    }
  }

  private async generateText(prompt: string): Promise<string> {
    try {
      if (this.provider === 'groq' && this.groq) {
        const completion = await this.groq.chat.completions.create({
          model: this.groqModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 4096,
        });
        return completion.choices[0]?.message?.content ?? '';
      }

      if (this.provider === 'anthropic' && this.anthropic) {
        const message = await this.anthropic.messages.create({
          model: this.anthropicModel,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        });
        const block = message.content[0];
        if (block.type !== 'text') throw new Error('Unexpected AI response type');
        return block.text;
      }

      if (!this.geminiModel) throw new Error('Gemini not configured');
      const result = await this.geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      this.aiUnavailable(err);
    }
  }

  analyzeResumeMatch(resumeText: string, jobDescription: string) {
    return this.generateJson<{
      matchScore: number;
      strongSkills: string[];
      missingSkills: string[];
      weakAreas: string[];
      suggestions: string[];
    }>(`You are an expert career coach. Analyze this resume against the job description.
Return ONLY valid JSON with keys: matchScore (0-100 number), strongSkills (string[]), missingSkills (string[]), weakAreas (string[]), suggestions (string[]).

Resume:
${resumeText.slice(0, 15000)}

Job Description:
${jobDescription.slice(0, 15000)}`);
  }

  reviewResume(resumeText: string) {
    return this.generateJson<{
      atsScore: number;
      grammarIssues: string[];
      formattingIssues: string[];
      missingKeywords: string[];
      suggestions: string[];
    }>(`You are an ATS resume expert. Review this resume.
Return ONLY valid JSON with keys: atsScore (0-100), grammarIssues (string[]), formattingIssues (string[]), missingKeywords (string[]), suggestions (string[]).

Resume:
${resumeText.slice(0, 15000)}`);
  }

  generateCoverLetter(
    resumeText: string,
    jobDescription: string,
    userInfo: { firstName: string; lastName: string; email: string; phone: string; linkedinUrl: string; githubUrl: string; headline?: string },
    styleInstructions?: string,
  ) {
    const styleBlock = styleInstructions
      ? `\n\nIMPORTANT — Follow this EXACT format, tone, and structure from the user (do not use generic templates):\n${styleInstructions}\n`
      : '';
    return this.generateJson<{ content: string; subjectLine: string }>(`Write a cover letter following the user's preferred style.
Return ONLY valid JSON with keys: content (string), subjectLine (string).${styleBlock}

Candidate: ${userInfo.firstName} ${userInfo.lastName}, ${userInfo.headline ?? ''}
Email: ${userInfo.email}, Phone: ${userInfo.phone}
LinkedIn: ${userInfo.linkedinUrl}, GitHub: ${userInfo.githubUrl}

Resume:
${resumeText.slice(0, 10000)}

Job Description:
${jobDescription.slice(0, 10000)}`);
  }

  generateApplicationEmail(
    jobDescription: string,
    userInfo: { firstName: string; lastName: string; email: string; phone: string; linkedinUrl: string; githubUrl: string; headline?: string },
    companyName: string,
    position: string,
    styleInstructions?: string,
  ) {
    const styleBlock = styleInstructions
      ? `\n\nIMPORTANT — Follow this EXACT email format, tone, and structure from the user (do not use generic templates):\n${styleInstructions}\n`
      : '';
    return this.generateJson<{ subject: string; content: string }>(`Write a job application email following the user's preferred style.${styleBlock}
Return ONLY valid JSON with keys: subject (string), content (string, email body with greeting and sign-off).

Company: ${companyName}
Position: ${position}
Candidate: ${userInfo.firstName} ${userInfo.lastName}, ${userInfo.headline ?? ''}
Email: ${userInfo.email}, Phone: ${userInfo.phone}
LinkedIn: ${userInfo.linkedinUrl}, GitHub: ${userInfo.githubUrl}

Job Description:
${jobDescription.slice(0, 12000)}`);
  }

  generateInterviewQuestions(jobDescription: string, category: string) {
    return this.generateJson<{ questions: { question: string; tip: string; difficulty: string }[] }>(`Generate 8 ${category} interview questions for this job.
Return ONLY valid JSON: { "questions": [{ "question": string, "tip": string, "difficulty": "Easy"|"Medium"|"Hard" }] }

Job Description:
${jobDescription.slice(0, 12000)}`);
  }

  generateCareerInsights(applicationsSummary: string) {
    return this.generateJson<{
      bestPerformingSkills: string[];
      bestJobCategories: string[];
      areasToImprove: string[];
      recommendations: string[];
    }>(`Analyze this job application history and provide career insights.
Return ONLY valid JSON: bestPerformingSkills (string[]), bestJobCategories (string[]), areasToImprove (string[]), recommendations (string[]).

Application History:
${applicationsSummary.slice(0, 12000)}`);
  }

  extractJobDetails(jobDescription: string) {
    return this.generateJson<{
      companyName: string;
      position: string;
      jobUrl: string | null;
      recruiterEmail: string | null;
    }>(`Extract job posting details from this text (LinkedIn, Indeed, company careers page, etc).
Return ONLY valid JSON with keys:
- companyName (string — employer or hiring company name)
- position (string — job title / role name)
- jobUrl (string|null — posting or apply URL if present in the text)
- recruiterEmail (string|null — recruiter or HR email if present)

Use best guess from context when not explicit. If company or title truly cannot be determined, use "Unknown Company" or "Unknown Position".

Job posting:
${jobDescription.slice(0, 12000)}`);
  }

  suggestResumeTrack(jobDescription: string) {
    return this.generateJson<{ track: 'Backend' | 'Frontend' | 'SoftwareEngineer'; reason: string }>(
      `Based on this job description, pick the best resume track.
Return ONLY valid JSON: { "track": "Backend"|"Frontend"|"SoftwareEngineer", "reason": string }

Backend = backend/API/database/server roles
Frontend = frontend/UI/React/CSS roles
SoftwareEngineer = full-stack or general SWE roles

Job Description:
${jobDescription.slice(0, 8000)}`,
    );
  }
}
