import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "~/server/services/payment";

/**
 * MTN MoMo Setup API Endpoint
 * 
 * This endpoint helps you set up MTN MoMo credentials for sandbox testing.
 * POST /api/mtn/setup with { primaryKey: "your_primary_key" }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { primaryKey, callbackHost } = body;

    if (!primaryKey) {
      return NextResponse.json(
        { error: 'Primary Key is required' },
        { status: 400 }
      );
    }

    const paymentService = new PaymentService();

    // Create API User
    console.log('Creating MTN API User...');
    const { apiUserId } = await paymentService.createMTNAPIUser();

    // Generate API Key
    console.log('Generating MTN API Key...');
    const { apiKey } = await paymentService.generateMTNAPIKey(apiUserId);

    return NextResponse.json({
      success: true,
      credentials: {
        apiUserId,
        apiKey,
        primaryKey,
        environment: 'sandbox',
        baseUrl: 'https://sandbox.momodeveloper.mtn.com'
      },
      message: 'MTN MoMo credentials generated successfully',
      instructions: [
        'Add these credentials to your .env file:',
        `MTN_MOMO_PRIMARY_KEY="${primaryKey}"`,
        `MTN_MOMO_API_USER_ID="${apiUserId}"`,
        `MTN_MOMO_API_KEY="${apiKey}"`,
        'MTN_MOMO_ENVIRONMENT="sandbox"',
        'MTN_MOMO_API_BASE_URL="https://sandbox.momodeveloper.mtn.com"'
      ]
    });

  } catch (error) {
    console.error('MTN setup error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to set up MTN MoMo credentials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Test MTN MoMo credentials
 * GET /api/mtn/setup?test=true
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');

    if (test === 'true') {
      const paymentService = new PaymentService();
      
      // Try to get an access token to test credentials
      try {
        const token = await (paymentService as any).getMTNAccessToken();
        
        return NextResponse.json({
          success: true,
          message: 'MTN MoMo credentials are working correctly',
          tokenGenerated: !!token
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'MTN MoMo credentials test failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'MTN MoMo Setup API',
      endpoints: {
        'POST /api/mtn/setup': 'Generate new MTN MoMo credentials',
        'GET /api/mtn/setup?test=true': 'Test existing MTN MoMo credentials'
      }
    });

  } catch (error) {
    console.error('MTN setup GET error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
