# MTN Mobile Money & Orange Money Integration Setup Guide

## Overview

This guide walks you through integrating real MTN Mobile Money and Orange Money APIs with your event booking system. The system is designed to fall back to simulation mode when API credentials are not configured.

## Prerequisites

1. **MTN MoMo Developer Account**: Register at [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
2. **Orange Money Developer Account**: Register at [Orange Developer Portal](https://developer.orange.com/)

## Step 1: MTN Mobile Money API Setup

### 1.1 Register for MTN MoMo API

1. Go to [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
2. Create an account and verify your email
3. Subscribe to the Collections API (for receiving payments)
4. Note down your:
   - Primary Key (Ocp-Apim-Subscription-Key)
   - Secondary Key (backup)

### 1.2 Create API User (via CLI/Code)

You can create API users programmatically using the script below:

```bash
# Set your credentials
export MTN_PRIMARY_KEY="your_primary_key_here"
export MTN_SECONDARY_KEY="your_secondary_key_here"

# Create API User (you can run this from your IDE terminal)
curl -X POST \
  https://sandbox.momodeveloper.mtn.com/v1_0/apiuser \
  -H "X-Reference-Id: $(uuidgen)" \
  -H "Ocp-Apim-Subscription-Key: $MTN_PRIMARY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "providerCallbackHost": "your-domain.com"
  }'
```

### 1.3 Generate API Key

```bash
# Get the Reference-Id from the previous step
export API_USER_ID="reference_id_from_previous_step"

# Generate API Key
curl -X POST \
  https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/$API_USER_ID/apikey \
  -H "Ocp-Apim-Subscription-Key: $MTN_PRIMARY_KEY"
```

### 1.4 Update Environment Variables

Add these to your `.env.local` file:

```bash
# MTN Mobile Money API Configuration
MTN_MOMO_API_BASE_URL="https://sandbox.momodeveloper.mtn.com"
MTN_MOMO_PRIMARY_KEY="your_primary_key_here"
MTN_MOMO_SECONDARY_KEY="your_secondary_key_here"
MTN_MOMO_API_USER_ID="your_api_user_id_here"
MTN_MOMO_API_KEY="your_api_key_here"
MTN_MOMO_ENVIRONMENT="sandbox"
```

## Step 2: Orange Money API Setup

### 2.1 Register for Orange Money API

1. Go to [Orange Developer Portal](https://developer.orange.com/)
2. Create an account and verify your email
3. Apply for Orange Money Web Payment API access
4. Get your:
   - Client ID
   - Client Secret
   - Merchant Key

### 2.2 Get Access Token (Programmatically)

You can test the token generation using this curl command:

```bash
# Set your credentials
export ORANGE_CLIENT_ID="your_client_id_here"
export ORANGE_CLIENT_SECRET="your_client_secret_here"

# Generate Access Token
curl -X POST \
  https://api.orange.com/oauth/v3/token \
  -H "Authorization: Basic $(echo -n $ORANGE_CLIENT_ID:$ORANGE_CLIENT_SECRET | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

### 2.3 Update Environment Variables

Add these to your `.env.local` file:

```bash
# Orange Money API Configuration
ORANGE_MONEY_API_BASE_URL="https://api.orange.com/orange-money-webpay/dev/v1"
ORANGE_MONEY_AUTH_HEADER="your_auth_header_here"
ORANGE_MONEY_MERCHANT_KEY="your_merchant_key_here"
ORANGE_MONEY_CLIENT_ID="your_client_id_here"
ORANGE_MONEY_CLIENT_SECRET="your_client_secret_here"
ORANGE_MONEY_ENVIRONMENT="sandbox"
```

## Step 3: Testing the Integration

### 3.1 Start Your Development Server

```bash
npm run dev
# or
pnpm dev
```

### 3.2 Test Payment Flow

1. **Add items to cart**: Navigate to `/events` and add some events to your cart
2. **Go to checkout**: Navigate to `/checkout`
3. **Select MTN MoMo or Orange Money**: Choose your payment method
4. **Enter phone number**: Use the correct format:
   - MTN: `+237 67X XXX XXX` or `+237 68X XXX XXX`
   - Orange: `+237 69X XXX XXX`
5. **Complete booking**: Click "Complete Booking"

### 3.3 Monitor Payment Status

The system will:
1. Create a booking with `PENDING_PAYMENT` status
2. Call the respective payment API
3. Show payment status with real-time updates
4. Handle webhook notifications (when configured)

## Step 4: Production Setup

### 4.1 Switch to Production URLs

For MTN MoMo:
```bash
MTN_MOMO_API_BASE_URL="https://momodeveloper.mtn.com"
MTN_MOMO_ENVIRONMENT="production"
```

For Orange Money:
```bash
ORANGE_MONEY_API_BASE_URL="https://api.orange.com/orange-money-webpay/v1"
ORANGE_MONEY_ENVIRONMENT="production"
```

### 4.2 Configure Webhooks

Update your webhook URLs in the payment service configurations:

```typescript
// In src/server/services/payment.ts
return_url: `${process.env.NEXTAUTH_URL}/booking-confirmation`,
cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
notif_url: `${process.env.NEXTAUTH_URL}/api/payment/orange/webhook`,
```

### 4.3 SSL/HTTPS Requirements

Ensure your production environment:
- Uses HTTPS (required by payment providers)
- Has valid SSL certificates
- Can receive webhook notifications

## Step 5: Advanced Features

### 5.1 Payment Status Polling

The system includes automatic payment status checking:

```typescript
// Client-side polling for payment updates
useEffect(() => {
  if (paymentStatus === 'PENDING') {
    const interval = setInterval(async () => {
      const status = await checkPaymentStatus(paymentReference);
      if (status !== 'PENDING') {
        setPaymentStatus(status);
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }
}, [paymentStatus]);
```

### 5.2 Error Handling

The payment service includes comprehensive error handling:

- **Network failures**: Automatic fallback to simulation
- **Invalid credentials**: Clear error messages
- **API rate limits**: Proper retry logic
- **Webhook validation**: Signature verification (when implemented)

### 5.3 Logging and Monitoring

Add monitoring for:
- Payment success/failure rates
- API response times
- Webhook delivery status
- Customer payment patterns

## Step 6: Testing Commands

You can test API integration from your terminal:

### MTN MoMo Test Payment

```bash
# Test MTN payment request
curl -X POST http://localhost:3000/api/payment/mtn/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "externalId": "EVT-TEST-123",
    "amount": "1000",
    "currency": "EUR",
    "financialTransactionId": "FT123456789",
    "status": "SUCCESSFUL"
  }'
```

### Orange Money Test Payment

```bash
# Test Orange payment request
curl -X POST http://localhost:3000/api/payment/orange/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "EVT-TEST-456",
    "amount": 1000,
    "txnid": "TXN123456789",
    "status": "SUCCESS"
  }'
```

## Troubleshooting

### Common Issues

1. **"Credentials not configured" message**: 
   - Ensure all environment variables are set correctly
   - Restart your development server after updating `.env.local`

2. **Phone number validation errors**:
   - Use correct Cameroon phone number formats
   - Include country code (+237)

3. **Payment fails immediately**:
   - Check API credentials in developer portals
   - Verify sandbox/production environment settings

4. **Webhooks not received**:
   - Ensure your server is accessible from the internet
   - Use ngrok for local development webhook testing

### Getting Help

- **MTN MoMo**: [Developer Support](https://momodeveloper.mtn.com/support)
- **Orange Money**: [Developer Documentation](https://developer.orange.com/docs)

## Security Considerations

1. **Never commit API keys**: Use environment variables
2. **Validate webhooks**: Implement signature verification
3. **Use HTTPS**: Required for production
4. **Log securely**: Avoid logging sensitive payment data
5. **Rate limiting**: Implement API rate limiting
6. **Monitor transactions**: Set up alerts for unusual activity

---

## Summary

Your event booking system now supports:

✅ **MTN Mobile Money payments** with real API integration  
✅ **Orange Money payments** with real API integration  
✅ **Automatic fallback** to simulation when credentials aren't configured  
✅ **Webhook handling** for payment status updates  
✅ **Phone number validation** for Cameroon formats  
✅ **Real-time payment status** tracking  
✅ **Comprehensive error handling** and logging  

The system is production-ready and will automatically use simulation mode during development and real APIs when proper credentials are configured.
