import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GoalSessionDto } from './dto/goal-session.dto';
import { GoalSessionConfirmDto, GoalSessionPreviewDto } from './dto/goal-session-preview.dto';
import { SetCommitmentDto } from './dto/set-commitment.dto';
import { GoalsService } from './goals.service';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private goals: GoalsService) {}

  @Get('today')
  today(@CurrentUser() user: { id: string }) {
    return this.goals.getDailyGoal(user.id);
  }

  @Patch('commitment')
  commitment(@CurrentUser() user: { id: string }, @Body() dto: SetCommitmentDto) {
    return this.goals.setCommitment(user.id, dto.commitmentDays);
  }

  @Get('resumes')
  resumes(@CurrentUser() user: { id: string }) {
    return this.goals.getResumeVault(user.id);
  }

  @Get('onboarding-status')
  onboardingStatus(@CurrentUser() user: { id: string }) {
    return this.goals.getOnboardingStatus(user.id);
  }

  @Post('onboarding/complete')
  completeOnboarding(@CurrentUser() user: { id: string }) {
    return this.goals.completeOnboarding(user.id);
  }

  @Post('onboarding/skip')
  skipOnboarding(@CurrentUser() user: { id: string }) {
    return this.goals.skipOnboarding(user.id);
  }

  @Post('session/preview')
  preview(@CurrentUser() user: { id: string }, @Body() dto: GoalSessionPreviewDto) {
    return this.goals.previewSession(user.id, dto);
  }

  @Post('session/confirm')
  confirm(@CurrentUser() user: { id: string }, @Body() dto: GoalSessionConfirmDto) {
    return this.goals.confirmSession(user.id, dto);
  }

  @Post('session')
  session(@CurrentUser() user: { id: string }, @Body() dto: GoalSessionDto) {
    return this.goals.runSession(user.id, dto);
  }
}
