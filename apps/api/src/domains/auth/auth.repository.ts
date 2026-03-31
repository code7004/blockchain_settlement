import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(username: string) {
    return await this.prisma.member.findUnique({ where: { username } });
  }

  async findPartnerByPrefix(prefix: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { apiKeyPrefix: prefix },
    });

    return partner;
  }

  async updatePwd(id: string, data: { password?: string }) {
    return this.prisma.member.update({
      where: { id },
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.member.findUnique({
      where: { id },
    });
  }
}
