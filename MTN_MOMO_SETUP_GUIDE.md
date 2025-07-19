# MTN Mobile Money Integration Setup Guide

This guide will help you set up MTN Mobile Money payment integration for your event booking system.

## Prerequisites

1. **MTN MoMo Developer Account**: Sign up at [https://momodeveloper.mtn.com](https://momodeveloper.mtn.com)
2. **Collections Product Subscription**: Subscribe to the Collections product in sandbox
3. **Primary Key**: Get your Primary Key from the Collections product subscription

## Step 1: Get Your Primary Key

1. Go to [MTN MoMo Developer Portal](https://momodeveloper.mtn.com)
2. Sign in to your account
3. Navigate to **Products** → **Collections**
4. Subscribe to the Collections product (sandbox)
5. Copy your **Primary Key** (also called Subscription Key)

## Step 2: Generate API Credentials

You have several options to generate your API User ID and API Key:

### Option A: Using the Setup Script (Recommended)

```bash
# Navigate to your project directory
cd /path/to/your/event-booking-system

# Run the setup script with your Primary Key
node scripts/setup-mtn-credentials.js YOUR_PRIMARY_KEY_HERE

# Example:
node scripts/setup-mtn-credentials.js abc123def456ghi789
```

The script will output your credentials like this:
```
📝 Add these to your .env file:
=====================================
MTN_MOMO_PRIMARY_KEY="abc123def456ghi789"
MTN_MOMO_API_USER_ID="ee67c3b9-0357-4351-ac88-e47340213bb1"
MTN_MOMO_API_KEY="cbd4aa5d0929439ab4760ec10762b9c5"
MTN_MOMO_ENVIRONMENT="sandbox"
MTN_MOMO_API_BASE_URL="https://sandbox.momodeveloper.mtn.com"
=====================================
```

### Option B: Using the API Endpoint

1. Start your development server:
```bash
npm run dev
```

2. Make a POST request to the setup endpoint:
```bash
curl -X POST http://localhost:3000/api/mtn/setup \
  -H "Content-Type: application/json" \
  -d '{"primaryKey": "YOUR_PRIMARY_KEY_HERE"}'
```

### Option C: Using CLI Tools

If you prefer using existing CLI tools:

```bash
# Install the MTN MoMo CLI
npm install -g mtn-momo

# Generate credentials
npx momo-sandbox --host localhost:3000 --primary-key YOUR_PRIMARY_KEY_HERE
```

## Step 3: Update Environment Variables

Add the generated credentials to your `.env` file:

```env
# MTN Mobile Money Configuration
MTN_MOMO_API_BASE_URL="https://sandbox.momodeveloper.mtn.com"
MTN_MOMO_PRIMARY_KEY="your_primary_key_here"
MTN_MOMO_API_USER_ID="your_api_user_id_here"
MTN_MOMO_API_KEY="your_api_key_here"
MTN_MOMO_ENVIRONMENT="sandbox"
```

## Step 4: Test Your Integration

### Test Credentials
```bash
# Test if your credentials work
curl "http://localhost:3000/api/mtn/setup?test=true"
```

### Test Payment Flow

1. **Start your application**:
```bash
npm run dev
```

2. **Create a test booking**:
   - Go to your event booking page
   - Add items to cart
   - Proceed to checkout
   - Select "MTN Mobile Money" as payment method
   - Use a test phone number: `+237677123456` or `+237681234567`

3. **Check payment status**:
```bash
# Replace BOOKING_REF with your actual booking reference
curl "http://localhost:3000/api/payment/status?reference=BOOKING_REF&method=MTN_MOMO"
```

## Step 5: Understanding the Payment Flow

### 1. Payment Request
When a user selects MTN MoMo and submits payment:
- Your app calls the MTN Collections API
- MTN sends a USSD prompt to the user's phone
- User enters their PIN to confirm payment

### 2. Payment Status
- **PENDING**: Payment request sent, waiting for user confirmation
- **COMPLETED**: User confirmed payment successfully
- **FAILED**: Payment was declined or failed

### 3. Webhook Handling
MTN will send webhooks to your callback URL when payment status changes:
- Webhook endpoint: `/api/payment/mtn/webhook`
- Your app updates booking status automatically

## Step 6: Phone Number Format

MTN MoMo accepts these phone number formats for Cameroon:
- `+237677123456` (MTN numbers start with 67X or 68X)
- `+237681234567`
- `237677123456` (without + prefix)

## Step 7: Testing in Sandbox

### Test Phone Numbers
Use these test numbers in sandbox:
- `+237677123456` - Will always succeed
- `+237681234567` - Will always succeed
- `+237677999999` - Will always fail (for testing failure scenarios)

### Test Amounts
- Any amount between 100 and 1,000,000 XAF
- Sandbox converts XAF to EUR automatically

## Step 8: Production Setup

When ready for production:

1. **Switch to Production Environment**:
```env
MTN_MOMO_API_BASE_URL="https://momodeveloper.mtn.com"
MTN_MOMO_ENVIRONMENT="production"
```

2. **Get Production Credentials**:
   - Subscribe to Collections product in production
   - Generate new API User and API Key for production
   - Update your environment variables

3. **Update Webhook URLs**:
   - Ensure your webhook endpoints are accessible from the internet
   - Use HTTPS URLs for production

## Troubleshooting

### Common Issues

1. **401 Unauthorized**:
   - Check your API User ID and API Key
   - Ensure you're using the correct Primary Key
   - Verify your access token is valid

2. **400 Bad Request**:
   - Check phone number format
   - Verify amount is within limits
   - Ensure all required fields are provided

3. **409 Conflict**:
   - Transaction ID already exists
   - Use a unique reference for each payment

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

Check your application logs for detailed error messages.

## API Reference

### Generate Credentials
```
POST /api/mtn/setup
Content-Type: application/json

{
  "primaryKey": "your_primary_key"
}
```

### Test Credentials
```
GET /api/mtn/setup?test=true
```

### Check Payment Status
```
GET /api/payment/status?reference=BOOKING_REF&method=MTN_MOMO
```

### Manual Status Update (Testing)
```
POST /api/payment/status
Content-Type: application/json

{
  "reference": "BOOKING_REF",
  "status": "COMPLETED",
  "transactionId": "optional_transaction_id"
}
```

## Next Steps

1. **Generate your credentials** using one of the methods above
2. **Update your .env file** with the credentials
3. **Test the payment flow** with test phone numbers
4. **Implement status checking** in your frontend
5. **Handle webhooks** for automatic status updates

For any issues, check the application logs or contact MTN MoMo support.
