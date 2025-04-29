import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constants";
import { internal } from "./_generated/api";

/**
 * Helper function to group waiting list entries by event ID.
 * Used for batch processing expired offers by event.
 */
function groupByEventAndTicketType(
  offers: Array<{
    eventId: Id<"events">;
    ticketTypeId: Id<"ticketTypes">;
    _id: Id<"waitingList">;
  }>,
) {
  return offers.reduce(
    (acc, offer) => {
      const key = `${offer.eventId}-${offer.ticketTypeId}`; // Unique key per event & ticket type

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(offer);
      return acc;
    },
    {} as Record<string, typeof offers>,
  );
}

/**
 * Query to get a user's current position in the waiting list for an event.
 * Returns null if user is not in queue, otherwise returns their entry with position.
 */
export const getQueuePosition = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    ticketTypeId: v.optional(v.id("ticketTypes")),
  },
  handler: async (ctx, { eventId, userId, ticketTypeId }) => {
    // Get entry for this specific user and event combination
    const entry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event_ticket_type", (q) =>
        q.eq("userId", userId).eq("eventId", eventId),
      )
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED),
          ticketTypeId !== undefined
            ? q.eq(q.field("ticketTypeId"), ticketTypeId)
            : q.eq(1, 1),
        ),
      )
      .first();

    if (!entry) return null;

    // Get total number of people ahead in line
    const peopleAhead = await ctx.db
      .query("waitingList")
      .withIndex("by_event_ticket_type_status", (q) =>
        ticketTypeId === undefined
          ? q.eq("eventId", eventId)
          : q.eq("eventId", eventId).eq("ticketTypeId", ticketTypeId),
      )
      .filter((q) =>
        q.and(
          q.lt(q.field("_creationTime"), entry._creationTime),
          q.or(
            q.eq(q.field("status"), WAITING_LIST_STATUS.WAITING),
            q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED),
          ),
        ),
      )
      .collect()
      .then((entries) => entries.length);

    return {
      ...entry,
      position: peopleAhead + 1,
    };
  },
});

export const getQueuePositions = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const entry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId),
      )
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED),
          q.neq(q.field("status"), WAITING_LIST_STATUS.PURCHASED),
        ),
      )
      .first();

    if (!entry) return null;

    // Get total number of people ahead in line
    const peopleAhead = await ctx.db
      .query("waitingList")
      .withIndex("by_event_ticket_type_status", (q) =>
        q.eq("eventId", eventId).eq("ticketTypeId", entry.ticketTypeId),
      )
      .filter((q) =>
        q.and(
          q.lt(q.field("_creationTime"), entry._creationTime),
          q.or(
            q.eq(q.field("status"), WAITING_LIST_STATUS.WAITING),
            q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED),
          ),
        ),
      )
      .collect()
      .then((entries) => entries.length);

    return {
      ...entry,
      position: peopleAhead + 1,
    };
  },
});

/**
 * Query to check a user has been offered a position in the waiting list for an event.
 */
export const hasBeenOffered = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const entry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event_ticket_type", (q) =>
        q.eq("userId", userId).eq("eventId", eventId),
      )
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED),
          q.eq(q.field("status"), WAITING_LIST_STATUS.WAITING),
        ),
      )

      .collect();
    return entry.length > 0;
  },
});

/**
 * Internal mutation to expire a single offer and process queue for next person.
 * Called by scheduled job when offer timer expires.
 */
export const expireOffer = internalMutation({
  args: {
    waitingListId: v.id("waitingList"),
    eventId: v.id("events"),
  },
  handler: async (ctx, { waitingListId, eventId }) => {
    const offer = await ctx.db.get(waitingListId);
    if (!offer || offer.status !== WAITING_LIST_STATUS.OFFERED) return;

    await ctx.db.patch(waitingListId, {
      status: WAITING_LIST_STATUS.EXPIRED,
    });

    //processQueue
    await ctx.runMutation(internal.waitingList.processQueue, {
      eventId,
      ticketTypeId: offer.ticketTypeId,
    });
  },
});

/**
 * Mutation to process the waiting list queue and offer tickets to next eligible users.
 * Checks current availability considering purchased tickets and active offers.
 */
