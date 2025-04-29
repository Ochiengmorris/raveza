import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllUserTickets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    // Get event IDs from the fetched events
    const eventIds = events.map((event) => event._id);

    // If no events found, return empty array
    if (eventIds.length === 0) {
      return [];
    }

    // Fetch tickets for all events
    const tickets = await ctx.db
      .query("tickets")
      .filter((q) =>
        q.or(...eventIds.map((eventId) => q.eq(q.field("eventId"), eventId))),
      )
      .collect();

    // Map tickets to include event details
    const ticketsWithEvents = tickets.map((ticket) => {
      const event = events.find((event) => event._id === ticket.eventId);
      return {
        ...ticket,
        event: {
          name: event?.name,
          location: event?.location,
          eventDate: event?.eventDate,
          startTime: event?.startTime,
        },
      };
    });

    // Map ticketwith events to include ticket type details
    const ticketsWithTicketTypes = await Promise.all(
      ticketsWithEvents.map(async (ticket) => {
        const ticketType = await ctx.db.get(ticket.ticketTypeId);
        return {
          ...ticket,
          ticketType: {
            name: ticketType?.name,
            price: ticketType?.price,
          },
        };
      }),
    );

    //Map ticketsdetails with user's details
    const ticketsWithTicketTypesAndUser = await Promise.all(
      ticketsWithTicketTypes.map(async (ticket) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("userId", ticket.userId))
          .first();
        return {
          ...ticket,
          user: {
            name: user?.name,
            email: user?.email,
          },
        };
      }),
    );

    return ticketsWithTicketTypesAndUser;
  },
});

export const getUserTicketForEvent = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId),
      )
      .first();

    return ticket;
  },
});

export const getTicketTypes = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    const ticketTypes = await ctx.db
      .query("ticketTypes")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
    return ticketTypes;
  },
});

export const getTicketType = query({
  args: { ticketTypeId: v.id("ticketTypes") },
  handler: async (ctx, { ticketTypeId }) => {
    const ticketType = await ctx.db.get(ticketTypeId);
    if (!ticketType) return null;

    return {
      ticketType,
    };
  },
});

export const getTicketWithDetails = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) return null;

    const event = await ctx.db.get(ticket.eventId);
    const ticketType = await ctx.db.get(ticket.ticketTypeId);
    const eventOwner = event?.userId
      ? await ctx.db
          .query("users")
          .withIndex("by_user_id", (q) => q.eq("userId", event.userId))
          .first()
      : null;

    return {
      ...ticket,
      ticketType,
      event,
      eventOwner,
    };
  },
});

export const calculateTotalEarnings = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const userEvents = await ctx.db
      .query("events")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    let totalAmount = 0;
    if (userEvents.length === 0) return totalAmount;
    const eventIds = userEvents.map((event) => event._id);

    for (const eventId of eventIds) {
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_event_status", (q) =>
          q.eq("eventId", eventId).eq("status", "valid"),
        )
        .collect();

      // Add ticket amounts to the total
      totalAmount += tickets.reduce((sum, ticket) => {
        return sum + (ticket.amount || 0);
      }, 0);
    }

    // Debug logs for verification
    // console.log("User events:", userEvents);
    // console.log("Total Amount:", totalAmount);

    return totalAmount;
  },
});

export const getValidTicketsForEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "valid"), q.eq(q.field("status"), "used")),
      )
      .collect();
  },
});

export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.union(
      v.literal("valid"),
      v.literal("used"),
      v.literal("refunded"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, { ticketId, status }) => {
    await ctx.db.patch(ticketId, { status });
  },
});
