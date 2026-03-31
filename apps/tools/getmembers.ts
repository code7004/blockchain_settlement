import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  try {
    const data = await prisma.member.findMany({ take: 10 });
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
main();
