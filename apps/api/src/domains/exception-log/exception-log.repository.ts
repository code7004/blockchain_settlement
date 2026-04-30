import { PAGINATION_DEFAULT_LIMIT } from '@/core/constants';
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
    const limit = dto.limit ?? PAGINATION_DEFAULT_LIMIT;
    const offset = dto.offset ?? 0;

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
        include: {
          assigneeMember: {
            select: { username: true },
          },
        },
      }),
      this.prisma.exceptionLog.count({ where }),
    ]);

    return {
      data: data.map(({ assigneeMember, ...item }) => ({
        ...item,
        assigneeMemberUsername: assigneeMember?.username ?? null,
      })),
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    return this.prisma.exceptionLog
      .findFirst({
        where: { id, isDeleted: false },
        select: {
          id: true,
          message: true,
          path: true,
          method: true,
          status: true,
          assigneeMemberId: true,
          assigneeMember: {
            select: { username: true },
          },
          writer: true,
          stack: true,
          createdAt: true,
        },
      })
      .then((item) =>
        item
          ? {
              ...item,
              assigneeMemberUsername: item.assigneeMember?.username ?? null,
            }
          : null,
      );
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

  async update(id: string, input: { status?: ExceptionLogStatus; assigneeMemberId?: string | null }) {
    const data: Prisma.ExceptionLogUncheckedUpdateInput = {};

    if (input.status !== undefined) {
      data.status = input.status;
    }

    if (input.assigneeMemberId !== undefined) {
      data.assigneeMemberId = input.assigneeMemberId;
    }

    return this.prisma.exceptionLog.update({
      where: { id },
      data,
      select: {
        id: true,
        status: true,
        assigneeMemberId: true,
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
