import { IsEnum, IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResumeTrack } from '../../../generated/prisma/client';

export class GoalSessionDto {
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
}
