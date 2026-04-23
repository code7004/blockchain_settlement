import { Prisma } from '@prisma/client';

export interface AssetsSnapshotDto extends Prisma.InputJsonObject {
  coins: Record<string, number>;
  tokens: Record<string, number>;
}
