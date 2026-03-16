const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pharmacies = await prisma.pharmacy.findMany({
    include: { owner: true }
  });

  console.log('--- ALL PHARMACIES ---');
  for (const ph of pharmacies) {
    console.log(`Pharmacy: ${ph.name} | P_Status: ${ph.status} | Owner: ${ph.owner.email} | O_Status: ${ph.owner.status}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
