import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "~/server/services/payment";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Payment Status Check API
 * 
 * GET /api/payment/status?reference=BOOKING_REF&method=MTN_MOMO
 * 
 * This endpoint checks the payment status for a booking and updates the database
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const method = searchParams.get('method') as 'MTN_MOMO' | 'ORANGE_MONEY';
    const transactionId = searchParams.get('transactionId');

    if (!reference) {
      return NextResponse.json(
        { error: 'Booking reference is required' },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.referenceNumber, reference))
      .limit(1);

    if (!booking[0]) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const paymentService = new PaymentService();
    let statusResult;

    // Check payment status based on method
    if (method === 'MTN_MOMO' && transactionId) {
      statusResult = await paymentService.checkMTNPaymentStatus(transactionId);
    } else {
      // Generic status check
      statusResult = await paymentService.verifyPaymentStatus(
        booking[0].paymentReference || reference,
        method || 'MTN_MOMO'
      );
    }

    // Update booking status if payment is completed
    if (statusResult.status === 'COMPLETED' && booking[0].status !== 'CONFIRMED') {
      await db
        .update(bookings)
        .set({
          status: 'CONFIRMED',
          paymentStatus: 'COMPLETED',
          paymentDetails: {
            ...booking[0].paymentDetails,
            statusCheck: {
              checkedAt: new Date().toISOString(),
              result: statusResult
            }
          }
        })
        .where(eq(bookings.id, booking[0].id));

      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
        message: 'Payment confirmed and booking updated',
        booking: {
          id: booking[0].id,
          reference: booking[0].referenceNumber,
          status: 'CONFIRMED'
        }
      });
    }

    // Update booking status if payment failed
    if (statusResult.status === 'FAILED' && booking[0].status !== 'CANCELLED') {
      await db
        .update(bookings)
        .set({
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
          paymentDetails: {
            ...booking[0].paymentDetails,
            statusCheck: {
              checkedAt: new Date().toISOString(),
              result: statusResult
            }
          }
        })
        .where(eq(bookings.id, booking[0].id));

      return NextResponse.json({
        success: false,
        status: 'FAILED',
        message: 'Payment failed and booking cancelled',
        booking: {
          id: booking[0].id,
          reference: booking[0].referenceNumber,
          status: 'CANCELLED'
        }
      });
    }

    // Return current status
    return NextResponse.json({
      success: statusResult.success,
      status: statusResult.status,
      message: statusResult.message,
      booking: {
        id: booking[0].id,
        reference: booking[0].referenceNumber,
        status: booking[0].status,
        paymentStatus: booking[0].paymentStatus
      },
      transactionId: statusResult.transactionId
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Manual payment status update (for testing)
 * POST /api/payment/status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, status, transactionId } = body;

    if (!reference || !status) {
      return NextResponse.json(
        { error: 'Reference and status are required' },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.referenceNumber, reference))
      .limit(1);

    if (!booking[0]) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking status
    const bookingStatus = status === 'COMPLETED' ? 'CONFIRMED' : 
                         status === 'FAILED' ? 'CANCELLED' : 'PENDING_PAYMENT';

    await db
      .update(bookings)
      .set({
        status: bookingStatus,
        paymentStatus: status,
        paymentReference: transactionId || booking[0].paymentReference,
        paymentDetails: {
          ...booking[0].paymentDetails,
          manualUpdate: {
            updatedAt: new Date().toISOString(),
            status,
            transactionId
          }
        }
      })
      .where(eq(bookings.id, booking[0].id));

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      booking: {
        id: booking[0].id,
        reference: booking[0].referenceNumber,
        status: bookingStatus,
        paymentStatus: status
      }
    });

  } catch (error) {
    console.error('Manual payment status update error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
