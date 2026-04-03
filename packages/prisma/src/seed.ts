import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const username = 'administrator';
  const rawPassword = process.env.ADMIN_INIT_PASSWORD;

  if (!rawPassword) throw new Error('Not Found ENV.ADMIN_INIT_PASSWORD');

  const existing = await prisma.member.findUnique({
    where: { username },
  });

  if (existing) {
    console.log('✅ default administrator already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.member.create({
    data: {
      username,
      password: hashedPassword,
      role: 'OWNER', // 또는 ADMIN 정책에 맞게
      isActive: true,
    },
  });

  console.log('✅ default administrator created');
  console.log(`username: ${username}`);
  console.log(`password: ${rawPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
