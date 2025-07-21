# 🚀 Deployment Guide

Complete guide for deploying Sunshine Restaurant to production environments.

## 🎯 Overview

Sunshine Restaurant is designed for modern, scalable deployment with multiple platform options. The application uses Next.js for the frontend and Convex for the backend, providing flexibility in deployment strategies.

---

## 📋 Pre-deployment Checklist

### ✅ Code Preparation
- [ ] All features tested and working in development
- [ ] Production build succeeds locally (`npm run build`)
- [ ] Environment variables documented and configured
- [ ] Database schema finalized and migrated
- [ ] Performance optimizations applied
- [ ] Security configurations verified

### ✅ Infrastructure Setup
- [ ] Domain name registered and DNS configured
- [ ] SSL certificate obtained (automatic with most platforms)
- [ ] CDN configured for static assets
- [ ] Monitoring and logging systems ready
- [ ] Backup and recovery procedures in place

---

## 🌐 Platform-Specific Deployment

### 🔥 Vercel (Recommended)

Vercel is the optimal choice for Next.js applications with built-in optimizations.

#### Setup Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login and connect project
   vercel login
   vercel
   ```

2. **Environment Variables**
   Set these in the Vercel dashboard:
   ```bash
   # Core Application
   NEXTAUTH_SECRET=your-production-secret-key
   NEXTAUTH_URL=https://your-domain.com
   
   # Convex Backend
   CONVEX_DEPLOYMENT=your-production-convex-url
   NEXT_PUBLIC_CONVEX_URL=your-public-convex-url
   
   # External Services
   WHATSAPP_BUSINESS_NUMBER=+237XXXXXXXXX
   WHATSAPP_API_TOKEN=your-whatsapp-token
   MTN_MOMO_API_KEY=your-mtn-momo-key
   GOOGLE_MAPS_API_KEY=your-maps-key
   ```

3. **Deploy Configuration**
   ```json
   // vercel.json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "regions": ["fra1", "iad1"]
   }
   ```

4. **Custom Domain**
   - Add your domain in Vercel dashboard
   - Configure DNS records as instructed
   - SSL certificate is automatic

#### Benefits
- ✅ Zero-config Next.js optimizations
- ✅ Global CDN and edge functions
- ✅ Automatic HTTPS and SSL
- ✅ Git-based deployments
- ✅ Preview deployments for branches

---

### 🌊 Netlify

Alternative platform with excellent static site optimization.

#### Setup Steps

1. **Connect Repository**
   - Link GitHub repository in Netlify dashboard
   - Configure build settings

2. **Build Configuration**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build && npm run export"
     publish = "out"
   
   [build.environment]
     NODE_ENV = "production"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

3. **Environment Variables**
   Configure in Netlify dashboard with same variables as Vercel

---

### 🐳 Docker Deployment

For custom infrastructure or container orchestration.

#### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  sunshine-restaurant:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - CONVEX_DEPLOYMENT=${CONVEX_DEPLOYMENT}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - sunshine-restaurant
    restart: unless-stopped
```

---

### ☁️ AWS Deployment

For enterprise-scale deployment with full AWS integration.

#### Using AWS Amplify

```bash
# Install AWS Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### Using AWS ECS

```json
// task-definition.json
{
  "family": "sunshine-restaurant",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "sunshine-restaurant",
      "image": "your-ecr-repo/sunshine-restaurant:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sunshine-restaurant",
          "awslogs-region": "us-east-1"
        }
      }
    }
  ]
}
```

---

## 🗄️ Convex Backend Deployment

### Production Setup

1. **Deploy to Convex Cloud**
   ```bash
   # Deploy functions to production
   npx convex deploy --prod
   
   # Set environment variables
   npx convex env set WHATSAPP_API_TOKEN your-token --prod
   npx convex env set MTN_MOMO_API_KEY your-key --prod
   ```

2. **Database Migration**
   ```bash
   # Run production migrations
   npx convex run migrations:migrate --prod
   
   # Seed production data (if needed)
   npx convex run seed:initial --prod
   ```

3. **Monitoring Setup**
   ```bash
   # Enable monitoring
   npx convex logs --prod --follow
   ```

### Environment Variables

```bash
# Production Convex environment
WHATSAPP_BUSINESS_NUMBER="+237XXXXXXXXX"
WHATSAPP_API_TOKEN="production-token"
MTN_MOMO_API_KEY="production-key"
MTN_MOMO_SUBSCRIPTION_KEY="production-subscription-key"
ORANGE_MONEY_API_KEY="production-orange-key"
GOOGLE_MAPS_API_KEY="production-maps-key"
```

---

## 🔧 Environment Configuration

### Production Environment Variables

Create a comprehensive `.env.production` file:

```bash
# === Core Application ===
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# === Authentication ===
NEXTAUTH_SECRET="secure-production-secret-at-least-32-characters"
NEXTAUTH_URL="https://sunshinerestaurant.cm"

