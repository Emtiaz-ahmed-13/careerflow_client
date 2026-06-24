import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() headline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() linkedinUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() githubUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emailStyle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverLetterStyle?: string;
}
