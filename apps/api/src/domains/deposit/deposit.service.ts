/**
 * deposit.service.ts
 * confirm 서비스 진입점 연결
 * 필요 시 watcher에서 confirm 호출 가능하게 orchestration
 */
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/core/constants';
import { EnvService } from '@/core/env/env.service';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { WalletRepository } from '../wallet/wallet.repository';
import { DepositRepository } from './deposit.repository';
import { GetDepositsQueryDto } from './dto/get-deposits.query.dto';

@Injectable()
export class DepositService {
  constructor(
    private readonly env: EnvService,
    private readonly prisma: PrismaService,
    private readonly walletRepository: WalletRepository,
    private readonly depositRepository: DepositRepository,
  ) {}

  /**
   * Deposit DETECTED 생성
   */
  async createDetectedDeposit() {
    // Step2에서 구현
  }
  async handleDetectedTransfer(input: { txHash: string; toAddress: string; fromAddress: string; amount: string; blockNumber: number }) {
    const wallet = await this.walletRepository.findByAddress(input.toAddress);

    if (!wallet) return;

    await this.depositRepository.createDetected({
      partnerId: wallet.partnerId,
      userId: wallet.userId,
      walletId: wallet.id,

      tokenSymbol: this.env.tokenSymbol,
      tokenContract: this.env.tronUsdtContract,

      txHash: input.txHash,

      fromAddress: input.fromAddress,
      toAddress: input.toAddress,

      amount: input.amount,

      blockNumber: input.blockNumber,
      writer: this.env.name,

      detectedAt: new Date(),
    });
  }

  async findAll(dto: GetDepositsQueryDto) {
    const limit = Math.min(dto.limit ?? PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT);
    const offset = dto.offset ?? 0;

    const where = { txHash: dto.txHash, partnerId: dto.partnerId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.deposit.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deposit.count({ where }),
    ]);
    return { data, total, limit, offset };
  }

  async findByTxHash(txHash: string) {
    return await this.depositRepository.findByTxHash(txHash);
  }
}
