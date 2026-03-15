import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const products = await prisma.product.findMany({
      include: {
        pharmacy: { select: { name: true, id: true } }
      }
    })
    console.log('Successfully fetched products:', products.length)
  } catch (err) {
    console.error('Prisma connection error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
