import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/core/constants';
import { mapPrismaError } from '@/core/errors/prisma-exception.mapper';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt'; // for password
import crypto from 'crypto'; // for hash256
import { CreatePartnerDto } from './dto/create-partner.dto';
import { GetPartnersQueryDto } from './dto/get-partners.query.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePartnerDto) {
    try {
      const rawKey = crypto.randomBytes(32).toString('hex');
      const hash = await bcrypt.hash(rawKey, 10);

      const partner = await this.prisma.partner.create({
        data: {
          name: dto.name,
          callbackUrl: dto.callbackUrl,
          callbackSecret: dto.callbackSecret,
          memberId: dto.memberId,
          apiKeyHash: hash,
          apiKeyPrefix: rawKey.slice(0, 8),
          apiKeyCreatedAt: new Date(),
        },
      });

      return { ...partner, apiKey: rawKey };
    } catch (error: unknown) {
      mapPrismaError(error);
    }
  }

  async findAll(query: GetPartnersQueryDto) {
    try {
      const limit = Math.min(query.limit ?? PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT);
      const offset = query.offset ?? 0;

      const { memberId } = query;
      const where: Prisma.PartnerWhereInput = {};
      if (memberId) where.memberId = memberId;

      const [data, total] = await this.prisma.$transaction([this.prisma.partner.findMany({ where, take: limit, skip: offset, orderBy: { createdAt: 'desc' } }), this.prisma.partner.count({ where })]);

      return { data, total, limit, offset };
    } catch (error: unknown) {
      mapPrismaError(error);
    }
  }

  async findOne(id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    return partner;
  }

  async update(id: string, dto: UpdatePartnerDto) {
    try {
      await this.findOne(id);

      return await this.prisma.partner.update({
        where: { id },
        data: dto,
      });
    } catch (error: unknown) {
      mapPrismaError(error);
    }
  }

  async updateApiKeyHash(partnerId: string, apiKeyHash: string, apiKeyPrefix: string) {
    return this.prisma.partner.update({ where: { id: partnerId }, data: { apiKeyHash, apiKeyPrefix } });
  }

  async findByIds(ids: string[]) {
    return this.prisma.partner.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async updateMany(ids: string[], data: { isActive?: boolean }) {
    return this.prisma.partner.updateMany({
      where: {
        id: { in: ids },
      },
      data,
    });
  }
}
