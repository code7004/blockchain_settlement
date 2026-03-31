import { ProcessStep } from '@/core/enums';

export interface ProcessStepStatus {
  step: ProcessStep;
  success: boolean;
  timestamp?: Date;
  txHash?: string;
  status?: string;
}

export interface ProcessFlow {
  txHash: string;
  steps: ProcessStepStatus[];
}
