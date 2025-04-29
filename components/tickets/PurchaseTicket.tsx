"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";

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

  console.log(isModalOpen, timeRemaining);

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
    <div>
      <Button onClick={handleRedirect}>Purchase</Button>
    </div>
  );
};

export default PurchaseTicket;
