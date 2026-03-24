import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendNotification } from '@/lib/notifications';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = payload.role;

    let whereClause: any = {};
    if (status) whereClause.status = status;

    if (role === 'CUSTOMER') {
      whereClause.customerId = payload.id;
    } else if (role === 'PHARMACIST') {
      if (!payload.pharmacyId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      whereClause.pharmacyId = payload.pharmacyId;
    } else if (role === 'DELIVERY_AGENT') {
      // Agents see READY orders (unclaimed) OR orders they have already picked up
      if (status === 'READY') {
        whereClause.status = 'READY';
      } else if (status === 'IN_TRANSIT') {
        whereClause.status = 'IN_TRANSIT';
        whereClause.delivery = { agentId: payload.id };
      } else {
        whereClause.OR = [
          { status: 'READY' },
          { AND: [{ status: 'IN_TRANSIT' }, { delivery: { agentId: payload.id } }] }
        ];
      }
    } else if (role === 'ADMIN') {
      // Admin sees everything matching status
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: { select: { name: true, phone: true } },
        pharmacy: { select: { name: true, phone: true } },
        items: {
           include: { product: { select: { name: true } } }
        },
        prescription: true,
        delivery: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload || payload.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden. Customer access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      pharmacyId, 
      items, 
      prescriptionUrl, 
      shippingAddress, 
      lat,
      lng,
      phone, 
      notes, 
      paymentMethod 
    } = body;

    if (!pharmacyId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // Verify stock and calculate total
    let totalAmount = 0;
    const orderItemsData: any[] = [];
    let requiresRx = false;

    for (const item of items) {
       const product = await prisma.product.findUnique({ where: { id: item.productId }});
       if (!product || product.pharmacyId !== pharmacyId) {
          return NextResponse.json({ error: `Invalid product ${item.productId}` }, { status: 400 });
       }
       if (product.stock < item.quantity) {
          return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
       }
       if (product.requiresPrescription) requiresRx = true;

       totalAmount += product.price * item.quantity;
       orderItemsData.push({
         productId: product.id,
         quantity: item.quantity,
         price: product.price
       });
    }

    // Add delivery fee (mock)
    const deliveryFee = 50.00;
    const tax = totalAmount * 0.15;
    const finalTotal = totalAmount + deliveryFee + tax;

    if (requiresRx && !prescriptionUrl) {
       // Allow place order but it will be PENDING until file upload is integrated (if we have a URL from mock)
    }

    // Create the order
    const order = await prisma.$transaction(async (tx) => {
       const newOrder = await tx.order.create({
         data: {
           customerId: payload.id,
           pharmacyId,
           totalAmount: finalTotal,
           shippingAddress: shippingAddress || (lat && lng ? 'Detected Phone Location' : null),
           // @ts-ignore
           lat: lat ? parseFloat(lat.toString()) : null,
           // @ts-ignore
           lng: lng ? parseFloat(lng.toString()) : null,
           phone, 
           notes, 
           paymentMethod,
           status: requiresRx ? 'PENDING' : 'PREPARING', 
           items: {
             create: orderItemsData
           }
         }
       });

       if (requiresRx && prescriptionUrl) {
         await tx.prescription.create({
           data: {
             orderId: newOrder.id,
             documentUrl: prescriptionUrl,
             status: 'PENDING_REVIEW'
           }
         });
       }

       // Deduct stock
       for (const item of orderItemsData) {
         await tx.product.update({
           where: { id: item.productId },
           data: { stock: { decrement: item.quantity } }
         });
       }

       return newOrder;
    });

    // Notify Pharmacy Owner
    const pharmacy = await prisma.pharmacy.findUnique({ where: { id: pharmacyId }, select: { ownerId: true, name: true }});
    if (pharmacy) {
      await sendNotification({
        userId: pharmacy.ownerId,
        title: 'New Order Received',
        message: `You have a new order from ${payload.name || 'a customer'}.`,
        type: 'ORDER'
      });
    }

    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
