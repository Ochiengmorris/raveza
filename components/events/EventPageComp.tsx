"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn, FormatMoney, useStorageUrl } from "@/lib/utils";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import Spinner from "../loaders/Spinner";
import { ticketTypeWithId } from "@/app/(home)/events/[id]/page";
import { Button } from "../ui/button";
import { Heart, Minus, Plus, Share2, Ticket } from "lucide-react";
import JoinQueue from "../tickets/JoinQueue";
import EventCard from "./EventCard";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { toast } from "sonner";

type Event = {
  _id: Id<"events">;
  name: string;
  category?: string;
  location: string;
  userId: string;
  imageStorageId?: Id<"_storage">;
  startTime?: string;
  description: string;
  eventDate: number;
};

export type PromoCode = {
  code: string;
  discountPercent: number;
};

const EventPageComp = ({
  event,
  eventId,
}: {
  event: Event;
  eventId: Id<"events">;
}) => {
  const { user } = useUser();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<{ [key: string]: number }>(
    {},
  );
  // const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(
  //   null,
  // );
  const [isFavorite, setIsFavorite] = useState(false);

  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId: event._id,
    userId: user?.id ?? "",
  });

  const allAvailability = useQuery(api.events.getAllAvailabilityForEvent, {
    eventId: event._id,
  });

  const availabilityForSelected = allAvailability?.find(
    (a) => a.ticketType._id === selectedTicket,
  )?.remainingTickets;

  const hasBeenOffered = useQuery(api.waitingList.hasBeenOffered, {
    eventId: event._id,
    userId: user?.id ?? "",
  });
  const ticketTypesQuery = useQuery(api.tickets.getTicketTypes, {
    eventId: event._id,
  });

  // TODO: modify the check for availability of a ticket type to only check if its available on the waiting list... if not then the availability will be zero instead of only one. one should be allowed only when the last buyer is still in the waitiling list with a offered ticket type

  const imageUrl = useStorageUrl(event?.imageStorageId);

  const isEventPast = event?.eventDate ? event.eventDate < Date.now() : false;

  if (!event || !allAvailability) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  const isEventOwner = user?.id === event?.userId;

  const handleTicketChange = (
    ticketType: ticketTypeWithId["_id"],
    change: number,
  ) => {
    setSelectedCount((prev) => {
      const newCount = (prev[ticketType] || 0) + change;

      // Prevent negative count
      if (newCount < 0) return prev;

      // Check if we're trying to add more tickets than available
      if (
        change > 0 &&
        availabilityForSelected !== undefined &&
        newCount > availabilityForSelected
      ) {
        return prev;
      }

      const updatedCounts = { ...prev };
      if (newCount === 0) {
        delete updatedCounts[ticketType]; // Remove from count if 0
      } else {
        updatedCounts[ticketType] = newCount;
      }

      // If any ticket type is selected, disable others
      const isAnySelected = Object.values(updatedCounts).some(
        (count) => count > 0,
      );
      setSelectedTicket(isAnySelected ? ticketType : null);

      return updatedCounts;
    });
  };

  // const handleApplyPromoCode = (code: string) => {};

  const totalPrice =
    selectedTicket && ticketTypesQuery
      ? selectedCount[selectedTicket] *
        (ticketTypesQuery.find((t) => t._id === selectedTicket)?.price ?? 0)
      : 0;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          {imageUrl && (
            // Event Header
            <div className="relative w-full rounded-xl overflow-hidden bg-[#120030]/10">
              <Image
                src={imageUrl}
                alt={event.name}
                width={1000}
                height={1000}
                className="object-cover"
                priority
              />
              {/* <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end">
                <div className="container pb-4 lg:pb-6 ml-4 lg:ml-6">
                  <Badge variant="category">
                    {event.category}
                  </Badge>
                  <h1 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-white md:leading-tight md:pb-2">
                    {event.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm md:text-base text-muted">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(event.startTime)}</span>
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="absolute top-1.5 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/80 hover:bg-white cursor-pointer"
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: event.name,
                          text: `Check out this event: ${event.name}`,
                          url: window.location.href,
                        })
                        .catch((error) =>
                          console.error("Error sharing", error),
                        );
                    } else {
                      // Fallback for browsers that don't support the Web Share API
                      toast("Sharing is not supported in your browser.", {
                        description: "Please copy the link manually.",
                      });
                    }
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className={`rounded-full bg-white/80 hover:bg-white ${isFavorite ? "text-amber-500" : ""} cursor-pointer`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                  />
                </Button>
              </div>
            </div>
          )}

          <Card
            className={cn(
              "text-card-foreground bg-card rounded-lg p-6 relative shadow transition-all duration-300 overflow-hidden border-primary-foreground/10",
            )}
          >
            <h3 className="text-xl font-display font-semibold text-secondary-foreground">
              About This Event
            </h3>
            <p className="text-muted-foreground text-sm md:text-base whitespace-pre-line">
              {event.description}
            </p>

            <div>
              {/* <h3 className="font-semibold mb-3">Organizer</h3>
                  <div className="flex items-center gap-3">
                    {user && (
                      <Image
                        src={user?.imageUrl}
                        alt={"Organizer Logo"}
                        className="w-12 h-12 rounded-full object-cover"
                        width={48}
                        height={48}
                      />
                    )}
                    <div>
                      <p className="font-medium capitalize">
                        {user?.fullName ?? "Admin"}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto font-semibold p-0"
                      >
                        View Profile
                      </Button>
                    </div>
                  </div> */}
              {/* <div className="text-gray-500 text-sm">
                Organized by
                <span className="capitalize text-[#6D28D9] font-semibold">
                  {" "}
                  {user?.username}
                </span>
              </div> */}
            </div>
          </Card>
        </section>

        <section className="w-full space-y-4">
          <div className="sticky top-[2px] z-10 bg-card/80 backdrop-blur-md rounded-lg shadow-lg max-w-xl overflow-hidden">
            <EventCard motionkey={1} eventId={eventId} isEventPage={true} />
          </div>

          <Card className="rounded-lg p-0 overflow-hidden text-card-foreground bg-card shadow transition-all duration-300 border-primary-foreground/10 max-w-xl">
            <div className="bg-secondary py-3 px-5 flex items-center">
              <Ticket size={24} className="text-primary mr-2" />
              <h3 className="font-display font-bold">Select Tickets</h3>
            </div>

            <div className="px-4 pb-4 space-y-4">
              {allAvailability?.map((ticket) => (
                <Card
                  key={ticket.ticketType._id}
                  className="p-0 border-l-4 border-l-primary border-t-0 border-r-0 border-b-0 overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex items-start md:items-center justify-between p-4">
                      <div className="mb-4 md:mb-0">
                        <h3 className="font-bold text-lg">
                          {ticket.ticketType.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-1">
                          All Inclusive
                        </p>
                        <p className="text-accent-foreground font-semibold">
                          <span className="text-xs text-accent-foreground/70">
                            ksh{" "}
                          </span>
                          {FormatMoney(ticket.ticketType.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 md:gap-3">
                        <Button
                          variant={"outline"}
                          type="button"
                          size={"icon"}
                          onClick={() =>
                            handleTicketChange(ticket.ticketType._id, -1)
                          }
                          className="rounded-full border-primary-foreground/20 hover:bg-primary-foreground/10"
                          disabled={
                            selectedCount[ticket.ticketType._id] <= 0 ||
                            selectedTicket !== ticket.ticketType._id ||
                            hasBeenOffered ||
                            isEventPast ||
                            isEventOwner ||
                            userTicket !== null
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>

                        <span className="w-6 text-center">
                          {selectedCount[ticket.ticketType._id] || 0}
                        </span>

                        <Button
                          variant={"outline"}
                          type="button"
                          size={"icon"}
                          onClick={() =>
                            handleTicketChange(ticket.ticketType._id, 1)
                          }
                          className="rounded-full border-primary-foreground/20 hover:bg-primary-foreground/10"
                          disabled={
                            (selectedTicket !== null &&
                              selectedTicket !== ticket.ticketType._id) ||
                            hasBeenOffered ||
                            isEventPast ||
                            isEventOwner ||
                            userTicket !== null
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* <div className="text-xs text-muted-foreground ml-2">
                      {isEventPast
                        ? "Event ended"
                        : ticket.remainingTickets > 0
                          ? ticket.remainingTickets === 1
                            ? "1 Ticket Available"
                            : `${ticket.remainingTickets} Tickets Available`
                          : "0 Tickets Available"}
                      {isEventPast
                        ? null
                        : ticket.remainingTickets === 0 && (
                            <span className="text-red-500 ml-2">
                              (Sold Out)
                            </span>
                          )}
                    </div> */}
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>

          <div className="">
            {user ? (
              isEventPast ? (
                <div className="p-4 bg-destructive/10 text-center text-destructive w-full font-semibold rounded-lg transition-all max-w-xl cursor-not-allowed  duration-200 px-4 py-3">
                  This event has ended
                </div>
              ) : isEventOwner ? (
                <></>
              ) : hasBeenOffered ? (
                <div className="flex justify-end gap-2 max-w-xl">
                  Total Price:{" "}
                  <span className="font-bold">{FormatMoney(totalPrice)}</span>
                </div>
              ) : userTicket ? (
                <div className="w-full bg-primary/5 text-muted-foreground/50 font-semibold rounded-lg transition-all max-w-xl cursor-not-allowed text-center duration-200 px-4 py-3">
                  You already have a ticket for this event
                </div>
              ) : (
                <>
                  <div className="flex justify-end gap-2 max-w-xl">
                    Total Price:{" "}
                    <span className="font-bold">{FormatMoney(totalPrice)}</span>
                  </div>

                  {selectedTicket !== null && selectedTicket !== "" ? (
                    <JoinQueue
                      eventId={eventId}
                      userId={user.id}
                      ticketTypeId={selectedTicket as Id<"ticketTypes">}
                      selectedCount={selectedCount[selectedTicket]}
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-full bg-primary/5 text-muted-foreground/50 font-semibold rounded-lg transition-all max-w-xl cursor-not-allowed text-center duration-200 px-4 py-3",
                      )}
                    >
                      No Ticket Selected
                    </div>
                  )}
                </>
              )
            ) : (
              <SignInButton mode="modal">
                <button
                  className={cn(
                    "w-full bg-primary text-primary-foreground font-semibold rounded-lg transition-all max-w-xl text-center duration-200 px-4 py-3",
                  )}
                >
                  Sign in to buy tickets
                </button>
              </SignInButton>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventPageComp;
