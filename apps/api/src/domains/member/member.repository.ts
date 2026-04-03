import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/core/constants';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { CreateMemberDto } from './dto/create-member.dto';
import { GetMemberQueryDto } from './dto/get-member-query.dto';

@Injectable()
export class MemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMemberDto) {
    return this.prisma.member.create({ data });
  }

  async findByUsername(username: string) {
    return this.prisma.member.findUnique({
      where: { username },
    });
  }

  async findAll(query: GetMemberQueryDto) {
    const limit = Math.min(query.limit ?? PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT);
    const offset = query.offset ?? 0;

    const where = {}; // Phase2 대비

    const [data, total] = await this.prisma.$transaction([this.prisma.member.findMany({ where, take: limit, skip: offset, orderBy: { createdAt: 'desc' } }), this.prisma.member.count({ where })]);

    return { data, total, limit, offset };
  }

  async findById(id: string) {
    return this.prisma.member.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { isActive?: boolean; password?: string }) {
    return _.omit(await this.prisma.member.update({ where: { id }, data }), ['password']);
  }

  async findByIds(ids: string[]) {
    return this.prisma.member.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async updateMany(ids: string[], data: { isActive?: boolean }) {
    return this.prisma.member.updateMany({
      where: {
        id: { in: ids },
      },
      data,
    });
  }
}
