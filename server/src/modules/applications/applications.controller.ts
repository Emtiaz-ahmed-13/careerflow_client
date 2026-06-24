import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationDto, UpdateStatusDto } from './dto/application.dto';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private apps: ApplicationsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }, @Query('status') status?: string) {
    return this.apps.findAll(user.id, status);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.apps.findOne(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateApplicationDto) {
    return this.apps.create(user.id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    return this.apps.update(user.id, id, dto);
  }

  @Patch(':id/status')
  updateStatus(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.apps.updateStatus(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.apps.remove(user.id, id);
  }
}
