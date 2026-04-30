import { Body, Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetExceptionLogsQueryDto } from './dto/get-exception-logs.query.dto';
import { UpdateExceptionLogDto } from './dto/update-exception-log.dto';
import { ExceptionLogService } from './exception-log.service';

interface AdminRequest extends Request {
  user?: {
    role?: MemberRole;
  };
}

@ApiTags('Admin - Exception Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/exception-logs')
export class AdminExceptionLogController {
  constructor(private readonly service: ExceptionLogService) {}

  @Get()
  findAll(@Query() query: GetExceptionLogsQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateExceptionLogDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string, @Req() request: AdminRequest) {
    return this.service.softDelete(id, request.user?.role);
  }
}
