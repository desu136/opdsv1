const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  try {
    const password = await bcrypt.hash('password123', 10);
    const email = 'test_pharmacist@example.com';
    
    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Test Pharmacist',
          email: email,
          password: password,
          role: 'PHARMACIST',
          status: 'ACTIVE'
        }
      });
      console.log('Created user:', user.email);
    } else {
      console.log('User already exists:', user.email);
    }

    // Create pharmacy for this user if not exists
    let pharmacy = await prisma.pharmacy.findUnique({ where: { ownerId: user.id } });
    
    if (!pharmacy) {
      pharmacy = await prisma.pharmacy.create({
        data: {
          name: 'Test Verify Pharmacy',
          email: 'verify_pharmacy@example.com',
          phone: '0912345678',
          licenseNumber: 'LIC-VERIFY-123',
          status: 'ACTIVE',
          ownerId: user.id
        }
      });
      console.log('Created pharmacy:', pharmacy.name);
    } else {
       // Ensure it's active
       await prisma.pharmacy.update({
         where: { id: pharmacy.id },
         data: { status: 'ACTIVE' }
       });
       console.log('Pharmacy already exists and set to ACTIVE');
    }

    // Also create a test customer if not exists
    const customerEmail = 'test_customer@example.com';
    let customer = await prisma.user.findUnique({ where: { email: customerEmail } });
    if (!customer) {
      customer = await prisma.user.create({
        data: {
          name: 'Test Customer',
          email: customerEmail,
          password: password,
          role: 'CUSTOMER',
          status: 'ACTIVE'
        }
      });
      console.log('Created customer:', customer.email);
    }

    // Create a generic Medicine in the Global Catalog first
    let medicine = await prisma.medicine.findFirst({ where: { name: 'Amoxicillin 500mg' } });
    if (!medicine) {
      medicine = await prisma.medicine.create({
        data: {
          name: 'Amoxicillin 500mg',
          genericName: 'Amoxicillin',
          category: 'Antibiotics',
          requiresPrescription: true,
          status: 'APPROVED',
          description: 'Used to treat bacterial infections.',
          dosage: '500mg every 8 hours',
          sideEffects: 'Nausea, vomiting, diarrhea',
          imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop'
        }
      });
      console.log('Created medicine:', medicine.name);
    }

    let medicineParacetamol = await prisma.medicine.findFirst({ where: { name: 'Paracetamol 500mg' } });
    if (!medicineParacetamol) {
      medicineParacetamol = await prisma.medicine.create({
        data: {
          name: 'Paracetamol 500mg',
          genericName: 'Acetaminophen',
          category: 'Pain Relief',
          requiresPrescription: false,
          status: 'APPROVED',
          description: 'Used to treat mild to moderate pain.',
          dosage: '500mg every 4-6 hours',
          sideEffects: 'None common',
          imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&h=500&fit=crop'
        }
      });
      console.log('Created medicine:', medicineParacetamol.name);
    }

    // Create a test product for this pharmacy
    const product = await prisma.product.create({
      data: {
        medicineId: medicine.id,
        price: 150,
        stock: 50,
        pharmacyId: pharmacy.id
      }
    });
    
    await prisma.product.create({
      data: {
        medicineId: medicineParacetamol.id,
        price: 30,
        stock: 200,
        pharmacyId: pharmacy.id
      }
    });

    console.log('Created products for pharmacy');

    // Create a test order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        pharmacyId: pharmacy.id,
        status: 'PENDING',
        totalAmount: 100,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            price: 100
          }
        }
      }
    });
    console.log('Created order:', order.id);
  } catch (error) {
    console.error('SEED ERROR:', error);
    throw error;
  }
}

main()
  .catch(e => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
