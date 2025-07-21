import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    emailVerified: v.optional(v.number()),
    image: v.optional(v.string()),
    password: v.optional(v.string()),
    role: v.union(v.literal("USER"), v.literal("ADMIN")),
    
    // Auth provider fields
    providerId: v.optional(v.string()),
    providerType: v.optional(v.string()),
    providerAccountId: v.optional(v.string()),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expires: v.number(),
  }).index("by_session_token", ["sessionToken"]),

  // Restaurant Schema

  mealCategories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    displayOrder: v.number(),
    isActive: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
  }).index("by_display_order", ["displayOrder"]),

  meals: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ingredients: v.optional(v.string()),
    price: v.number(),
    promotionalPrice: v.optional(v.number()),
    promotionStartDate: v.optional(v.string()),
    promotionEndDate: v.optional(v.string()),
    categoryId: v.optional(v.id("mealCategories")),
    imageUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    portionSize: v.optional(v.string()),
    preparationTime: v.optional(v.number()), // in minutes
    calories: v.optional(v.number()),
    isVegetarian: v.union(v.literal("YES"), v.literal("NO")),
    isVegan: v.union(v.literal("YES"), v.literal("NO")),
    isHalal: v.union(v.literal("YES"), v.literal("NO")),
    isGlutenFree: v.union(v.literal("YES"), v.literal("NO")),
    isDairyFree: v.union(v.literal("YES"), v.literal("NO")),
    isNutFree: v.union(v.literal("YES"), v.literal("NO")),
    allergens: v.optional(v.array(v.string())),
    isAvailable: v.union(v.literal("AVAILABLE"), v.literal("OUT_OF_STOCK"), v.literal("DISCONTINUED")),
    isFeatured: v.union(v.literal("YES"), v.literal("NO")),
    stockQuantity: v.optional(v.number()),
    minimumOrderQuantity: v.number(),
    maximumOrderQuantity: v.optional(v.number()),
    displayOrder: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_availability", ["isAvailable"])
    .index("by_featured", ["isFeatured"])
    .index("by_display_order", ["displayOrder"]),

  deliveryAddresses: defineTable({
    userId: v.id("users"),
    label: v.optional(v.string()), // "Home", "Work", etc.
    recipientName: v.string(),
    recipientPhone: v.string(),
    neighborhood: v.string(), // Yaoundé districts
    streetName: v.optional(v.string()),
    houseNumber: v.optional(v.string()),
    landmark: v.optional(v.string()),
    additionalInstructions: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    isDefault: v.union(v.literal("YES"), v.literal("NO")),
    isActive: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
  }).index("by_user", ["userId"]),

  riders: defineTable({
    name: v.string(),
    phone: v.string(),
    whatsappNumber: v.string(),
    vehicleType: v.union(v.literal("MOTORCYCLE"), v.literal("BICYCLE"), v.literal("CAR")),
    vehicleDetails: v.optional(v.string()),
    isAvailable: v.union(v.literal("AVAILABLE"), v.literal("BUSY"), v.literal("OFFLINE")),
    isActive: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
  }).index("by_availability", ["isAvailable"]),

  orders: defineTable({
    userId: v.id("users"),
    deliveryAddressId: v.id("deliveryAddresses"),
    riderId: v.optional(v.id("riders")),
    orderNumber: v.string(),
    subtotal: v.number(),
    deliveryFee: v.number(),
    totalAmount: v.number(),
    status: v.union(
      v.literal("PENDING"),
      v.literal("CONFIRMED"),
      v.literal("PREPARING"),
      v.literal("READY_FOR_PICKUP"),
      v.literal("OUT_FOR_DELIVERY"),
      v.literal("DELIVERED"),
      v.literal("CANCELLED")
    ),
    paymentMethod: v.optional(v.union(v.literal("MTN_MOMO"), v.literal("ORANGE_MONEY"), v.literal("CASH_ON_DELIVERY"))),
    paymentStatus: v.union(v.literal("PENDING"), v.literal("COMPLETED"), v.literal("FAILED"), v.literal("REFUNDED")),
    paymentReference: v.optional(v.string()),
    paymentDetails: v.optional(v.any()), // JSON
    estimatedDeliveryTime: v.optional(v.number()),
    actualDeliveryTime: v.optional(v.number()),
    specialInstructions: v.optional(v.string()),
    customerNotes: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_order_number", ["orderNumber"])
    .index("by_status", ["status"])
    .index("by_rider", ["riderId"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    mealId: v.id("meals"),
    quantity: v.number(),
    unitPrice: v.number(),
    totalPrice: v.number(),
    specialInstructions: v.optional(v.string()),
  })
    .index("by_order", ["orderId"])
    .index("by_meal", ["mealId"]),

  cart: defineTable({
    userId: v.id("users"),
    mealId: v.id("meals"),
    quantity: v.number(),
    specialInstructions: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_meal", ["mealId"]),

  restaurantConfig: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    deliveryFee: v.number(),
    minimumOrderAmount: v.optional(v.number()),
    estimatedDeliveryTime: v.optional(v.number()), // in minutes
    maxDeliveryDistance: v.optional(v.number()), // in km
    operatingHours: v.optional(v.any()), // JSON
    isOpen: v.union(v.literal("OPEN"), v.literal("CLOSED"), v.literal("TEMPORARILY_CLOSED")),
    socialMedia: v.optional(v.any()), // JSON
    aboutUs: v.optional(v.string()),
    termsAndConditions: v.optional(v.string()),
    privacyPolicy: v.optional(v.string()),
  }),

  whatsappSettings: defineTable({
    businessApiToken: v.optional(v.string()),
    businessPhoneNumberId: v.optional(v.string()),
    businessWhatsappNumber: v.string(),
    ownerManagerWhatsappNumber: v.string(),
    webhookVerifyToken: v.optional(v.string()),
    isActive: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
    messageTemplates: v.optional(v.any()), // JSON
    autoReplySettings: v.optional(v.any()), // JSON
  }),

  deliveryZones: defineTable({
    name: v.string(), // e.g., "Centre Ville", "Bastos"
    description: v.optional(v.string()),
    boundaries: v.optional(v.any()), // JSON for geographic boundaries
    deliveryFee: v.optional(v.number()),
    estimatedDeliveryTime: v.optional(v.number()), // in minutes
    isActive: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
  }),

  reviews: defineTable({
    userId: v.id("users"),
    mealId: v.optional(v.id("meals")),
    orderId: v.optional(v.id("orders")),
    rating: v.number(), // 1-5 stars
    title: v.optional(v.string()),
    comment: v.optional(v.string()),
    isApproved: v.union(v.literal("PENDING"), v.literal("APPROVED"), v.literal("REJECTED")),
    isVisible: v.union(v.literal("VISIBLE"), v.literal("HIDDEN")),
    adminResponse: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_meal", ["mealId"])
    .index("by_order", ["orderId"])
    .index("by_rating", ["rating"]),
});
