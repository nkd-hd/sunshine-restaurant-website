#!/usr/bin/env node

/**
 * MTN MoMo Sandbox Credentials Setup Script
 * 
 * This script helps you generate API User ID and API Key for MTN MoMo sandbox.
 * You need to provide your Primary Key from the MTN MoMo Developer Portal.
 * 
 * Usage: node scripts/setup-mtn-credentials.js YOUR_PRIMARY_KEY
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const MTN_MOMO_BASE_URL = 'https://sandbox.momodeveloper.mtn.com';

async function createAPIUser(primaryKey, callbackHost = 'http://localhost:3000') {
  const apiUserId = uuidv4();
  
  try {
    console.log('🔄 Creating MTN MoMo API User...');
    
    const response = await axios.post(
      `${MTN_MOMO_BASE_URL}/v1_0/apiuser`,
      {
        providerCallbackHost: callbackHost
      },
      {
        headers: {
          'X-Reference-Id': apiUserId,
          'Ocp-Apim-Subscription-Key': primaryKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ API User created successfully!');
    console.log('📋 API User ID:', apiUserId);
    
    return apiUserId;
  } catch (error) {
    console.error('❌ Failed to create API User:', error.response?.data || error.message);
    throw error;
  }
}

async function generateAPIKey(primaryKey, apiUserId) {
  try {
    console.log('🔄 Generating API Key...');
    
    const response = await axios.post(
      `${MTN_MOMO_BASE_URL}/v1_0/apiuser/${apiUserId}/apikey`,
      {},
      {
        headers: {
          'Ocp-Apim-Subscription-Key': primaryKey
        }
      }
    );

    console.log('✅ API Key generated successfully!');
    console.log('🔑 API Key:', response.data.apiKey);
    
    return response.data.apiKey;
  } catch (error) {
    console.error('❌ Failed to generate API Key:', error.response?.data || error.message);
    throw error;
  }
}

async function testCredentials(primaryKey, apiUserId, apiKey) {
  try {
    console.log('🔄 Testing credentials by generating access token...');
    
    const auth = Buffer.from(`${apiUserId}:${apiKey}`).toString('base64');
    
    const response = await axios.post(
      `${MTN_MOMO_BASE_URL}/collection/token/`,
      {},
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': primaryKey,
          'X-Target-Environment': 'sandbox'
        }
      }
    );

    console.log('✅ Credentials test successful!');
    console.log('🎯 Access Token:', response.data.access_token);
    console.log('⏰ Expires in:', response.data.expires_in, 'seconds');
    
    return true;
  } catch (error) {
    console.error('❌ Credentials test failed:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  const primaryKey = process.argv[2];
  const callbackHost = process.argv[3] || 'http://localhost:3000';

  if (!primaryKey) {
    console.error('❌ Please provide your MTN MoMo Primary Key as an argument');
    console.log('Usage: node scripts/setup-mtn-credentials.js YOUR_PRIMARY_KEY [CALLBACK_HOST]');
    console.log('Example: node scripts/setup-mtn-credentials.js abc123def456 http://localhost:3000');
    process.exit(1);
  }

  try {
    console.log('🚀 Setting up MTN MoMo sandbox credentials...');
    console.log('🔗 Callback Host:', callbackHost);
    console.log('');

    // Step 1: Create API User
    const apiUserId = await createAPIUser(primaryKey, callbackHost);
    
    // Step 2: Generate API Key
    const apiKey = await generateAPIKey(primaryKey, apiUserId);
    
    // Step 3: Test credentials
    const testPassed = await testCredentials(primaryKey, apiUserId, apiKey);
    
    console.log('');
    console.log('🎉 Setup completed!');
    console.log('');
    console.log('📝 Add these to your .env file:');
    console.log('=====================================');
    console.log(`MTN_MOMO_PRIMARY_KEY="${primaryKey}"`);
    console.log(`MTN_MOMO_API_USER_ID="${apiUserId}"`);
    console.log(`MTN_MOMO_API_KEY="${apiKey}"`);
    console.log(`MTN_MOMO_ENVIRONMENT="sandbox"`);
    console.log(`MTN_MOMO_API_BASE_URL="https://sandbox.momodeveloper.mtn.com"`);
    console.log('=====================================');
    
    if (testPassed) {
      console.log('✅ Your credentials are ready to use!');
    } else {
      console.log('⚠️  Credentials created but test failed. Please verify manually.');
    }
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  }
}

main();