# === Convex Backend ===
CONVEX_DEPLOYMENT="production-deployment-url"
NEXT_PUBLIC_CONVEX_URL="https://your-convex-url"

# === External Services ===
WHATSAPP_BUSINESS_NUMBER="+237XXXXXXXXX"
WHATSAPP_API_TOKEN="production-whatsapp-token"

# === Payment Providers ===
MTN_MOMO_API_KEY="production-mtn-key"
MTN_MOMO_SUBSCRIPTION_KEY="production-mtn-subscription"
MTN_MOMO_ENVIRONMENT="production"
ORANGE_MONEY_API_KEY="production-orange-key"

# === Google Services ===
GOOGLE_MAPS_API_KEY="production-google-maps-key"
GEMINI_API_KEY="production-gemini-key"

# === Monitoring ===
SENTRY_DSN="your-sentry-dsn"
ANALYTICS_ID="your-analytics-id"
```

### Security Considerations

1. **Secret Management**
   - Use platform-specific secret managers
   - Rotate secrets regularly
   - Never commit secrets to version control

2. **CORS Configuration**
   ```typescript
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/api/(.*)',
           headers: [
             {
               key: 'Access-Control-Allow-Origin',
               value: 'https://sunshinerestaurant.cm'
             }
           ]
         }
       ]
     }
   }
   ```

---

## 📊 Performance Optimization

### Build Optimizations

```javascript
// next.config.js
module.exports = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/webp', 'image/avif']
  },
  
  // Enable compression
  compress: true,
  
  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(new BundleAnalyzerPlugin())
      return config
    }
  })
}
```

### Database Optimization

```typescript
// Convex index optimization
// convex/schema.ts
export default defineSchema({
  meals: defineTable({
    // ... schema
  })
    .index("by_category", ["categoryId"])
    .index("by_featured", ["featured"])
    .index("by_availability", ["availability"]),
    
  orders: defineTable({
    // ... schema
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
})
```

---

## 📈 Monitoring & Analytics

### Error Tracking

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure Sentry
# sentry.client.config.js
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
})
```

### Performance Monitoring

```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, properties?: object) => {
  if (typeof window !== 'undefined') {
    // Google Analytics
    gtag('event', eventName, properties)
    
    // Custom analytics
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event: eventName, properties })
    })
  }
}
```

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check Convex connection
    const convexHealth = await fetch(`${process.env.CONVEX_DEPLOYMENT}/health`)
    
    if (!convexHealth.ok) {
      throw new Error('Convex unhealthy')
    }
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json({ 
      status: 'unhealthy',
      error: error.message 
    }, { status: 500 })
  }
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

---

## 🚦 Post-Deployment

### Verification Checklist

- [ ] Website loads correctly at production URL
- [ ] SSL certificate is active and valid
- [ ] All pages and features work as expected
- [ ] Admin panel is accessible and functional
- [ ] Database operations work correctly
- [ ] External API integrations are working
- [ ] Error monitoring is capturing issues
- [ ] Performance metrics are being tracked

### Rollback Procedure

```bash
# Vercel rollback
vercel rollback [deployment-url]

# Docker rollback
docker-compose down
docker-compose up -d --scale app=0
docker-compose up -d previous-version
```

---

## 🎯 Domain & DNS Configuration

### DNS Records

```
Type    Name    Value                           TTL
A       @       your-server-ip                  3600
CNAME   www     sunshinerestaurant.cm          3600
TXT     @       "v=spf1 include:_spf.google.com ~all"  3600
```

### SSL Certificate

Most modern platforms handle SSL automatically, but for custom setups:

```bash
# Using Let's Encrypt
certbot --nginx -d sunshinerestaurant.cm -d www.sunshinerestaurant.cm
```

---

**🚀 Your Sunshine Restaurant is now ready for production! Monitor performance and user feedback to continue optimizing the experience.**
