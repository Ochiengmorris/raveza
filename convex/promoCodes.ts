import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getEventPromoCodes = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const promoCodes = await ctx.db
      .query("promoCodes")
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .collect();

    for (const promoCode of promoCodes) {
      const redemptions = await ctx.db
        .query("promotionalCodeRedemptions")
        .filter((q) => q.eq(q.field("promoCodeId"), promoCode._id))
        .collect();

      promoCode.usedCount = redemptions.length;
    }

    return promoCodes;
  },
});

export const getByCodeAndEventId = query({
  args: {
    code: v.optional(v.id("promoCodes")),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    if (!args.code) {
      return null;
    }
    const promoCode = await ctx.db
      .query("promoCodes")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();
    return promoCode;
  },
});

export const createPromoCode = mutation({
  args: {
    eventId: v.id("events"),
    code: v.string(),
    discountPercentage: v.number(),
    maxDiscountAmount: v.optional(v.number()),
    startDate: v.number(),
    expiresAt: v.number(),
    isActive: v.boolean(),
    usageLimit: v.optional(v.number()),
    usedCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { eventId } = args;
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    const promoCode = await ctx.db
      .query("promoCodes")
      .filter((q) => q.eq(q.field("code"), args.code))
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .first();

    if (promoCode) {
      throw new ConvexError("Promo code already exists");
    }

    const now = Date.now();
    if (now > event.eventDate) {
      throw new ConvexError("This event has already passed");
    }

    if (args.expiresAt < args.startDate) {
      throw new ConvexError("Expiration date must be after start date");
    }
    const code = await ctx.db.insert("promoCodes", {
      ...args,
    });
    return code;
  },
});

export const updatePromoCode = mutation({
  args: {
    promoCodeId: v.id("promoCodes"),
    code: v.string(),
    discountPercentage: v.number(),
    maxDiscountAmount: v.optional(v.number()),
    startDate: v.number(),
    expiresAt: v.number(),
    isActive: v.boolean(),
    usageLimit: v.optional(v.number()),
    usedCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { promoCodeId, ...rest } = args;
    const promoCode = await ctx.db.get(promoCodeId);
    if (!promoCode) {
      throw new ConvexError("Promo code not found");
    }

    const event = await ctx.db.get(promoCode.eventId);
    if (!event) {
      throw new ConvexError("Event not found");
    }

    const now = Date.now();
    if (now > event.eventDate) {
      throw new ConvexError("This event has already passed");
    }

    if (args.expiresAt < args.startDate) {
      throw new ConvexError("Expiration date must be after start date");
    }
    // const {promoCodeId} = args;
    const code = await ctx.db.patch(promoCodeId, {
      ...rest,
    });
    return code;
  },
});

export const deletePromoCode = mutation({
  args: {
    promoCodeId: v.id("promoCodes"),
  },
  handler: async (ctx, args) => {
    const { promoCodeId } = args;
    const promoCode = await ctx.db.get(promoCodeId);
    if (!promoCode) {
      throw new ConvexError("Promo code not found");
    }
    await ctx.db.delete(promoCodeId);
  },
});
export const getPromoCodeRedemptions = query({
  args: {
    promoCodeId: v.id("promoCodes"),
  },
  handler: async (ctx, args) => {
    const { promoCodeId } = args;
    const promoCode = await ctx.db.get(promoCodeId);
    if (!promoCode) {
      throw new ConvexError("Promo code not found");
    }
    const redemptions = await ctx.db
      .query("promotionalCodeRedemptions")
      .filter((q) => q.eq(q.field("promoCodeId"), promoCodeId))
      .collect();
    return redemptions;
  },
});

export const createPromoCodeRedemption = mutation({
  args: {
    userId: v.optional(v.string()),
    promoCodeId: v.id("promoCodes"),
    eventId: v.id("events"),
    ticketId: v.optional(v.id("tickets")),
    redeemedAt: v.number(),
    dicountAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const { promoCodeId } = args;
    const promoCode = await ctx.db.get(promoCodeId);
    if (!promoCode) {
      throw new ConvexError("Promo code not found");
    }
    const redemption = await ctx.db.insert("promotionalCodeRedemptions", {
      ...args,
    });
    const redemptions = await ctx.db
      .query("promotionalCodeRedemptions")
      .filter((q) => q.eq(q.field("promoCodeId"), promoCodeId))
      .collect();

    if (promoCode.usageLimit) {
      if (redemptions.length >= promoCode.usageLimit) {
        await ctx.db.patch(promoCodeId, {
          isActive: false,
        });
      }
    }

    return redemption;
  },
});

export const checkAvailabilityPromo = query({
  args: {
    code: v.id("promoCodes"),
  },
  handler: async (ctx, args) => {
    const { code } = args;

    const promoCode = await ctx.db.get(code);
    if (!promoCode) {
      throw new ConvexError("Promo code not found");
    }
    if (!promoCode.isActive) {
      return false;
    }

    const redemptions = await ctx.db
      .query("promotionalCodeRedemptions")
      .filter((q) => q.eq(q.field("promoCodeId"), code))
      .collect();

    if (promoCode.usageLimit) {
      if (redemptions.length >= promoCode.usageLimit) {
        return false;
      }
    }
    return true;
  },
});
