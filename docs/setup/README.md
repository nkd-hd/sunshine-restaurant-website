# 🚀 Setup Guide

Complete installation and configuration guide for Sunshine Restaurant.

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn 3.0.0+)
- **Git**: Latest version
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Recommended Development Environment
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

---

## 🔧 Installation Steps

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/nkd-hd/sunshine-restaurant-website.git
cd sunshine_restaurant

# Verify you're in the correct directory
pwd  # Should show: /path/to/sunshine_restaurant
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# If you encounter peer dependency warnings
npm install --legacy-peer-deps

# Alternative: use yarn
yarn install
```

### 3. Environment Configuration

Create your environment file:

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor
code .env  # VS Code
nano .env  # Terminal editor
```

#### Required Environment Variables

```env
# === Core Application ===
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"

# === Convex Backend ===
CONVEX_DEPLOYMENT="your-convex-deployment-url"
NEXT_PUBLIC_CONVEX_URL="your-public-convex-url"

# === Admin Account (First Time Setup) ===
ADMIN_EMAIL="admin@sunshinerestaurant.com"
ADMIN_PASSWORD="secure-admin-password"

# === WhatsApp Business (Optional) ===
WHATSAPP_BUSINESS_NUMBER="+237XXXXXXXXX"
WHATSAPP_API_TOKEN="your-whatsapp-business-token"

# === Payment Integration (Optional) ===
MTN_MOMO_API_KEY="your-mtn-momo-api-key"
MTN_MOMO_SUBSCRIPTION_KEY="your-subscription-key"
ORANGE_MONEY_API_KEY="your-orange-money-api-key"

# === Google Services (Optional) ===
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
GEMINI_API_KEY="your-google-gemini-api-key"

# === Production Settings ===
NODE_ENV="development"  # or "production"
```

### 4. Convex Setup

Set up your Convex backend:

```bash
# Install Convex CLI globally
npm install -g convex

# Login to Convex (opens browser)
npx convex login

# Initialize Convex in your project
npx convex dev --configure

# This will:
# 1. Create a new Convex project
# 2. Generate convex/_generated files
# 3. Start the development server
```

### 5. Database Setup

The Convex database is automatically configured. Seed it with initial data:

```bash
# Run database seed script
npm run db:seed

# Verify seed data was created
npx convex query meals:getAll
```

### 6. Development Server

Start the development server:

```bash
# Start Next.js development server
npm run dev

# Alternative: run with verbose logging
npm run dev -- --verbose

# Server should start at: http://localhost:3000
```

---

## ✅ Verification Steps

### 1. Check Application Loading

1. Open browser to `http://localhost:3000`
2. Verify homepage loads with Sunshine Restaurant branding
3. Check that navigation works (Home, Menu, Contact, etc.)
4. Verify mobile responsiveness by resizing browser

### 2. Test Authentication

1. Click "Sign In" button
2. Try creating a new account
3. Verify login/logout functionality
4. Check admin access (if admin account created)

### 3. Test Admin Panel

1. Login as admin user
2. Navigate to `/admin`
3. Verify all admin sections load:
   - Dashboard
   - Meals Management
   - Categories
   - Orders
   - Users
   - Settings
   - Analytics

### 4. Verify Convex Connection

```bash
# Test Convex queries
npx convex query meals:getAll
npx convex query categories:getAll
npx convex query users:getAll

# Should return data (empty arrays if no data)
```

---

## 🔧 Development Tools

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Database (Convex)
npm run db:seed      # Seed database with sample data
npm run convex:dev   # Start Convex development

# Testing
npm run test         # Run tests (when implemented)
npm run test:watch   # Run tests in watch mode
```

### Code Quality Tools

The project includes pre-configured tools:

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks (if configured)

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Node Version Issues
```bash
# Check Node version
node --version  # Should be 18+

# Use nvm to manage Node versions
nvm install 18
nvm use 18
```

#### 2. Port Already in Use
```bash
# If port 3000 is busy, use different port
npm run dev -- --port 3001

# Or find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

#### 3. Convex Connection Issues
```bash
# Re-initialize Convex
npx convex logout
npx convex login
npx convex dev --configure

# Check Convex dashboard
npx convex dashboard
```

#### 4. Environment Variables Not Loading
```bash
# Verify .env file exists and is in root directory
ls -la .env

# Check if variables are loaded
npm run dev -- --inspect

# Restart development server after .env changes
```

#### 5. Module Resolution Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For persistent issues
npm install --legacy-peer-deps
```

### Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/nkd-hd/sunshine-restaurant-website/issues)
2. Review the [Development Guide](../development/README.md)
3. Join our [Discord Community](https://discord.gg/sunshine-restaurant) (if available)
4. Create a detailed issue report with:
   - Your operating system
   - Node.js version
   - Exact error messages
   - Steps to reproduce

---

## 🎯 Next Steps

Once setup is complete:

1. 📖 **Read the [Architecture Overview](../architecture/README.md)** - Understand the system design
2. 👨‍💼 **Explore [Admin Guide](../admin/README.md)** - Learn restaurant management features
3. 👩‍💻 **Check [Development Guide](../development/README.md)** - Start contributing code
4. 🚀 **Review [Deployment Guide](../deployment/README.md)** - Prepare for production

---

**🎉 Congratulations! Your Sunshine Restaurant development environment is ready!**
