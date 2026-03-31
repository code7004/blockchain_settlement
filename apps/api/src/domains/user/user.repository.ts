import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { isUUID } from 'class-validator';
import { AdminGetUsersQueryDto } from './dto/get-users.query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserUncheckedCreateInput, tx: Prisma.TransactionClient) {
    return tx.user.create({ data });
  }

  async findAll(query: AdminGetUsersQueryDto) {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = query.offset ?? 0;

    const { partnerId, externalUserId, keyword } = query;
    const where: Prisma.UserWhereInput = {};
    if (partnerId) where.partnerId = partnerId;
    if (externalUserId) where.externalUserId = externalUserId;
    if (keyword?.trim()) {
      where.OR = [{ externalUserId: { contains: keyword, mode: 'insensitive' } }, ...(isUUID(keyword) ? [{ id: keyword }] : [])];
    }
    const [data, total] = await this.prisma.$transaction([this.prisma.user.findMany({ where, take: limit, skip: offset, orderBy: { createdAt: 'desc' } }), this.prisma.user.count({ where })]);

    return { data, total, limit, offset };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async findOneByExternalUserId(partnerId: string, externalUserId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        partnerId_externalUserId: {
          partnerId,
          externalUserId,
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    return await this.prisma.user.update({ where: { id }, data: dto });
  }
}
