import { ProcessStep } from '@/core/enums';
import { Injectable } from '@nestjs/common';
import { CallbackStatus, DepositStatus } from '@prisma/client';
import { CallbackService } from '../callback/callback.service';
import { DepositService } from '../deposit/deposit.service';
import { ProcessFlow, ProcessStepStatus } from './dto/monitor.types';

@Injectable()
export class MonitorService {
  constructor(
    private readonly depositService: DepositService,
    private readonly callbackService: CallbackService,
  ) {}

  async getProcessFlow(txHash: string): Promise<ProcessFlow> {
    const deposit = await this.depositService.findByTxHash(txHash);

    if (!deposit) {
      return { txHash, steps: [] };
    }

    const callback = await this.callbackService.findByTxHash(txHash);

    const steps: ProcessStepStatus[] = [];

    // 1. Transfer (존재하면 무조건 성공)
    steps.push({
      step: ProcessStep.TRANSFER,
      success: true,
      txHash,
    });

    // 2. DETECTED
    steps.push({
      step: ProcessStep.DETECTED,
      success: true,
      timestamp: deposit.detectedAt,
    });

    // 3. CONFIRMED
    steps.push({
      step: ProcessStep.CONFIRMED,
      success: deposit.status === DepositStatus.CONFIRMED,
      timestamp: deposit.confirmedAt || undefined,
    });

    // 4. CALLBACK
    steps.push({
      step: ProcessStep.CALLBACK,
      success: callback?.status === CallbackStatus.SUCCESS,
      timestamp: callback?.createdAt,
      status: callback?.status,
    });

    return { txHash, steps };
  }
}
