import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { DepositStatus, Prisma } from '@prisma/client';
import { CreateDetectedDepositInput } from './deposit.types';

@Injectable()
export class DepositRepository {
  private readonly logger = new Logger(DepositRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * txHash UNIQUE 기반 멱등 저장
   * - 이미 존재하면 "중복"으로 간주하고 조용히 무시 (return null)
   * - 성공하면 생성된 row 반환
   */
  async createDetected(input: CreateDetectedDepositInput) {
    try {
      return await this.prisma.deposit.create({
        data: {
          partnerId: input.partnerId,
          userId: input.userId,
          walletId: input.walletId,

          tokenSymbol: input.tokenSymbol,
          tokenContract: input.tokenContract,

          txHash: input.txHash,
          fromAddress: input.fromAddress,
          toAddress: input.toAddress,

          amount: input.amount,
          blockNumber: input.blockNumber,

          status: DepositStatus.DETECTED,
          detectedAt: input.detectedAt,
          writer: input.writer,
        },
      });
    } catch (e: unknown) {
      // Prisma Unique violation (txHash UNIQUE)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        // 멱등성: 동일 txHash면 아무것도 하지 않음
        this.logger.debug(`duplicate txHash ignored: ${input.txHash}`);
        return null;
      }
      throw e;
    }
  }

  /**
   * 선택: txHash 존재 여부 조회 (굳이 필요 없지만 디버깅/리플레이에 유용)
   */
  async existsByTxHash(txHash: string): Promise<boolean> {
    const found = await this.prisma.deposit.findUnique({
      where: { txHash },
      select: { id: true },
    });
    return !!found;
  }

  async findByTxHash(txHash: string) {
    return await this.prisma.deposit.findUnique({ where: { txHash } });
  }
}
