"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import ReleaseTicket from "@/components/tickets/ReleaseTicket";
import TicketPurchaseDialog from "@/components/tickets/TicketPurchaseDialog";

const PurchaseTicket = ({
  eventId,
  ticketTypeId,
}: {
  eventId: Id<"events">;
  ticketTypeId: Id<"ticketTypes">;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUser();
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
    ticketTypeId,
  });

  const [timeRemaining, setTimeRemaining] = useState("");

  const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0;
  const isExpired = Date.now() > offerExpiresAt;

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (isExpired) {
        setTimeRemaining("Expired");
        return;
      }

      const diff = offerExpiresAt - Date.now();
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (minutes > 0) {
        setTimeRemaining(
          `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} second${
            seconds === 1 ? "" : "s"
          }`,
        );
      } else {
        setTimeRemaining(`${seconds} second${seconds === 1 ? "" : "s"}`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [offerExpiresAt, isExpired]);

  if (!user || !queuePosition || queuePosition.status !== "offered") {
    return null;
  }

  const handleRedirect = async () => {
    if (!user || !queuePosition) return;
    setIsModalOpen(true);
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200">
      <div className="">
        <div className="bg-white rounded-lg p-6 border mb-4  border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-100 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                  Ticket Reserved
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  Expires in {timeRemaining}
                </p>
              </div>
            </div>

            <div className="text-xs md:text-sm text-gray-600 leading-relaxed">
              A ticket has been reserved for you. Complete your purchase before
              the timer expires to secure your spot at this event.
            </div>
          </div>
        </div>

        <button
          onClick={handleRedirect}
          disabled={isExpired || isModalOpen}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-2 mb-1 md:py-4 rounded-lg font-bold shadow-md hover:from-amber-600 hover:to-amber-700 transform hover:scale-[1.02] transition-all text-xs md:text-sm sm:text-base duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isModalOpen ? "Purchasing.." : "Purchase Ticket Now →"}
        </button>

        <div className="">
          <ReleaseTicket eventId={eventId} waitingListId={queuePosition._id} />
        </div>
      </div>

      {/* Purchase modal */}
      <TicketPurchaseDialog
        open={isModalOpen}
        setIsOpen={setIsModalOpen}
        eventId={eventId}
        ticketTypeId={ticketTypeId}
      />
    </div>
  );
};

export default PurchaseTicket;
