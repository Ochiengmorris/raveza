"use client";

import EventCard from "@/components/events/EventCard";
import Spinner from "@/components/loaders/Spinner";
import JoinQueue from "@/components/tickets/JoinQueue";
import { Button } from "@/components/ui/button";
// import FormatMoney, { cn, useStorageUrl } from "@/lib/utils";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Clock, Heart, Info, Minus, Plus, Share2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn, FormatMoney, useStorageUrl } from "@/lib/utils";
import { toast } from "sonner";

export type ticketType = {
  name: string;
  price: number;
  totalTickets: number;
};

export type ticketTypeWithId = ticketType & {
  _id: Id<"ticketTypes">;
};

function EventPage() {
  const { user } = useUser();
  const params = useParams();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<{ [key: string]: number }>(
    {},
  );
  const [isFavorite, setIsFavorite] = useState(false);

  const event = useQuery(api.events.getById, {
    eventId: params.id as Id<"events">,
  });

  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId: params.id as Id<"events">,
    userId: user?.id ?? "",
  });

  const allAvailability = useQuery(api.events.getAllAvailabilityForEvent, {
    eventId: params.id as Id<"events">,
  });

  const availabilityForSelected = allAvailability?.find(
    (a) => a.ticketType._id === selectedTicket,
  )?.remainingTickets;

  const hasBeenOffered = useQuery(api.waitingList.hasBeenOffered, {
    eventId: params.id as Id<"events">,
    userId: user?.id ?? "",
  });
  const ticketTypesQuery = useQuery(api.tickets.getTicketTypes, {
    eventId: params.id as Id<"events">,
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

  const totalPrice =
    selectedTicket && ticketTypesQuery
      ? selectedCount[selectedTicket] *
        (ticketTypesQuery.find((t) => t._id === selectedTicket)?.price ?? 0)
      : 0;

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-xl overflow-hidden">
          {imageUrl && (
            // Event Header
            <section className="h-64 lg:h-full lg:aspect-[21/9] relative w-full rounded-xl overflow-hidden border">
              <Image
                src={imageUrl}
                alt={event.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end">
                <div className="container pb-4 lg:pb-6 ml-4 lg:ml-6">
                  <Badge variant="category" className="md:pb-2">
                    {event.category}
                    {/* {"Music"} */}
                  </Badge>
                  <h1 className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl text-white md:leading-tight md:pb-2">
                    {event.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-white">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{event.startTime}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/80 hover:bg-white"
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
                  className={`rounded-full bg-white/80 hover:bg-white ${isFavorite ? "text-red-500" : ""}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                  />
                </Button>
              </div>
            </section>
          )}

          <section className="container py-8 lg:mt-8 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-2 gap-12">
              {/* Left Column - Event Details */}
              <div className="">
                {/* Additional Event Information */}
                <Card
                  className={cn(
                    "text-card-foreground bg-card rounded-lg p-6 relative shadow transition-all duration-300 overflow-hidden border-primary-foreground/10 max-w-xl",
                  )}
                >
                  <h3 className="text-xl font-display font-semibold text-secondary-foreground">
                    About this Event
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base whitespace-pre-line">
                    {event.description}
                  </p>

                  <div className="border-t">
                    <h3 className="font-semibold mb-3">Organizer</h3>
                    <div className="flex items-center gap-3">
                      {/** TODO: Add organizer logo */}
                      <Image
                        src={user?.imageUrl ?? ""}
                        alt={"Organizer Logo"}
                        className="w-12 h-12 rounded-full object-cover"
                        width={48}
                        height={48}
                      />
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
                    </div>
                  </div>
                </Card>

                <Card className="rounded-lg p-0 overflow-hidden mt-4 text-card-foreground bg-card shadow transition-all duration-300 border-primary-foreground/10 max-w-xl">
                  <div className="bg-secondary py-3 px-5">
                    <h3 className="font-display font-semibold">
                      Select Tickets
                    </h3>
                  </div>

                  <div className="px-5">
                    {allAvailability?.map((ticket) => (
                      <div
                        key={ticket.ticketType._id}
                        className="pb-4 border-b last:border-0"
                      >
                        <div className="flex items-center justify-between ">
                          <div>
                            <h4 className="font-semibold">
                              {ticket.ticketType.name}
                            </h4>
                            <p className="font-semibold text-muted-foreground text-xl  ml-2">
                              <span className="text-secondary-foreground text-xs">
                                Ksh
                              </span>{" "}
                              {FormatMoney(ticket.ticketType.price)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              variant={"outline"}
                              type="button"
                              size={"icon"}
                              onClick={() =>
                                handleTicketChange(ticket.ticketType._id, -1)
                              }
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

                        <div className="text-xs text-muted-foreground ml-2">
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
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column - Ticket Purchase Card */}
              <div>
                <div className="sticky top-8 space-y-4">
                  <EventCard
                    motionkey={1}
                    eventId={params.id as Id<"events">}
                  />

                  {/* ticket should take the tickettypeId and price  */}
                  {user ? (
                    isEventPast ? (
                      <div className="p-4 bg-destructive/10 text-center text-destructive w-full font-semibold rounded-lg transition-all max-w-xl cursor-not-allowed  duration-200 px-4 py-3">
                        This event has ended
                      </div>
                    ) : isEventOwner ? (
                      <div
                        className={cn(
                          "w-full bg-primary/5 text-muted-foreground/50 font-semibold rounded-lg transition-all max-w-xl cursor-not-allowed text-center duration-200 px-4 py-3",
                        )}
                      >
                        You are the owner of this event
                      </div>
                    ) : hasBeenOffered ? (
                      <></>
                    ) : userTicket ? (
                      <div className="w-full bg-primary/5 text-muted-foreground/50 font-semibold rounded-lg transition-all max-w-xl cursor-not-allowed text-center duration-200 px-4 py-3">
                        You have already purchased a ticket for this event
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-end gap-2">
                          Total Price:{" "}
                          <span className="font-bold">
                            {FormatMoney(totalPrice)}
                          </span>
                        </div>

                        {selectedTicket !== null && selectedTicket !== "" ? (
                          <JoinQueue
                            eventId={params.id as Id<"events">}
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

                <div className="border rounded-lg mt-4 overflow-hidden text-card-foreground bg-card shadow transition-all duration-300 border-primary-foreground/10 max-w-xl">
                  <h3 className="font-display font-bold text-lg flex items-center mb-4 bg-secondary p-4">
                    <Info className="h-5 w-5 mr-2 text-jmprimary" />
                    Event Information
                  </h3>
                  <ul className="space-y-3 text-sm px-4">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Refund Policy
                      </span>
                      <span className="font-semibold">No Refunds</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Age Restrictions
                      </span>
                      <span className="font-semibold">All Ages</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Accessibility
                      </span>
                      <span className="font-semibold">
                        Wheelchair Accessible
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Contact</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto font-semibold text-sm p-0"
                      >
                        Contact Organizer
                      </Button>
                    </li>
                  </ul>
                  <div className="mt-4 p-4 border-t text-xs text-muted-foreground">
                    <p>
                      For any questions regarding this event, please contact the
                      organizer directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default EventPage;
