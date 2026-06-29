import { ApplicationStatus } from '../../../generated/prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty() @IsString() @IsNotEmpty() companyName: string;
  @ApiProperty() @IsString() @IsNotEmpty() position: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() salary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deadline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobDescriptionText?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(ApplicationStatus) status?: ApplicationStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() rejectionLetter?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() rejectedAt?: string;
}

export class UpdateApplicationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() position?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() salary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deadline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jobDescriptionText?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(ApplicationStatus) status?: ApplicationStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() coverLetterContent?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emailSubject?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emailContent?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() rejectionLetter?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() rejectedAt?: string;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: ApplicationStatus }) @IsEnum(ApplicationStatus) status: ApplicationStatus;
  @ApiPropertyOptional() @IsOptional() kanbanOrder?: number;
}
