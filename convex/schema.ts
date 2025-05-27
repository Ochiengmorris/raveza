import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    category: v.optional(v.string()),
    description: v.string(),
    location: v.string(),
    eventDate: v.number(),
    startTime: v.optional(v.string()),
    totalTickets: v.optional(v.number()),
    userId: v.string(),
    organizerName: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    is_cancelled: v.optional(v.boolean()),
    ticketTypes: v.optional(v.array(v.id("ticketTypes"))),
  })
    .index("by_user_id", ["userId"])
    .index("by_date", ["eventDate"]),

  // Promotional codes for discounts
  promoCodes: defineTable({
    code: v.string(),
    discountPercentage: v.number(), // Discount percentage (0-100)
    maxDiscountAmount: v.optional(v.number()),
    startDate: v.number(),
    expiresAt: v.number(),
    isActive: v.boolean(),
    eventId: v.id("events"),
    usageLimit: v.optional(v.number()),
    usedCount: v.optional(v.number()),
  })
    .index("by_event", ["eventId"])
    .index("by_eventId_code", ["eventId", "code"]),

  promotionalCodeRedemptions: defineTable({
    userId: v.optional(v.string()),
    promoCodeId: v.id("promoCodes"),
    eventId: v.id("events"),
    ticketId: v.optional(v.id("tickets")),
    redeemedAt: v.number(),
    dicountAmount: v.number(), // Amount redeemed
  })
    .index("by_user", ["userId"])
    .index("by_promo_code", ["promoCodeId"])
    .index("by_event", ["eventId"]),

  ticketTypes: defineTable({
    eventId: v.id("events"),
    name: v.string(), // VIP, Normal etc
    price: v.number(),
    totalTickets: v.number(),
  }).index("by_event", ["eventId"]),

  tickets: defineTable({
    eventId: v.id("events"),
    userId: v.string(),
    purchasedAt: v.number(),
    ticketTypeId: v.id("ticketTypes"),
    count: v.number(),
    promoCodeId: v.optional(v.id("promoCodes")),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled"),
    ),
    paymentIntentId: v.optional(v.string()),
    amount: v.optional(v.number()),
  })
    .index("by_event", ["eventId"])
    .index("by_event_ticket_id", ["eventId", "ticketTypeId"])
    .index("by_event_status", ["eventId", "status"])
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_payment_intent", ["paymentIntentId"]),

  waitingList: defineTable({
    eventId: v.id("events"),
    ticketTypeId: v.id("ticketTypes"),
    count: v.number(),
    userId: v.string(),
    promoCodeId: v.optional(v.id("promoCodes")),
    promoCodeDiscount: v.optional(v.number()),
    status: v.union(
      v.literal("waiting"),
      v.literal("offered"),
      v.literal("purchased"),
      v.literal("expired"),
    ),
    offerExpiresAt: v.optional(v.number()),
  })
    .index("by_event_status", ["eventId", "status"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_user_event_ticket_type", ["userId", "eventId", "ticketTypeId"])
    .index("by_event_ticket_type_status", ["eventId", "ticketTypeId", "status"])
    .index("by_user", ["userId"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    userId: v.string(),
    organizerName: v.optional(v.string()),
    stripeConnectId: v.optional(v.string()),
    isSeller: v.optional(v.boolean()),
    balance: v.optional(v.number()),
    // Additional fileds for Guest users
    isGuest: v.optional(v.boolean()),
    guestSessionId: v.optional(v.string()),
    guestEmail: v.optional(v.string()),
    guestName: v.optional(v.string()),
    guestPhoneNumber: v.optional(v.string()),
    guestCreatedAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_guest_session_id", ["guestSessionId"])
    .index("by_email", ["email"]),

  mpesaTransactions: defineTable({
    checkoutRequestId: v.string(),
    ticketId: v.optional(v.id("tickets")),
    metadata: v.string(), // JSON string of MpesaCallbackMetaData
    amount: v.number(),
    expiresAt: v.string(), // ISO date string
    promoCodeId: v.optional(v.id("promoCodes")),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    resultCode: v.optional(v.number()),
    resultDesc: v.optional(v.string()),
    mpesaReceiptNumber: v.optional(v.string()),
    transactionDate: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  }).index("by_checkoutRequestId", ["checkoutRequestId"]),

  withdrawals: defineTable({
    userId: v.string(),
    amount: v.number(),
    requestedAt: v.number(), // Timestamp of when the withdrawal was requested
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    transactionId: v.optional(v.string()), // External payment system transaction ID
    method: v.union(
      v.literal("mpesa"),
      v.literal("stripe"),
      v.literal("bank_transfer"),
    ), // Withdrawal method
    processedAt: v.optional(v.number()), // Timestamp of when the withdrawal was processed
    metadata: v.optional(v.string()), // JSON string for any additional metadata
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_transaction_id", ["transactionId"]),
});
