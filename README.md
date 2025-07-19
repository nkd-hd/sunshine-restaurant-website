# Sunshine Restaurant Website

A modern restaurant website with online ordering, delivery management, and WhatsApp integration built with the T3 Stack, featuring real-time order management, user authentication, shopping cart functionality, and seamless customer communication.

## 🚀 Features

- **Menu Management**: Browse, search, and filter meals with dietary information
- **User Authentication**: Secure login with NextAuth.js
- **Shopping Cart**: Add meals to cart and manage quantities
- **Order Management**: Complete ordering process with delivery tracking
- **User Dashboard**: View order history and delivery status
- **WhatsApp Integration**: Direct communication with restaurant and delivery riders
- **AI Chatbot**: Google Gemini-powered assistant for menu help and navigation
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript support with tRPC

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **Database**: [Drizzle ORM](https://orm.drizzle.team) with SingleStore/MySQL
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **API**: [tRPC](https://trpc.io) for type-safe APIs
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: [Lucide React](https://lucide.dev)

## 📋 Prerequisites

- Node.js 18+
- MySQL database (or SingleStore)
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd event-booking-system
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://username:password@host:port/database_name"

# NextAuth
AUTH_SECRET="your-secret-key-here"
AUTH_DISCORD_ID="your-discord-client-id" # Optional
AUTH_DISCORD_SECRET="your-discord-client-secret" # Optional

# Google Gemini API (for chatbot)
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Database Setup

```bash
# Generate and run migrations
npm run db:generate
npm run db:migrate

# Test database connection
npm run db:test

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Database Schema

The application uses the following main tables:

- **users**: User accounts and authentication
- **events**: Event information and details
- **bookings**: User bookings and reservations
- **cart**: Shopping cart items
- **accounts/sessions**: NextAuth.js authentication tables

## 📱 API Routes

### Events
- `GET /api/trpc/events.getAll` - Get all events with filtering
- `GET /api/trpc/events.getById` - Get event by ID
- `GET /api/trpc/events.getFeatured` - Get featured events

### Cart
- `GET /api/trpc/cart.getItems` - Get user's cart items
- `POST /api/trpc/cart.addItem` - Add item to cart
- `PUT /api/trpc/cart.updateQuantity` - Update item quantity
- `DELETE /api/trpc/cart.removeItem` - Remove item from cart

### Bookings
- `GET /api/trpc/bookings.getUserBookings` - Get user's bookings
- `GET /api/trpc/bookings.getStats` - Get booking statistics
- `POST /api/trpc/bookings.createFromCart` - Create booking from cart

## 🧪 Testing

```bash
# Test database connection
npm run db:test

# Run type checking
npm run check

# Run linting
npm run lint
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:test` - Test database connection
- `npm run db:studio` - Open Drizzle Studio

## 🚀 Deployment

The application is configured for deployment on Netlify. See the deployment guide in the project documentation.

## 📚 Learn More

- [T3 Stack Documentation](https://create.t3.gg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [tRPC Documentation](https://trpc.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
