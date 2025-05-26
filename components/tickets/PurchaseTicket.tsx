"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Ticket, Clock, AlertCircle } from "lucide-react";
import ReleaseTicket from "@/components/tickets/ReleaseTicket";
import TicketPurchaseDialog from "@/components/tickets/TicketPurchaseDialog";
import { useCurrentUser } from "../providers/GuestProvider";

interface PurchaseTicketProps {
  eventId: Id<"events">;
  ticketTypeId: Id<"ticketTypes">;
}

const PurchaseTicket: React.FC<PurchaseTicketProps> = ({
  eventId,
  ticketTypeId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUser();
  const { guestInfo } = useCurrentUser();

  // Get the current user ID (either authenticated or guest)
  const currentUserId = user?.id ?? guestInfo?.id;

  const queuePosition = useQuery(
    api.waitingList.getQueuePosition,
    currentUserId ? { eventId, userId: currentUserId, ticketTypeId } : "skip",
  );

  const [timeRemaining, setTimeRemaining] = useState("");

  // Memoized values for better performance
  const ticketState = useMemo(() => {
    if (!queuePosition) return null;

    const offerExpiresAt = queuePosition.offerExpiresAt ?? 0;
    const isExpired = Date.now() > offerExpiresAt;
    const isOffered = queuePosition.status === "offered";
    const hasValidOffer = isOffered && !isExpired;

    return {
      offerExpiresAt,
      isExpired,
      isOffered,
      hasValidOffer,
      queuePosition,
    };
  }, [queuePosition]);

  // Time calculation function
  const calculateTimeRemaining = useCallback(() => {
    if (!ticketState?.offerExpiresAt) return;

    if (ticketState.isExpired) {
      setTimeRemaining("Expired");
      return;
    }

    const diff = ticketState.offerExpiresAt - Date.now();
    const minutes = Math.floor(diff / 1000 / 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (diff <= 0) {
      setTimeRemaining("Expired");
      return;
    }

    if (minutes > 0) {
      setTimeRemaining(
        `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} second${
          seconds === 1 ? "" : "s"
        }`,
      );
    } else {
      setTimeRemaining(`${seconds} second${seconds === 1 ? "" : "s"}`);
    }
  }, [ticketState?.offerExpiresAt, ticketState?.isExpired]);

  // Timer effect
  useEffect(() => {
    if (!ticketState?.hasValidOffer) return;

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeRemaining, ticketState?.hasValidOffer]);

  // Handle purchase button click
  const handlePurchaseClick = useCallback(async () => {
    if (!currentUserId || !ticketState?.hasValidOffer) return;
    setIsModalOpen(true);
  }, [currentUserId, ticketState?.hasValidOffer]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Early returns for various states
  if (!currentUserId) {
    return null; // No user available
  }

  if (queuePosition === undefined) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!ticketState?.isOffered) {
    return null; // No offer available
  }

  // Render expired state
  if (ticketState.isExpired) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-red-900">
                Ticket Offer Expired
              </h3>
              <p className="text-xs md:text-sm text-red-600">
                Your reservation has expired
              </p>
            </div>
          </div>
          <div className="text-xs md:text-sm text-red-700 leading-relaxed mt-4">
            Unfortunately, your ticket reservation has expired. You may need to
            rejoin the queue if tickets are still available.
          </div>
        </div>
      </div>
    );
  }

  // Render active ticket offer
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200">
      <div className="bg-white rounded-lg p-6 border mb-4 border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-amber-100 flex items-center justify-center">
              <Ticket className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                Ticket Reserved
              </h3>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <p className="text-xs md:text-sm text-amber-600 font-medium">
                  Expires in {timeRemaining}
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs md:text-sm text-gray-600 leading-relaxed">
            A ticket has been reserved for you. Complete your purchase before
            the timer expires to secure your spot at this event.
          </div>
        </div>
      </div>

      <button
        onClick={handlePurchaseClick}
        disabled={ticketState.isExpired || isModalOpen}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-2 md:py-4 rounded-lg font-bold shadow-md hover:from-amber-600 hover:to-amber-700 transform transition-all text-xs md:text-sm sm:text-base duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        aria-label="Purchase reserved ticket"
      >
        {isModalOpen ? "Processing..." : "Purchase Ticket Now →"}
      </button>

      <ReleaseTicket
        eventId={eventId}
        waitingListId={ticketState.queuePosition._id}
      />

      {/* Purchase modal */}
      <TicketPurchaseDialog
        open={isModalOpen}
        setIsOpen={handleModalClose}
        eventId={eventId}
        ticketTypeId={ticketTypeId}
      />
    </div>
  );
};

export default PurchaseTicket;
