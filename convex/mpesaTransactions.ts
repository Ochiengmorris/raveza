import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    checkoutRequestId: v.string(),
    metadata: v.string(),
    amount: v.number(),
    expiresAt: v.string(),
    promoCodeId: v.optional(v.id("promoCodes")),
  },
  handler: async (ctx, args) => {
    const { checkoutRequestId, metadata, amount, expiresAt, promoCodeId } =
      args;

    const id = await ctx.db.insert("mpesaTransactions", {
      checkoutRequestId,
      metadata,
      amount,
      expiresAt,
      promoCodeId,
      status: "pending",
    });

    return id;
  },
});

export const updateStatus = mutation({
  args: {
    checkoutRequestId: v.string(),
    status: v.union(v.literal("completed"), v.literal("failed")),
    resultCode: v.number(),
    resultDesc: v.string(),
    mpesaReceiptNumber: v.optional(v.string()),
    transactionDate: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const {
      checkoutRequestId,
      status,
      resultCode,
      resultDesc,
      mpesaReceiptNumber,
      transactionDate,
      phoneNumber,
    } = args;

    const transaction = await ctx.db
      .query("mpesaTransactions")
      .withIndex("by_checkoutRequestId", (q) =>
        q.eq("checkoutRequestId", checkoutRequestId),
      )
      .first();

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    await ctx.db.patch(transaction._id, {
      status,
      resultCode,
      resultDesc,
      mpesaReceiptNumber,
      transactionDate,
      phoneNumber,
    });

    return transaction._id;
  },
});

export const getByCheckoutRequestId = query({
  args: { checkoutRequestId: v.string() },
  handler: async (ctx, args) => {
    const { checkoutRequestId } = args;

    const transaction = await ctx.db
      .query("mpesaTransactions")
      .withIndex("by_checkoutRequestId", (q) =>
        q.eq("checkoutRequestId", checkoutRequestId),
      )
      .first();

    return transaction;
  },
});
