import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';

class MatchDto {
  @ApiProperty() @IsString() @IsNotEmpty() jobDescriptionText: string;
  @ApiPropertyOptional() @IsOptional() @IsString() documentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() applicationId?: string;
}

class ParseJobDto {
  @ApiProperty() @IsString() @IsNotEmpty() jobDescriptionText: string;
}

class FetchJobDto {
  @ApiProperty() @IsString() @IsNotEmpty() url: string;
}

class SuggestTrackDto {
  @ApiProperty() @IsString() @IsNotEmpty() jobDescriptionText: string;
}

class ReviewDto {
  @ApiProperty() @IsString() documentId: string;
}

class CoverLetterDto {
  @ApiProperty() @IsString() resumeDocumentId: string;
  @ApiProperty() @IsString() @IsNotEmpty() jobDescriptionText: string;
  @ApiPropertyOptional() @IsOptional() @IsString() applicationId?: string;
}

class EmailDto {
  @ApiProperty() @IsString() @IsNotEmpty() jobDescriptionText: string;
  @ApiProperty() @IsString() @IsNotEmpty() companyName: string;
  @ApiProperty() @IsString() @IsNotEmpty() position: string;
  @ApiPropertyOptional() @IsOptional() @IsString() applicationId?: string;
}

class InterviewDto {
  @ApiProperty() @IsString() @IsNotEmpty() jobDescriptionText: string;
  @ApiProperty({ enum: ['HR', 'Technical', 'Behavioral'] })
  @IsIn(['HR', 'Technical', 'Behavioral']) category: 'HR' | 'Technical' | 'Behavioral';
  @ApiPropertyOptional() @IsOptional() @IsString() applicationId?: string;
}

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private ai: AiService) {}

  @Post('resume/match')
  match(@CurrentUser() user: { id: string }, @Body() dto: MatchDto) {
    if (dto.documentId) {
      return this.ai.matchResume(user.id, dto.documentId, dto.jobDescriptionText, dto.applicationId);
    }
    return this.ai.quickMatch(user.id, dto.jobDescriptionText);
  }

  @Post('job/parse')
  parseJob(@Body() dto: ParseJobDto) {
    return this.ai.parseJobDescription(dto.jobDescriptionText);
  }

  @Post('job/fetch')
  fetchJob(@Body() dto: FetchJobDto) {
    return this.ai.fetchJobFromUrl(dto.url);
  }

  @Post('job/suggest-track')
  suggestTrack(@Body() dto: SuggestTrackDto) {
    return this.ai.suggestResumeTrack(dto.jobDescriptionText);
  }

  @Post('resume/review')
  review(@CurrentUser() user: { id: string }, @Body() dto: ReviewDto) {
    return this.ai.reviewResume(user.id, dto.documentId);
  }

  @Get('resume/analyses')
  analyses(@CurrentUser() user: { id: string }) {
    return this.ai.getAnalyses(user.id);
  }

  @Post('cover-letter/generate')
  coverLetter(@CurrentUser() user: { id: string }, @Body() dto: CoverLetterDto) {
    return this.ai.generateCoverLetter(user.id, dto.resumeDocumentId, dto.jobDescriptionText, dto.applicationId);
  }

  @Get('cover-letter')
  coverLetters(@CurrentUser() user: { id: string }) {
    return this.ai.getCoverLetters(user.id);
  }

  @Post('email/generate')
  email(@CurrentUser() user: { id: string }, @Body() dto: EmailDto) {
    return this.ai.generateEmail(user.id, dto.jobDescriptionText, dto.companyName, dto.position, dto.applicationId);
  }

  @Get('email')
  emails(@CurrentUser() user: { id: string }) {
    return this.ai.getEmails(user.id);
  }

  @Post('interview/questions')
  interview(@CurrentUser() user: { id: string }, @Body() dto: InterviewDto) {
    return this.ai.generateInterviewQuestions(user.id, dto.jobDescriptionText, dto.category, dto.applicationId);
  }

  @Get('interview/questions')
  interviewHistory(@CurrentUser() user: { id: string }) {
    return this.ai.getInterviewQuestions(user.id);
  }

  @Get('career-insights')
  insights(@CurrentUser() user: { id: string }) {
    return this.ai.careerInsights(user.id);
  }
}
