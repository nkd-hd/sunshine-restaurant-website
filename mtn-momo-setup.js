#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// MTN MoMo Sandbox Provisioning API
const BASE_URL = 'https://sandbox.momodeveloper.mtn.com';
const CREDENTIALS_FILE = path.join(process.cwd(), '.mtn-momo-credentials.json');

// Command line argument parsing
const args = process.argv.slice(2);
const command = args[0];

function showUsage() {
    console.log('🚀 MTN MoMo CLI Tool\n');
    console.log('Usage:');
    console.log('  node mtn-momo-setup.js generate <primary_key> <callback_host>');
    console.log('  node mtn-momo-setup.js token [credentials_file]');
    console.log('  node mtn-momo-setup.js status');
    console.log('  node mtn-momo-setup.js help\n');
    console.log('Commands:');
    console.log('  generate  Generate API User ID and API Key using Primary Key');
    console.log('  token     Generate access token using saved credentials');
    console.log('  status    Show current saved credentials');
    console.log('  help      Show this help message\n');
    console.log('Examples:');
    console.log('  node mtn-momo-setup.js generate abc123def456 https://webhook.site/unique-id');
    console.log('  node mtn-momo-setup.js token');
    console.log('  node mtn-momo-setup.js status');
}

function saveCredentials(credentials) {
    try {
        fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
        console.log(`💾 Credentials saved to: ${CREDENTIALS_FILE}`);
    } catch (error) {
        console.error('❌ Failed to save credentials:', error.message);
    }
}

function loadCredentials(filePath = CREDENTIALS_FILE) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('❌ Failed to load credentials:', error.message);
        return null;
    }
}

function generateApiCredentials(primaryKey, callbackHost) {
    if (!primaryKey || !callbackHost) {
        console.error('❌ Missing required parameters');
        showUsage();
        process.exit(1);
    }

    // Step 1: Create API User
    const createUser = () => {
        const userId = generateUUID();
        const postData = JSON.stringify({
            "providerCallbackHost": callbackHost
        });

        const options = {
            hostname: 'sandbox.momodeveloper.mtn.com',
            port: 443,
            path: `/v1_0/apiuser`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Ocp-Apim-Subscription-Key': primaryKey,
                'X-Reference-Id': userId
            }
        };

        const req = https.request(options, (res) => {
            console.log(`Create User Status Code: ${res.statusCode}`);
            
            if (res.statusCode === 201) {
                console.log(`✅ API User created successfully!`);
                console.log(`User ID: ${userId}`);
                
                // Step 2: Generate API Key
                setTimeout(() => generateApiKey(userId, primaryKey), 2000);
            } else {
                console.error(`❌ Failed to create API user. Status: ${res.statusCode}`);
                res.on('data', (chunk) => {
                    console.error('Error:', chunk.toString());
                });
            }
        });

        req.on('error', (e) => {
            console.error(`❌ Request error: ${e.message}`);
        });

        req.write(postData);
        req.end();
    };

    // Step 2: Generate API Key
    const generateApiKey = (userId, primaryKey) => {
        const options = {
            hostname: 'sandbox.momodeveloper.mtn.com',
            port: 443,
            path: `/v1_0/apiuser/${userId}/apikey`,
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': primaryKey
            }
        };

        const req = https.request(options, (res) => {
            console.log(`Generate API Key Status Code: ${res.statusCode}`);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 201) {
                    const response = JSON.parse(data);
                    const credentials = {
                        userId: userId,
                        apiKey: response.apiKey,
                        primaryKey: primaryKey,
                        callbackHost: callbackHost,
                        createdAt: new Date().toISOString()
                    };
                    
                    console.log(`✅ API Key generated successfully!`);
                    console.log(`\n=== MTN MoMo Sandbox Credentials ===`);
                    console.log(`User ID: ${userId}`);
                    console.log(`API Key: ${response.apiKey}`);
                    console.log(`Primary Key: ${primaryKey}`);
                    console.log(`Callback Host: ${callbackHost}`);
                    console.log(`Created: ${credentials.createdAt}`);
                    console.log(`=====================================\n`);
                    
                    // Save credentials to file
                    saveCredentials(credentials);
                    
                    console.log(`💡 Environment variables:`);
                    console.log(`export MTN_MOMO_API_USER_ID="${userId}"`);
                    console.log(`export MTN_MOMO_API_KEY="${response.apiKey}"`);
                    console.log(`export MTN_MOMO_PRIMARY_KEY="${primaryKey}"\n`);
                    
                    console.log(`🎯 Next steps:`);
                    console.log(`1. Run: node mtn-momo-setup.js token`);
                    console.log(`2. Or use the credentials above to make API calls`);
                } else {
                    console.error(`❌ Failed to generate API key. Status: ${res.statusCode}`);
                    console.error('Error:', data);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Request error: ${e.message}`);
        });

        req.end();
    };

    // Generate UUID v4
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Start the process
    createUser();
}

// Get command line arguments
const args = process.argv.slice(2);
const primaryKey = args[0];
const callbackHost = args[1];

console.log(`🚀 MTN MoMo Sandbox API User & Key Generator`);
console.log(`Primary Key: ${primaryKey ? primaryKey.substring(0, 8) + '...' : 'Not provided'}`);
console.log(`Callback Host: ${callbackHost || 'Not provided'}`);
console.log('');

generateApiCredentials(primaryKey, callbackHost);
