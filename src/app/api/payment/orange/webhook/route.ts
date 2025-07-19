import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { bookings } from '~/server/db/schema';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (in production, verify Orange signature)
    const body = await request.json();
    
    // Extract payment data from Orange webhook
    const {
      order_id,
      amount,
      pay_token,
      txnid,
      status,
      notif_token,
    } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: 'Missing order_id' },
        { status: 400 }
      );
    }

    // Find booking by reference number
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.referenceNumber, order_id))
      .limit(1);

    if (!booking[0]) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update payment status based on Orange response
    let paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
    let bookingStatus: "CONFIRMED" | "CANCELLED" | "PENDING_PAYMENT";

    switch (status) {
      case 'SUCCESS':
      case 'SUCCESSFUL':
        paymentStatus = 'COMPLETED';
        bookingStatus = 'CONFIRMED';
        break;
      case 'FAILED':
      case 'FAILURE':
        paymentStatus = 'FAILED';
        bookingStatus = 'CANCELLED';
        break;
      default:
        paymentStatus = 'PENDING';
        bookingStatus = 'PENDING_PAYMENT';
    }

    // Update booking
    await db
      .update(bookings)
      .set({
        paymentStatus,
        status: bookingStatus,
        paymentReference: txnid || pay_token,
        paymentDetails: {
          ...booking[0].paymentDetails,
          webhookData: body,
          updatedAt: new Date().toISOString(),
        },
      })
      .where(eq(bookings.id, booking[0].id));

    // If payment successful, you might want to:
    // 1. Send confirmation email
    // 2. Generate tickets
    // 3. Update ticket availability (if not done already)

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
    });

  } catch (error) {
    console.error('Orange webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle payment status verification requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payToken = searchParams.get('pay_token');

    if (!payToken) {
      return NextResponse.json(
        { error: 'Missing pay_token' },
        { status: 400 }
      );
    }

    // In production, verify payment status with Orange API
    // For now, simulate the check
    const isCompleted = Math.random() > 0.3; // 70% chance for demo

    return NextResponse.json({
      status: isCompleted ? 'COMPLETED' : 'PENDING',
      pay_token: payToken,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Orange verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
