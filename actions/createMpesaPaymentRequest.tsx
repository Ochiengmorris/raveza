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

export type CreateMpesaPaymentResult = {
  status: "ok" | "error";
  data?: {
    checkoutRequestId: string;
    responseCode: string;
  };
  error?: string;
};

export async function createMpesaPaymentRequest({
  eventId,
  phoneNumber,
  ticketTypeId,
  guestUserId,
}: {
  eventId: Id<"events">;
  phoneNumber: string;
  ticketTypeId: Id<"ticketTypes">;
  guestUserId?: string;
}): Promise<CreateMpesaPaymentResult> {
  if (!eventId || !phoneNumber || !ticketTypeId) {
    return { status: "error", error: "Missing required parameters" };
  }

  try {
    // Authentication check
    const { userId } = await auth();
    const effectiveId = userId ?? guestUserId;
    if (!effectiveId) {
      return { status: "error", error: "Authentication required" };
    }

    const convex = getConvexClient();

    // Validate event exists
    const event = await convex.query(api.events.getById, { eventId });
    if (!event) {
      return { status: "error", error: "Event not found" };
    }

    // Validate ticket type and price
    const ticketTypeDetails = await convex.query(api.tickets.getTicketType, {
      ticketTypeId: ticketTypeId,
    });

    if (
      !ticketTypeDetails?.ticketType?.price ||
      ticketTypeDetails.ticketType.price <= 0
    ) {
      return { status: "error", error: "Invalid ticket type or price" };
    }

    // Check queue position and offer validity
    const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
      eventId,
      userId: effectiveId,
      ticketTypeId,
    });

    if (!queuePosition) {
      return { status: "error", error: "No queue position found" };
    }

    if (queuePosition.status !== "offered") {
      return { status: "error", error: "No valid ticket offer available" };
    }

    if (!queuePosition.offerExpiresAt) {
      return { status: "error", error: "Ticket offer has no expiration date" };
    }

    // Check if offer has expired
    const now = new Date();
    const expirationDate = new Date(queuePosition.offerExpiresAt);
    if (now > expirationDate) {
      return { status: "error", error: "Ticket offer has expired" };
    }

    // Validate ticket count
    if (!queuePosition.count || queuePosition.count <= 0) {
      return { status: "error", error: "Invalid ticket count" };
    }

    // Calculate final amount
    const basePrice = ticketTypeDetails.ticketType.price * queuePosition.count;
    const discount = queuePosition.promoCodeDiscount || 0;
    const calculatedAmount = basePrice * (1 - discount / 100);

    // Round to nearest whole number (M-Pesa doesn't accept decimals i think)
    const finalAmount = Math.round(calculatedAmount);

    // Prepare metadata
    const metadata: MpesaCallbackMetaData = {
      eventId,
      userId: effectiveId,
      waitingListId: queuePosition._id,
    };

    // Initiate Mpesa STK Push
    const stkPushResponse = await sendStkPush(phoneNumber, finalAmount);

    if (!stkPushResponse?.CheckoutRequestID) {
      return { status: "error", error: "Failed to initiate Mpesa payment" };
    }

    // Store transaction details
    await convex.mutation(api.mpesaTransactions.create, {
      checkoutRequestId: stkPushResponse.CheckoutRequestID,
      metadata: JSON.stringify(metadata),
      amount: finalAmount,
      expiresAt: new Date(Date.now() + DURATIONS.TICKET_OFFER).toISOString(),
      promoCodeId: queuePosition.promoCodeId || undefined,
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

    // Return user-friendly error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while processing payment";

    return { status: "error", error: errorMessage };
  }
}
