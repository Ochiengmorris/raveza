"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn, FormatMoney, useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useMemo } from "react";
import EventCardSkeleton from "@/components/events/EventCardSkeleton";
import Image from "next/image";
import {
  CircleDollarSign,
  Clock9,
  MapPin,
  PencilIcon,
  StarIcon,
} from "lucide-react";
import Link from "next/link";

const FeaturedCard = ({ eventId }: { eventId: Id<"events"> | null }) => {
  const { user } = useUser();

  const event = useQuery(api.events.getById, {
    eventId: eventId ?? ("" as Id<"events">),
  });
  const ticketTypesQuery = useQuery(api.tickets.getTicketTypes, {
    eventId: eventId ?? ("" as Id<"events">),
  });

  const imageUrl = useStorageUrl(event?.imageStorageId);

  // Memoize expensive calculations - this hook now runs for all cases
  const { minTicketPrice, isPastEvent, isEventOwner } = useMemo(() => {
    if (!event || !ticketTypesQuery)
      return {
        minTicketPrice: 0,
        isPastEvent: false,
        isEventOwner: false,
      };

    return {
      minTicketPrice: Math.min(
        ...ticketTypesQuery.map((ticketType) => ticketType.price),
      ),
      isPastEvent: event.eventDate < Date.now(),
      isEventOwner: event.userId === user?.id,
    };
  }, [event, ticketTypesQuery, user?.id]);

  console.log(isPastEvent);

  if (!eventId) {
    return (
      <div className="relative bg-white flex flex-col md:flex-row text-landingsecondary shadow-sm rounded-xl transition-all duration-300 border border-landingsecondary/10 overflow-hidden md:h-96">
        <div className="lg:p-6 p-4 flex flex-col w-full justify-center items-center">
          <h2 className="text-xl md:text-2xl font-bold text-landingsecondary/50">
            No event selected
          </h2>
          <p className="text-landingsecondary/40 mt-2">
            Please select an event to display
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="col-span-1">
        <EventCardSkeleton />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "relative bg-white flex flex-col md:flex-row  text-landingsecondary shadow-sm rounded-xl transition-all duration-300 border border-landingsecondary/10  overflow-hidden md:h-96",
      )}
    >
      {/* Event Image */}
      {imageUrl && (
        <div className="relative md:w-8/12 shrink-0 h-64 md:h-full">
          <Image
            src={imageUrl}
            alt={event.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

          {/* Event Owner Ribbon */}
          <div className="absolute bottom-[3px] left-[3px]">
            {isEventOwner && (
              <span className="inline-flex items-center gap-1 bg-primary text-jmprimary px-2 py-1 rounded-bl-lg rounded-tr-lg text-xs font-semibold">
                <StarIcon className="w-3 h-3" fill="currentColor" />
                Your Event
              </span>
            )}
          </div>
        </div>
      )}

      <div
        className={`lg:p-6 p-4 flex flex-col w-full  ${imageUrl ? "relative" : ""}`}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-xl md:text-2xl font-bold text-landingsecondary line-clamp-2">
            {event.name}
          </h2>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="w-20 h-20 rounded-lg flex items-center justify-start flex-col shadow-md shrink-0  overflow-hidden">
            <div className="uppercase bg-secondary-foreground px-2 py-1 justify-center flex font-bold w-full text-white">
              {new Intl.DateTimeFormat("en-US", { month: "short" }).format(
                new Date(event.eventDate),
              )}
            </div>
            <div className="text-landingsecondary flex-1 flex items-center justify-center text-3xl font-bold">
              {new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(
                new Date(event.eventDate),
              )}
            </div>
          </div>
          <div>
            <div className="items-center gap-2 text-landingsecondary/60 flex sm:flex md:hidden lg:flex">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{event.location}</span>
            </div>

            <div className="flex items-center gap-2 text-landingsecondary">
              <CircleDollarSign className="w-4 h-4" />
              <span className="text-xs text-landingsecondary font-extrabold">
                <span className="text-2xl">{FormatMoney(minTicketPrice)}</span>{" "}
                KES{" "}
              </span>
            </div>

            <div className="flex items-center gap-2 text-landingsecondary">
              <Clock9 className="w-4 h-4" />
              <span>{event.startTime ?? "08:00"}</span>
            </div>
          </div>
        </div>
        <div className="items-center gap-2 mt-1  text-landingsecondary/60 md:flex hidden lg:hidden">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{event.location}</span>
        </div>

        <div className="mt-4">
          <p className="xl:line-clamp-4 line-clamp-3 whitespace-pre-wrap text-sm text-landingsecondary/80">
            {event.description}
          </p>
        </div>

        {/* <div className="flex gap-2 mt-4"> */}
        {/** TODO: Reuse this somehwere else*/}
        {/* {isPastEvent && (
                <span className="inline-flex items-center gap-1 border border-red-500/10 bg-red-500/10 backdrop-blur-sm text-red-500 px-2 py-1 rounded-md text-xs font-semibold">
                <XCircle className="w-3 h-3" />
                Past Event
                </span>
                )} */}
        {/* {isPastEvent && (
            <span className="inline-flex items-center gap-1 border border-green-500/10 bg-jmprimary/20 backdrop-blur-sm text-landingtertiary px-2 py-1 rounded-md text-xs font-semibold">
              <Check className="w-3 h-3" />
              Tickets Available
            </span>
          )}
        </div> */}
        <div className="items-end flex-1 flex justify-between ">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center gap-2 mt-4 p-4 rounded-xl text-sm font-semibold bg-secondary-foreground text-white hover:text-card/80 w-full justify-center transition-colors duration-300 ease-in-out"
          >
            <PencilIcon className="w-4 h-4" />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
