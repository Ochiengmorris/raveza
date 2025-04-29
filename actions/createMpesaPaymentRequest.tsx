"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DURATIONS } from "@/convex/constants";
import { getConvexClient } from "@/lib/convex";
import { sendStkPush } from "@/lib/mpesa";
import { auth } from "@clerk/nextjs/server";

export type MpesaCallbackMetaData = {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
};

export async function createMpesaPaymentRequest({
  eventId,
  phoneNumber,
  ticketTypeId,
}: {
  eventId: Id<"events">;
  phoneNumber: string;
  ticketTypeId: Id<"ticketTypes">;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const convex = getConvexClient();

  // Get event details
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) throw new Error("Event not found");

  // Get tickettype details
  const ticketTypeDetails = await convex.query(api.tickets.getTicketType, {
    ticketTypeId: ticketTypeId,
  });

  if (!ticketTypeDetails?.ticketType?.price) {
    throw new Error("Invalid ticket type or price");
  }

  // Get waiting list entry
  const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
    eventId,
    userId,
    ticketTypeId,
  });

  if (!queuePosition || queuePosition.status !== "offered") {
    throw new Error("No valid ticket offer found");
  }

  if (!queuePosition.offerExpiresAt) {
    throw new Error("Ticket offer has no expiration date");
  }

  const metadata: MpesaCallbackMetaData = {
    eventId,
    userId,
    waitingListId: queuePosition._id,
  };

  const amount = queuePosition.count * ticketTypeDetails?.ticketType?.price;

  // Create Mpesa STK Push request
  try {
    const stkPushResponse = await sendStkPush(phoneNumber, amount);

    if (!stkPushResponse || !stkPushResponse.CheckoutRequestID) {
      throw new Error("Failed to initiate Mpesa payment");
    }

    // Store the metadata and CheckoutRequestID in your database
    await convex.mutation(api.mpesaTransactions.create, {
      checkoutRequestId: stkPushResponse.CheckoutRequestID,
      metadata: JSON.stringify(metadata),
      amount: amount,
      expiresAt: new Date(Date.now() + DURATIONS.TICKET_OFFER).toISOString(),
    });

    return {
      status: "ok",
      data: {
        checkoutRequestId: stkPushResponse.CheckoutRequestID,
        responseCode: stkPushResponse.ResponseCode,
      },
    };
  } catch (error) {
    console.error("Error initiating Mpesa payment:", error);
    throw new Error("Failed to initiate Mpesa payment");
  }
}
