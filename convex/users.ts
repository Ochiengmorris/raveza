import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUsersStripeConnectId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.neq(q.field("stripeConnectId"), undefined))
      .first();
    return user?.stripeConnectId;
  },
});

export const updateOrCreateUserStripeConnectId = mutation({
  args: { userId: v.string(), stripeConnectId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { stripeConnectId: args.stripeConnectId });
  },
});

export const updateUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, name, email }) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name,
        email,
      });
      return existingUser._id;
    }

    // Create new user
    const newUserId = await ctx.db.insert("users", {
      userId,
      name,
      email,
      stripeConnectId: undefined,
    });

    return newUserId;
  },
});

export const updateSeller = mutation({
  args: { userId: v.string(), isSeller: v.boolean() },
  handler: async (ctx, { userId, isSeller }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { isSeller });
  },
});

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    return user;
  },
});

//mutation to update user balance by userId and eventId
export const updateUserBalance = mutation({
  args: { eventId: v.id("events"), amount: v.number() },
  handler: async (ctx, { eventId, amount }) => {
    const event = await ctx.db.get(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", event.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      balance: user.balance ?? 0 + amount, // TODO: update this part of the code to add the actual amount.
    });
  },
});

// Guest user creation
export const createGuestUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate unique guest token and ID
    const guestToken = crypto.randomUUID();
    const guestUserId = `guest_${crypto.randomUUID()}`;

    // Check if guest user with this email already exists
    const existingGuest = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("guestEmail"), args.email),
          q.eq(q.field("isGuest"), true),
        ),
      )
      .first();

    if (existingGuest) {
      return {
        guestToken: existingGuest.guestSessionId!,
        guestUserId: existingGuest.userId,
      };
    }

    // Create new guest user
    await ctx.db.insert("users", {
      name: args.name,
      email: args.email, // Keep this for consistency
      userId: guestUserId,
      isGuest: true,
      guestSessionId: guestToken,
      guestCreatedAt: Date.now(),
      guestEmail: args.email,
      guestName: args.name,
    });

    return { guestToken, guestUserId };
  },
});

// Get guest user by token
export const getGuestUser = query({
  args: { guestToken: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_guest_session_id", (q) =>
        q.eq("guestSessionId", args.guestToken),
      )
      .first();

    return user;
  },
});

// Convert guest to regular user (when they sign up with Clerk)
export const convertGuestToUser = mutation({
  args: {
    guestToken: v.string(),
    authUserId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    const guestUser = await ctx.db
      .query("users")
      .withIndex("by_guest_session_id", (q) =>
        q.eq("guestSessionId", args.guestToken),
      )
      .first();

    if (!guestUser) {
      throw new Error("Guest user not found");
    }

    // Check if user with this Clerk ID already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.authUserId))
      .first();

    if (existingUser) {
      // User already exists, transfer guest data to existing user
      // This could involve merging tickets, etc.
      await ctx.db.delete(guestUser._id);
      return existingUser;
    }

    // Update guest user to regular user
    await ctx.db.patch(guestUser._id, {
      userId: args.authUserId,
      isGuest: false,
      guestSessionId: undefined,
    });

    return { ...guestUser, userId: args.authUserId, isGuest: false };
  },
});
