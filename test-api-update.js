const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-do-not-use-in-prod';

async function main() {
  // Find admin
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.log("No admin found.");
    return;
  }
  
  // Find pending pharmacy
  const pharmacy = await prisma.pharmacy.findFirst({
    where: { status: 'PENDING_REVIEW' }
  });
  
  if (!pharmacy) {
    console.log("No pending pharmacy found.");
    return;
  }

  console.log("Found pharmacy to update:", pharmacy.id);

  // Generate token
  const token = jwt.sign({ 
    id: admin.id, 
    role: admin.role 
  }, JWT_SECRET);

  // Call the actual API locally
  const res = await fetch(`http://localhost:3000/api/pharmacies/${pharmacy.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth_token=${token}`
    },
    body: JSON.stringify({ status: 'ACTIVE' })
  });
  
  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);

  // Fetch from DB again to verify
  const phAfter = await prisma.pharmacy.findUnique({ where: { id: pharmacy.id }});
  const uAfter = await prisma.user.findUnique({ where: { id: pharmacy.ownerId }});
  
  console.log("Database after API call:");
  console.log("Pharmacy status:", phAfter.status);
  console.log("Owner status:", uAfter.status);
}

main().catch(console.error).finally(() => prisma.$disconnect());
