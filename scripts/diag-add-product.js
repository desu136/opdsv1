const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAddProduct() {
  try {
    // Find the test pharmacist
    const user = await prisma.user.findUnique({
      where: { email: 'test_pharmacist@example.com' },
      include: { pharmacy: true }
    });

    if (!user || !user.pharmacy) {
      console.error('Test user or pharmacy not found. Run seed script first.');
      return;
    }

    console.log('Testing Add Product for pharmacy:', user.pharmacy.id);

    // Mock data
    const productData = {
      name: 'Diagnostic Medicine ' + Date.now(),
      category: 'General',
      price: 99.99,
      stock: 100,
      requiresPrescription: false,
      imageUrl: ''
    };

    // Simulate backend POST /api/inventory logic
    const { name, category, description, price, stock, requiresPrescription, imageUrl } = productData;

    try {
      const newProduct = await prisma.product.create({
        data: {
          pharmacyId: user.pharmacy.id,
          name,
          category,
          description,
          price: parseFloat(price.toString()),
          stock: parseInt(stock.toString(), 10),
          requiresPrescription: Boolean(requiresPrescription),
          imageUrl
        }
      });
      console.log('SUCCESS: Product created:', newProduct.id);
    } catch (createError) {
      console.error('FAILURE during create:', createError);
    }

  } catch (error) {
    console.error('GENERAL ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAddProduct();
