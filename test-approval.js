const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing approval flow...');
  
  // 1. Get a pending pharmacy
  const pharmacy = await prisma.pharmacy.findFirst({
    where: { status: 'PENDING_REVIEW' },
    select: { id: true, ownerId: true, status: true }
  });

  if (!pharmacy) {
    console.log('No pending pharmacy found. Please create one on the site.');
    return;
  }

  console.log('Found pharmacy:', pharmacy);

  // 2. Check current user status
  const userBefore = await prisma.user.findUnique({ where: { id: pharmacy.ownerId } });
  console.log('User status BEFORE:', userBefore?.status);

  // 3. Execute transaction exactly as in API
  const updatedPharmacy = await prisma.$transaction(async (tx) => {
    const updated = await tx.pharmacy.update({
      where: { id: pharmacy.id },
      data: { status: 'ACTIVE' }
    });

    await tx.user.update({
      where: { id: pharmacy.ownerId },
      data: { status: 'ACTIVE' }
    });
    
    return updated;
  });

  console.log('Pharmacy updated:', updatedPharmacy.status);

  // 4. Check user status AFTER
  const userAfter = await prisma.user.findUnique({ where: { id: pharmacy.ownerId } });
  console.log('User status AFTER:', userAfter?.status);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
