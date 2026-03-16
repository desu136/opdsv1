const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Searching for desynchronized records...');
  
  // Find pharmacies that are ACTIVE but whose owners are PENDING_REVIEW
  const desyncedPharmacies = await prisma.pharmacy.findMany({
    where: {
      status: 'ACTIVE',
      owner: {
        status: 'PENDING_REVIEW'
      }
    },
    include: {
      owner: true
    }
  });

  if (desyncedPharmacies.length === 0) {
    console.log('No desynchronized records found.');
    return;
  }

  console.log(`Found ${desyncedPharmacies.length} desynced pharmacies. Fixing...`);

  for (const ph of desyncedPharmacies) {
    console.log(`Fixing user ${ph.owner.email} (Pharmacy: ${ph.name})`);
    await prisma.user.update({
      where: { id: ph.ownerId },
      data: { status: 'ACTIVE' }
    });
  }

  console.log('Successfully synced all records.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
