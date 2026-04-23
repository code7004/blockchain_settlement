import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ExceptionLogStatus, Prisma } from '@prisma/client';
import { GetExceptionLogsQueryDto } from './dto/get-exception-logs.query.dto';
import { CreateExceptionLogInput } from './exception-log.types';

@Injectable()
export class ExceptionLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateExceptionLogInput): Promise<void> {
    await this.prisma.exceptionLog.create({
      data: input,
    });
  }

  async findAll(dto: GetExceptionLogsQueryDto) {
    const limit = dto.limit ?? 20;
    const page = dto.page ?? 1;
    const offset = (page - 1) * limit;

    const where: Prisma.ExceptionLogWhereInput = { isDeleted: false };

    if (dto.message) {
      where.message = { contains: dto.message, mode: 'insensitive' };
    }

    if (dto.path) {
      where.path = { contains: dto.path, mode: 'insensitive' };
    }

    if (dto.method) {
      where.method = dto.method.toUpperCase();
    }

    if (dto.status) {
      where.status = dto.status;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.exceptionLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          message: true,
          path: true,
          method: true,
          status: true,
          assignedTo: true,
          writer: true,
          createdAt: true,
        },
      }),
      this.prisma.exceptionLog.count({ where }),
    ]);

    return { data, total, limit, offset, page };
  }

  async findOne(id: string) {
    return this.prisma.exceptionLog.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        message: true,
        path: true,
        method: true,
        status: true,
        assignedTo: true,
        writer: true,
        stack: true,
        createdAt: true,
      },
    });
  }

  async findDeleteTarget(id: string) {
    return this.prisma.exceptionLog.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateStatus(id: string, status: ExceptionLogStatus) {
    return this.prisma.exceptionLog.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        assignedTo: true,
      },
    });
  }

  async assign(id: string, assignedTo: string | null) {
    return this.prisma.exceptionLog.update({
      where: { id },
      data: { assignedTo },
      select: {
        id: true,
        status: true,
        assignedTo: true,
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.exceptionLog.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        isDeleted: true,
        deletedAt: true,
      },
    });
  }
}
