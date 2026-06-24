import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(6) password: string;
  @ApiProperty() @IsString() @IsNotEmpty() firstName: string;
  @ApiProperty() @IsString() @IsNotEmpty() lastName: string;
  @ApiProperty() @IsString() @IsNotEmpty() phone: string;
  @ApiProperty() @IsString() @IsNotEmpty() linkedinUrl: string;
  @ApiProperty() @IsString() @IsNotEmpty() githubUrl: string;
  @ApiPropertyOptional() @IsOptional() @IsString() headline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
}

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
}

export class RefreshDto {
  @ApiProperty() @IsString() refreshToken: string;
}
