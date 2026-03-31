import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function run() {
  const table = prisma.partner;
  const targets = await table.findMany();

  for (const p of targets) {
    const rawKey = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(rawKey, 10);

    await table.update({
      where: { id: p.id },
      data: {
        apiKeyHash: hash,
        apiKeyPrefix: rawKey.slice(0, 8),
        apiKeyCreatedAt: new Date(),
      },
    });

    console.log(`partner=${p.name} apiKey=${rawKey}`);
  }
}

run();
