"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn, FormatMoney, useStorageUrl } from "@/lib/utils";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import Spinner from "@/components/loaders/Spinner";
import { ticketTypeWithId } from "@/app/(home)/events/[id]/page";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, Share2, Ticket } from "lucide-react";
import JoinQueue from "@/components/tickets/JoinQueue";
import EventCard from "@/components/events/EventCard";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import VerifyPromoCode from "@/actions/verifyPromoCode";
import { useGuest } from "@/components/providers/GuestProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BuyTicketUnauthorizedForm from "./BuyTicketUnauthorizedForm";

/**
 * Copies the provided text to the clipboard.
 *
 * @param text - The string to be copied to the clipboard.
 * @returns A promise that resolves when the text has been copied.
 */
export async function copyToClipBoard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    // Fallback for browsers that do not support the Clipboard API
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Avoid scrolling to the bottom of the page
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (!successful) {
        throw new Error("Failed to copy text to clipboard");
      }
    } catch (error: unknown) {
      console.error("Fallback: Error copying text to clipboard", error);
    }
    document.removeChild(textArea);
  } else {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error: unknown) {
      console.error("Error copying text to clipboard", error);
    }
  }
}

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
  id: Id<"promoCodes">;
  code: string;
  discount: number;
  expiresAt: number;
  isActive: boolean;
};

