"use client";

import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Clock, OctagonXIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { WAITING_LIST_STATUS } from "@/convex/constants";

export default function JoinQueue({
  eventId,
  userId,
  ticketTypeId,
  selectedCount,
}: {
  eventId: Id<"events">;
  userId: string;
  ticketTypeId: Id<"ticketTypes">;
  selectedCount: number;
}) {
  const joinWaitingList = useMutation(api.events.joinWaitingList);

  // Prevent queries from running if ticketTypeId is invalid
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId,
    ticketTypeId,
  });
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId,
  });
  const availability = useQuery(api.events.getEventAvailability, {
    eventId,
    ticketTypeId,
  });
  const event = useQuery(api.events.getById, { eventId });

  if (!ticketTypeId || !event) return null;

  const isEventOwner = userId === event?.userId;
  const handleJoinQueue = async () => {
    try {
      const result = await joinWaitingList({
        eventId,
        userId,
        ticketTypeId,
        selectedCount,
      });
      if (result.success) {
        console.log("Successfully joined waiting list");
        toast(result.message, {
          duration: 5000,
        });
      } else {
        toast("Uh! Oh! Sorry!", {
          description: result.message,
          duration: 5000,
        });
      }
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.message.includes("joined the waiting list too many times")
      ) {
        toast("Slow down there!", {
          description: error.data,
          duration: 5000,
        });
      } else {
        console.error("Error joining waiting list:", error);
        toast("Uh oh! Something went wrong.", {
          description: "Failed to join queue. Please try again later.",
        });
      }
    }
  };

  if (queuePosition === undefined || availability === undefined || !event) {
    return <Skeleton className="w-full h-12 " />;
  }

  if (userTicket) {
    return null;
  }

  const isPastEvent = event.eventDate < Date.now();
  return (
    <div>
      {(!queuePosition ||
        queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
        (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
          queuePosition.offerExpiresAt &&
          queuePosition.offerExpiresAt <= Date.now())) && (
        <>
          {isEventOwner ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
              <OctagonXIcon className="w-5 h-5" />
              <span>You cannot buy a ticket for your own event</span>
            </div>
          ) : isPastEvent ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
              <Clock className="w-5 h-5" />
              <span>Event has ended</span>
            </div>
          ) : availability.purchasedCount >= availability?.totalTickets ? (
            <div className="text-center p-3">
              <p className="text-md font-semibold text-red-600">
                Sorry, this ticket type is sold out
              </p>
            </div>
          ) : (
            <button
              onClick={handleJoinQueue}
              className="w-full px-6 py-3 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Buy Ticket
            </button>
          )}
        </>
      )}
    </div>
  );
}
