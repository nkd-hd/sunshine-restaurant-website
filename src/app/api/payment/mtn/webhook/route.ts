import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { bookings } from '~/server/db/schema';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (in production, verify MTN signature)
    const body = await request.json();
    
    // Extract payment data from MTN webhook
    const {
      externalId,
      amount,
      currency,
      financialTransactionId,
      status,
      reason,
    } = body;

    if (!externalId) {
      return NextResponse.json(
        { error: 'Missing externalId' },
        { status: 400 }
      );
    }

    // Find booking by reference number
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.referenceNumber, externalId))
      .limit(1);

    if (!booking[0]) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update payment status based on MTN response
    let paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
    let bookingStatus: "CONFIRMED" | "CANCELLED" | "PENDING_PAYMENT";

    switch (status) {
      case 'SUCCESSFUL':
        paymentStatus = 'COMPLETED';
        bookingStatus = 'CONFIRMED';
        break;
      case 'FAILED':
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
        paymentReference: financialTransactionId,
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
    console.error('MTN webhook error:', error);
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
    const referenceId = searchParams.get('referenceId');

    if (!referenceId) {
      return NextResponse.json(
        { error: 'Missing referenceId' },
        { status: 400 }
      );
    }

    // In production, verify payment status with MTN API
    // For now, simulate the check
    const isCompleted = Math.random() > 0.5; // 50% chance for demo

    return NextResponse.json({
      status: isCompleted ? 'COMPLETED' : 'PENDING',
      referenceId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('MTN verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
