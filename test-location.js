const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // 1. Find a pharmacy
    const pharmacy = await prisma.pharmacy.findFirst();
    if (!pharmacy) {
      console.log('No pharmacy found to test');
      return;
    }

    console.log(`Testing with pharmacy: ${pharmacy.name} (ID: ${pharmacy.id})`);

    // 2. Set coordinates to Piassa, Addis Ababa (approx 9.02, 38.75)
    await prisma.pharmacy.update({
      where: { id: pharmacy.id },
      data: {
        lat: 9.0249,
        lng: 38.7468,
        address: 'Piassa, Addis Ababa'
      }
    });
    console.log('Successfully updated pharmacy coordinates');

    // 3. Verify they were saved
    const updated = await prisma.pharmacy.findUnique({
      where: { id: pharmacy.id }
    });
    console.log(`Saved coordinates: Lat ${updated.lat}, Lng ${updated.lng}`);

    // 4. Test Haversine distance logic (similar to API)
    const userLat = 9.0300; // Slightly North
    const userLng = 38.7500; // Slightly East
    
    const R = 6371; // km
    const dLat = (updated.lat - userLat) * Math.PI / 180;
    const dLon = (updated.lng - userLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(updated.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    
    console.log(`Calculated distance to user at (${userLat}, ${userLng}): ${d.toFixed(2)} km`);

    if (d > 0 && d < 1) {
      console.log('Distance calculation looks correct (approx 0.66km)');
    } else {
      console.log('Distance calculation seems off? Check logic.');
    }

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