export const processQueue = internalMutation({
  args: {
    eventId: v.id("events"),
    ticketTypeId: v.id("ticketTypes"),
  },
  handler: async (ctx, { eventId, ticketTypeId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    const ticketType = await ctx.db.get(ticketTypeId);
    if (!ticketType) throw new Error("Ticket type not found");

    // Count total purchased tickets
    const purchasedOffers = await ctx.db
      .query("tickets")
      .withIndex("by_event_ticket_id", (q) =>
        q.eq("eventId", eventId).eq("ticketTypeId", ticketTypeId),
      )
      .collect()
      .then((tickets) =>
        tickets.filter(
          (t) =>
            t.status === TICKET_STATUS.VALID || t.status === TICKET_STATUS.USED,
        ),
      );

    const purchasedCount = purchasedOffers.reduce(
      (acc, offer) => acc + (offer.count || 0), // Ensure count is added correctly
      0, // Start from 0
    );

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_ticket_type_status", (q) =>
        q
          .eq("eventId", eventId)
          .eq("ticketTypeId", ticketTypeId)
          .eq("status", WAITING_LIST_STATUS.OFFERED),
      )
      .collect()
      .then((entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now));

    const activeOffersLength = activeOffers.reduce(
      (acc, cur) => acc + cur.count,
      0,
    );

    const totalReserved = purchasedCount + activeOffersLength;

    const remainingTickets =
      purchasedCount === ticketType.totalTickets
        ? 0
        : ticketType.totalTickets - totalReserved;

    const waitingUsers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_ticket_type_status", (q) =>
        q
          .eq("eventId", eventId)
          .eq("ticketTypeId", ticketTypeId)
          .eq("status", WAITING_LIST_STATUS.WAITING),
      )
      .order("asc")
      .collect();

    if (remainingTickets <= 0) {
      // 🔴 No tickets left — expire everyone
      for (const user of waitingUsers) {
        await ctx.db.patch(user._id, {
          status: WAITING_LIST_STATUS.EXPIRED,
          offerExpiresAt: now,
        });
      }
      return;
    }

    // Create time-limited offers for selected users
    for (const user of waitingUsers) {
      // Update the waiting list entry to OFFERED status
      await ctx.db.patch(user._id, {
        status: WAITING_LIST_STATUS.OFFERED,
        offerExpiresAt: now + DURATIONS.TICKET_OFFER,
      });

      // Schedule expiration job for this offer
      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer,
        {
          waitingListId: user._id,
          eventId,
        },
      );
    }
  },
});

export const releaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    waitingListId: v.id("waitingList"),
  },
  handler: async (ctx, { eventId, waitingListId }) => {
    const entry = await ctx.db.get(waitingListId);
    if (!entry || entry.status !== WAITING_LIST_STATUS.OFFERED) {
      throw new Error("No valid ticket offer found");
    }

    // Mark the entry as expired
    await ctx.db.patch(waitingListId, {
      status: WAITING_LIST_STATUS.EXPIRED,
    });

    //Process queue to offer ticket to next person
    await ctx.runMutation(internal.waitingList.processQueue, {
      eventId,
      ticketTypeId: entry.ticketTypeId,
    });
    // Notify the user about the expiration TODO: add notification
  },
});

/**
 * Periodic cleanup job that acts as a fail-safe for expired offers.
 * While individual offers should expire via scheduled jobs (expireOffer),
 * this ensures any offers that weren't properly expired (e.g. due to server issues)
 * are caught and cleaned up. Also helps maintain data consistency.
 *
 * Groups expired offers by event for efficient processing and updates queue
 * for each affected event after cleanup.
 */
export const cleanupExpiredOffers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    // Find all expired but not yet cleaned up offers
    const expiredOffers = await ctx.db
      .query("waitingList")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED),
          q.lt(q.field("offerExpiresAt"), now),
        ),
      )
      .collect();

    // Group by event & ticket type for batch processing
    const grouped = groupByEventAndTicketType(expiredOffers);

    // Process each event's expired offers and update queue
    for (const [key, offers] of Object.entries(grouped)) {
      const [eventId, ticketTypeId] = key.split("-") as [
        Id<"events">,
        Id<"ticketTypes">,
      ];

      // Expire all offers in the group
      await Promise.all(
        offers.map((offer) =>
          ctx.db.patch(offer._id, {
            status: WAITING_LIST_STATUS.EXPIRED,
          }),
        ),
      );

      // Process the queue for this event & ticket type
      await ctx.runMutation(internal.waitingList.processQueue, {
        eventId: eventId as Id<"events">,
        ticketTypeId: ticketTypeId as Id<"ticketTypes">,
      });
    }
  },
});
