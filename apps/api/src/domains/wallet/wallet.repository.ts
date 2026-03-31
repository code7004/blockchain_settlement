import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAddress(address: string) {
    return this.prisma.wallet.findUnique({ where: { address } });
  }

  async findActiveWallets() {
    return this.prisma.wallet.findMany({ where: { status: 'ACTIVE' }, select: { id: true, address: true } });
  }
}
