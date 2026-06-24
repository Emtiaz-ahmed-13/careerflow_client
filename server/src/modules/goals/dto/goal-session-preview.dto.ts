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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coverLetterContent: string;

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
}
