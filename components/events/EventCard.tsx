"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Check,
  CircleArrowRight,
  LoaderCircle,
  MapPin,
  PencilIcon,
  StarIcon,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import EventCardSkeleton from "@/components/events/EventCardSkeleton";
import { cn, formatDate, FormatMoney, useStorageUrl } from "@/lib/utils";
import { useCallback, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import PurchaseTicket from "@/components/tickets/PurchaseTicket";

const EventCard = ({
  eventId,
  motionkey,
  isEventPage,
}: {
  eventId: Id<"events"> | null;
  motionkey: number;
  isEventPage?: boolean;
}) => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  const event = useQuery(api.events.getById, {
    eventId: eventId ?? ("" as Id<"events">),
  });
  const ticketTypesQuery = useQuery(api.tickets.getTicketTypes, {
    eventId: eventId ?? ("" as Id<"events">),
  });
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId: eventId ?? ("" as Id<"events">),
    userId: user?.id ?? "",
  });

  const queuePosition = useQuery(api.waitingList.getQueuePositions, {
    eventId: eventId ?? ("" as Id<"events">),
    userId: user?.id ?? "",
  });

  const imageUrl = useStorageUrl(event?.imageStorageId);

  // Memoize expensive calculations
  const {
    minTicketPrice,
    // maxTicketPrice,
    // isSingleTicketType,
    isPastEvent,
    isEventOwner,
  } = useMemo(() => {
    if (!event || !ticketTypesQuery)
      return {
        minTicketPrice: 0,
        maxTicketPrice: 0,
        isSingleTicketType: false,
        isPastEvent: false,
        isEventOwner: false,
      };

    return {
      minTicketPrice: Math.min(
        ...ticketTypesQuery.map((ticketType) => ticketType.price),
      ),
      // maxTicketPrice: Math.max(
      //   ...ticketTypesQuery.map((ticketType) => ticketType.price),
      // ),
      // isSingleTicketType: ticketTypesQuery.length === 1,
      isPastEvent: event.eventDate < Date.now(),
      isEventOwner: user?.id === event?.userId,
    };
  }, [event, ticketTypesQuery, user?.id]);
  // console.log(maxsi)

  const handleCardClick = useCallback(() => {
    router.push(`/events/${eventId}`);
  }, [router, eventId]);

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/seller/events/${eventId}/edit`);
    },
    [router, eventId],
  );

  // console.log(handleEditClick);

  const handleTicketClick = useCallback(() => {
    if (userTicket) {
      router.push(`/tickets/${userTicket._id}`);
    }
  }, [router, userTicket]);

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

  if (!event || !isUserLoaded) {
    return (
      <div className="col-span-1">
        <EventCardSkeleton />
      </div>
    );
  }

  const renderQueuePosition = () => {
    if (!queuePosition || queuePosition.status !== "waiting") return null;

    if (queuePosition.position === 2) {
      return (
        <div className="flex flex-col items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-center">
            <CircleArrowRight className="w-5 h-5 hidden md:block  text-amber-500 mr-1" />
            <span className="text-amber-700 font-medium">
              You&apos;re next in line!{" "}
              <span className="text-amber-500 text-sm">
                {" "}
                (Queue position: {queuePosition.position})
              </span>
            </span>
          </div>
          <div className="flex items-center">
            <LoaderCircle className="w-4 h-4 mr-1 animate-spin text-amber-500" />
            <span className="text-amber-600 text-sm">Waiting for ticket</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center">
          <LoaderCircle className="w-4 h-4 mr-2 animate-spin text-green-500" />
          <span className="text-green-700">Queue position</span>
        </div>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
          #{queuePosition.position}
        </span>
      </div>
    );
  };

  const renderTicketStatus = () => {
    if (!user) return null;

    if (isEventOwner && isEventPage) {
      return (
        <div className="mt-4">
          <button
            onClick={handleEditClick}
            className="w-full bg-primary/80 text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 ease-in-out shadow-sm flex items-center justify-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Edit Event
          </button>
        </div>
      );
    }

    if (userTicket) {
      return (
        <div className="mt-4 flex items-center justify-between p-3 bg-[#120030]/10 rounded-lg border border-primary/5">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-jmprimary mr-2" />
            <span className="text-jmprimary font-medium">
              You have a ticket!
            </span>
          </div>
          <button
            onClick={handleTicketClick}
            className="text-sm bg-primary/50 hover:bg-primary/70 text-black px-3 py-1.5 rounded-full font-medium shadow-sm transition-colors duration-200 flex items-center gap-1"
          >
            View <span className="hidden lg:inline">your</span> ticket
          </button>
        </div>
      );
    }

    if (queuePosition) {
      return (
        <div className="mt-4">
          {queuePosition.status === "offered" && (
            <PurchaseTicket
              eventId={eventId}
              ticketTypeId={queuePosition.ticketTypeId}
            />
          )}
          {renderQueuePosition()}
          {queuePosition.status === "expired" && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-red-700 font-medium flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Offer expired
              </span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "relative text-card-foreground transition-all duration-200 overflow-hidden cursor-pointer max-w-xl border-none p-0 hover:border hover:border-primary-foreground/20 rounded-xl hover:shadow-xl",
      )}
    >
      <motion.div
        onClick={handleCardClick}
        className={`relative ${
          isPastEvent ? "opacity-75 hover:opacity-100" : ""
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: motionkey * 0.2, // Delay depends on the index
          duration: 0.5, // Duration of the animation
        }}
      >
        {/* 'PAST' Ribbon */}
        {isPastEvent && (
          <>
            <div className="absolute top-4 right-2 text-white text-xs font-extrabold uppercase transform rotate-45 translate-x-10 -translate-y-3 z-20">
              <div className="py-2.5 bg-white z-10">
                <span className="bg-destructive text-accent py-2 px-10">
                  PAST
                </span>
              </div>
            </div>
          </>
        )}

        {/* Event Image */}
        {imageUrl && !isEventPage && (
          <div className="p-2">
            <div className="relative w-full rounded-xl aspect-1/1 overflow-hidden ">
              <Image
                src={imageUrl}
                alt={event.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

              {/* Event Owner Ribbon */}
              <div className="absolute hidden lg:bottom-[2px] bottom-[1px] left-[2px]">
                {isEventOwner && (
                  <span className="inline-flex items-center gap-1 bg-primary backdrop-blur-sm px-1 py-0.5 lg:px-2 lg:py-1 rounded-tr-md rounded-bl-xl text-xs font-semibold">
                    <StarIcon
                      className="lg:w-3 lg:h-3 w-2 h-2"
                      fill="currentColor"
                    />
                    Your Event
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <div className={`px-2 pb-4 ${imageUrl ? "relative" : ""}`}>
          <h2 className="text-md lg:text-xl md:text-lg font-bold text-gray-700 line-clamp-2">
            {event.name}
          </h2>

          <div className="mt-1 flex flex-col md:flex-row lg:gap-4 gap-2">
            <div className="w-16 h-16 rounded-lg items-center justify-start flex-col shadow-md shrink-0 overflow-hidden hidden md:flex">
              <div className="uppercase bg-card-foreground flex px-2 py-1 justify-center font-bold text-xs md:text-sm lg:text-md w-full text-card">
                {new Intl.DateTimeFormat("en-US", { month: "short" }).format(
                  new Date(event.eventDate),
                )}
              </div>
              <div className="text-card-foreground flex-1 flex items-center justify-center text-md md:text-2xl lg:text-3xl font-bold">
                {new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(
                  new Date(event.eventDate),
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="lg:w-4 lg:h-4 w-3 h-3 shrink-0" />
                <span className="text-xs lg:text-sm line-clamp-1">
                  {event.location}
                </span>
              </div>
              <h2 className="text-md lg:text-xl md:text-lg font-bold text-gray-700 line-clamp-2">
                <span className="text-xs text-card-foreground font-extrabold">
                  KES{" "}
                  <span className="text-xl">
                    {FormatMoney(minTicketPrice)}
                  </span>{" "}
                </span>
              </h2>
            </div>
            <div className="md:hidden text-xs text-muted-foreground">
              {formatDate(new Date(event.eventDate).toISOString())}
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            {!isPastEvent && isEventPage && renderTicketStatus()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventCard;
