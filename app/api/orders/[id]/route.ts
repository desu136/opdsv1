import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendNotification } from '@/lib/notifications';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, phone: true } },
        pharmacy: { select: { name: true, phone: true, id: true } },
        items: { include: { product: { select: { name: true, requiresPrescription: true } } } },
        prescription: true,
        delivery: { include: { agent: { select: { name: true, phone: true } } } }
      }
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Privacy checks
    if (payload.role === 'CUSTOMER' && order.customerId !== payload.id) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (payload.role === 'PHARMACIST' && order.pharmacy.id !== payload.pharmacyId) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (payload.role === 'DELIVERY_AGENT' && order.delivery?.agentId !== payload.id && order.status !== 'READY') {
       // Agents can only see READY orders they want to pick up, or orders already assigned to them
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error('Fetch order detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = verifyToken(token) as any;
    const { id } = await params;
    const body = await request.json();
    const { status, prescriptionStatus } = body;

    const order = await prisma.order.findUnique({ where: { id }, include: { prescription: true }});
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let updatedOrder;

    if (payload.role === 'PHARMACIST' && order.pharmacyId === payload.pharmacyId) {
       // Pharmacy updates
       if (prescriptionStatus && order.prescription) {
          // Verify prescription
          await prisma.prescription.update({
             where: { id: order.prescription.id },
             data: { status: prescriptionStatus }
          });
          // Also update order status if approved
          if (prescriptionStatus === 'APPROVED') {
             updatedOrder = await prisma.order.update({ where: { id }, data: { status: 'PREPARING' }});
          } else if (prescriptionStatus === 'REJECTED') {
             updatedOrder = await prisma.order.update({ where: { id }, data: { status: 'CANCELLED' }});
          }
       } else if (status === 'READY') {
          updatedOrder = await prisma.order.update({ where: { id }, data: { status: 'READY' }});
       } else {
          updatedOrder = await prisma.order.update({ where: { id }, data: { status }});
       }
    } else if (payload.role === 'DELIVERY_AGENT') {
       // Agent updates
       if (status === 'IN_TRANSIT') {
          // Assigned to them
          await prisma.delivery.create({
             data: {
               orderId: order.id,
               agentId: payload.id,
               status: 'ASSIGNED'
             }
          });
          updatedOrder = await prisma.order.update({ where: { id }, data: { status: 'IN_TRANSIT' }});
       } else if (status === 'COMPLETED') {
          await prisma.delivery.update({
             where: { orderId: order.id },
             data: { status: 'DELIVERED', deliveryTime: new Date() }
          });
          updatedOrder = await prisma.order.update({ where: { id }, data: { status: 'COMPLETED' }});
       }
    } else {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (updatedOrder) {
      await sendNotification({
        userId: order.customerId,
        title: 'Order Status Updated',
        message: `Your order #${id.slice(0, 8)} status is now ${updatedOrder.status}.`,
        type: 'ORDER'
      });
    }

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
