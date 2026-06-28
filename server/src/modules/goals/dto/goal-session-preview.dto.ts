import { IsEnum, IsNotEmpty, IsOptional, IsString, IsEmail, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResumeTrack } from '../../../generated/prisma/client';

export class GoalSessionPreviewDto {
  @ApiPropertyOptional({ enum: ResumeTrack })
  @IsOptional()
  @IsEnum(ResumeTrack)
  resumeTrack?: ResumeTrack;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobDescriptionText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobUrl?: string;
}

export class GoalSessionManualPreviewDto extends GoalSessionPreviewDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;
}

export class GoalSessionConfirmDto {
  @ApiProperty({ enum: ResumeTrack })
  @IsEnum(ResumeTrack)
  resumeTrack: ResumeTrack;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jobDescriptionText: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  recruiterEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverLetterContent?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  emailSubject: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  emailContent: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  skipApply?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  matchScore?: number;

  @ApiPropertyOptional({ description: 'Skip AI match analysis on confirm' })
  @IsOptional()
  @IsBoolean()
  manual?: boolean;
}