const EventPageComp = ({
  event,
  eventId,
}: {
  event: Event;
  eventId: Id<"events">;
}) => {
  const { user } = useUser();
  const { guestInfo } = useGuest();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<{ [key: string]: number }>(
    {},
  );
  const [appliedPromoCode, setAppliedPromoCode] = useState<
    PromoCode | undefined
  >(undefined);
  const [promoCode, setPromoCode] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId: event._id,
    userId: user?.id ?? guestInfo?.id ?? "",
  });

  const allAvailability = useQuery(api.events.getAllAvailabilityForEvent, {
    eventId: event._id,
  });

  const availabilityForSelected = allAvailability?.find(
    (a) => a.ticketType._id === selectedTicket,
  )?.remainingTickets;

  const hasBeenOffered = useQuery(api.waitingList.hasBeenOffered, {
    eventId: event._id,
    userId: user?.id ?? guestInfo?.id ?? "",
  });
  const ticketTypesQuery = useQuery(api.tickets.getTicketTypes, {
    eventId: event._id,
  });

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

  const handleApplyPromoCode = async () => {
    if (!promoCode || promoCode.trim() === "") {
      toast.error("Please enter a valid promo code.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await VerifyPromoCode({
        eventId: event._id,
        code: promoCode.toUpperCase(),
      });
      console.log(result);
      if (result.success) {
        setAppliedPromoCode(result?.promoCodeValues);
        setIsLoading(false);
        toast.success("Code applied successfully!");
      } else {
        setAppliedPromoCode(undefined);
        setIsLoading(false);
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      setAppliedPromoCode(undefined);
      toast.error("Failed to apply promo code.");
    }
  };

  const totalPrice =
    selectedTicket && ticketTypesQuery
      ? selectedCount[selectedTicket] *
        (ticketTypesQuery.find((t) => t._id === selectedTicket)?.price ?? 0)
      : 0;

  const lumpSumTotalPrice =
    totalPrice -
    (appliedPromoCode ? (totalPrice * appliedPromoCode.discount) / 100 : 0);
  const lumpSumTotalPriceFormatted = Math.round(lumpSumTotalPrice);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
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
                <div className="absolute top-1.5 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full cursor-pointer"
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
                        copyToClipBoard(window.location.href)
                          .then(() => {
                            toast("Link copied to clipboard!");
                          })
                          .catch((error) => {
                            console.error(
                              "Error copying link to clipboard",
                              error,
                            );
                            toast.error("Failed to copy link to clipboard.");
                          });
                      }
                    }}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  {/* <Button
                  variant="secondary"
                  size="icon"
                  className={`rounded-full bg-white/80 hover:bg-white ${isFavorite ? "text-amber-500" : ""} cursor-pointer`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                  />
                </Button> */}
                </div>
              </div>
            )}

            <Card
              className={cn(
                "text-card-foreground bg-card rounded-lg p-6 relative shadow transition-all duration-300 overflow-hidden border-primary-foreground/10",
              )}
            >
              <div className="text-gray-500 text-sm">
                Organized by
                <span className="capitalize text-primary font-semibold">
                  {" "}
                  {user?.username ?? "Organizer"}
                </span>
              </div>
              <p className="text-muted-foreground text-sm md:text-base whitespace-pre-line">
                {event.description}
              </p>
            </Card>
          </section>

          <section className="w-full space-y-4">
            <div className="sticky top-[2px] z-10 bg-card/80 backdrop-blur-md rounded-lg shadow-lg max-w-xl overflow-hidden">
              <EventCard motionkey={1} eventId={eventId} isEventPage={true} />
            </div>

            <Card className="rounded-lg p-0 overflow-hidden text-card-foreground bg-card shadow-lg border-none max-w-xl">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Card>

            <div className="">
              <div className="flex flex-col justify-end gap-2 max-w-xl bg-card rounded-lg shadow-lg p-4 mb-4">
                {Object.entries(selectedCount).map(([ticketType, count]) => {
                  const ticketPrice =
                    ticketTypesQuery?.find((t) => t._id === ticketType)
                      ?.price ?? 0;
                  const ticketName =
                    ticketTypesQuery?.find((t) => t._id === ticketType)?.name ??
                    "ticketType";
                  return (
                    <span
                      key={ticketType}
                      className="text-sm text-muted-foreground flex justify-between w-full"
                    >
                      <span className="font-stretch-75%">
                        {count} x {ticketName}
                      </span>
                      {FormatMoney(ticketPrice * count)}
                    </span>
                  );
                })}

                <span className="text-sm text-muted-foreground flex justify-between w-full">
                  <span className="font-stretch-75%">
                    Discount Code{" "}
                    <span className="uppercase">
                      {appliedPromoCode && `- (${appliedPromoCode.code})`}
                    </span>
                  </span>
                  {appliedPromoCode
                    ? `-${appliedPromoCode.discount}% (${FormatMoney(
                        (totalPrice * appliedPromoCode.discount) / 100,
                      )}) `
                    : "- 0%"}
                </span>

                <div className="flex items-center gap-2 mt-2">
                  <Input
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 text-sm uppercase"
                    disabled={
                      isEventPast || isEventOwner || userTicket !== null
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleApplyPromoCode();
                      }
                    }}
                    autoComplete="off"
                  />
                  <Button
                    variant="link"
                    className="font-semibold hover:no-underline hover:bg-primary/15"
                    disabled={
                      isEventPast ||
                      isLoading ||
                      isEventOwner ||
                      userTicket !== null
                    }
                    onClick={handleApplyPromoCode}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="">Applying...</span>
                      </>
                    ) : (
                      "Apply Code"
                    )}
                  </Button>
                </div>

                <span className="text-sm border-t border-gray-400 pt-2 text-muted-foreground flex font-semibold justify-between w-full gap-2">
                  Total Price:{" "}
                  <span className="font-bold text-base">
                    <span className="text-xs">KES</span>{" "}
                    {lumpSumTotalPriceFormatted}
                  </span>
                </span>
              </div>

              {user ? (
                isEventPast ? (
                  <div className="p-4 bg-destructive/10 text-center text-destructive w-full font-semibold rounded-lg transition-all max-w-xl cursor-not-allowed  duration-200 px-4 py-3">
                    This event has ended
                  </div>
                ) : isEventOwner ? (
                  <></>
                ) : hasBeenOffered ? (
                  <></>
                ) : userTicket ? (
                  <div className="w-full bg-primary/5 text-muted-foreground/50 font-semibold rounded-lg transition-all max-w-xl cursor-not-allowed text-center duration-200 px-4 py-3">
                    You already have a ticket for this event
                  </div>
                ) : (
                  <>
                    {selectedTicket !== null && selectedTicket !== "" ? (
                      <JoinQueue
                        eventId={eventId}
                        userId={user.id}
                        ticketTypeId={selectedTicket as Id<"ticketTypes">}
                        selectedCount={selectedCount[selectedTicket]}
                        promoCodeId={appliedPromoCode?.id}
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
              ) : hasBeenOffered ? (
                <></>
              ) : (
                <>
                  {" "}
                  <div className="flex gap-3 max-w-xl">
                    <SignInButton mode="modal">
                      <button
                        className={
                          "bg-primary text-primary-foreground font-semibold rounded-lg max-w-xl px-4 py-3 flex-1 text-sm lg:text-md hover:bg-primary/90 transition-all duration-200 ease-in-out"
                        }
                      >
                        Sign in{" "}
                        <span className="hidden md:inline">
                          {" "}
                          to get discounts
                        </span>
                      </button>
                    </SignInButton>
                    <button
                      className="flex-1 text-sm md:text-md max-w-xl px-4 py-3 rounded-lg border-primary hover:bg-secondary hover:text-primary transition-all duration-200 ease-in-out font-semibold cursor-pointer"
                      onClick={() => setIsFormVisible(true)}
                      disabled={
                        isEventPast || isEventOwner || userTicket !== null
                      }
                    >
                      Buy Tickets
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      <Dialog open={isFormVisible} onOpenChange={setIsFormVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy Form</DialogTitle>
            <DialogDescription>
              Please fill out the form below to purchase tickets without signing
              in.
            </DialogDescription>
          </DialogHeader>
          {selectedTicket !== null && selectedTicket !== "" && (
            <BuyTicketUnauthorizedForm
              eventId={eventId}
              ticketTypeId={selectedTicket as Id<"ticketTypes">}
              selectedCount={selectedCount[selectedTicket]}
              promoCodeId={appliedPromoCode?.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventPageComp;
