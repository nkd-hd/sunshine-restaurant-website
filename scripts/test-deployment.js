#!/usr/bin/env node

/**
 * Deployment Testing Script
 * Tests key endpoints and functionality of the deployed application
 */

const https = require('https');
const http = require('http');

// Configuration
const SITE_URL = process.env.SITE_URL || 'https://your-site-url.netlify.app';
const TIMEOUT = 10000; // 10 seconds

// Test endpoints
const endpoints = [
  { path: '/', name: 'Homepage' },
  { path: '/events', name: 'Events Page' },
  { path: '/auth/signin', name: 'Sign In Page' },
  { path: '/auth/signup', name: 'Sign Up Page' },
  { path: '/cart', name: 'Cart Page' },
  { path: '/api/health', name: 'Health Check API' },
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, { timeout: TIMEOUT }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', reject);
  });
}

async function testEndpoint(endpoint) {
  const url = `${SITE_URL}${endpoint.path}`;
  
  try {
    console.log(`${colors.blue}Testing:${colors.reset} ${endpoint.name} (${endpoint.path})`);
    
    const response = await makeRequest(url);
    
    if (response.statusCode >= 200 && response.statusCode < 400) {
      console.log(`${colors.green}✅ PASS${colors.reset} - Status: ${response.statusCode}`);
      return true;
    } else {
      console.log(`${colors.yellow}⚠️  WARN${colors.reset} - Status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ FAIL${colors.reset} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.blue}🚀 Starting deployment tests for: ${SITE_URL}${colors.reset}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) {
      passed++;
    } else {
      failed++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log(`${colors.blue}📊 Test Results:${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed! Deployment looks good.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Please check the deployment.${colors.reset}`);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error(`${colors.red}❌ Test runner failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };
