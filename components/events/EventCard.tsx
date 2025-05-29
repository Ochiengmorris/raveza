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
  Plus,
  StarIcon,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import EventCardSkeleton from "@/components/events/EventCardSkeleton";
import { formatDate, FormatMoney, useStorageUrl } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import PurchaseTicket from "@/components/tickets/PurchaseTicket";
import { useGuest } from "@/components/providers/GuestProvider";

interface EventCardProps {
  eventId: Id<"events"> | null;
  motionkey: number;
  isEventPage?: boolean;
}

const EventCard = ({
  eventId,
  motionkey,
  isEventPage = false,
}: EventCardProps) => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { guestInfo } = useGuest();
  const router = useRouter();

  // Query hooks
  const event = useQuery(api.events.getById, {
    eventId: eventId ?? ("" as Id<"events">),
  });

  const ticketTypesQuery = useQuery(api.tickets.getTicketTypes, {
    eventId: eventId ?? ("" as Id<"events">),
  });

  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId: eventId ?? ("" as Id<"events">),
    userId: user?.id ?? guestInfo?.id ?? "",
  });

  const queuePosition = useQuery(api.waitingList.getQueuePositions, {
    eventId: eventId ?? ("" as Id<"events">),
    userId: user?.id ?? guestInfo?.id ?? "",
  });

  const imageUrl = useStorageUrl(event?.imageStorageId);

  // Memoized calculations
  const eventDetails = useMemo(() => {
    if (!event || !ticketTypesQuery) {
      return {
        minTicketPrice: 0,
        maxTicketPrice: 0,
        isSingleTicketType: false,
        isPastEvent: false,
        isEventOwner: false,
      };
    }

    const prices = ticketTypesQuery.map((ticketType) => ticketType.price);

    return {
      minTicketPrice: Math.min(...prices),
      maxTicketPrice: Math.max(...prices),
      isSingleTicketType: ticketTypesQuery.length === 1,
      isPastEvent: event.eventDate < Date.now(),
      isEventOwner: user?.id === event?.userId,
    };
  }, [event, ticketTypesQuery, user?.id]);

  // Event handlers
  const handleCardClick = useCallback(() => {
    if (eventId) {
      router.push(`/events/${eventId}`);
    }
  }, [router, eventId]);

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (eventId) {
        router.push(`/seller/events/${eventId}/edit`);
      }
    },
    [router, eventId],
  );

  const handleTicketClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (userTicket) {
        router.push(`/tickets/${userTicket._id}`);
      }
    },
    [router, userTicket],
  );

  // Render helper functions
  const renderQueuePosition = useCallback(() => {
    if (!queuePosition || queuePosition.status !== "waiting") return null;

    const isNextInLine = queuePosition.position === 1;
    const baseClasses =
      "flex items-center justify-between p-3 rounded-lg border";

    if (isNextInLine) {
      return (
        <div className={`${baseClasses} bg-amber-50 border-amber-100`}>
          <div className="flex items-center gap-2">
            <CircleArrowRight className="w-5 h-5 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-amber-700 font-medium">
                You&apos;re next in line!
              </span>
              <span className="text-amber-600 text-sm">
                Queue position: {queuePosition.position}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <LoaderCircle className="w-4 h-4 animate-spin text-amber-500" />
            <span className="text-amber-600 text-sm">Waiting</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`${baseClasses} bg-blue-50 border-blue-100`}>
        <div className="flex items-center gap-2">
          <LoaderCircle className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-blue-700 font-medium">In queue</span>
        </div>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          #{queuePosition.position}
        </span>
      </div>
    );
  }, [queuePosition]);

  const renderTicketStatus = useCallback(() => {
    if (!isUserLoaded || (!user && !guestInfo)) return null;

    // Event owner can edit
    if (eventDetails.isEventOwner && isEventPage) {
      return (
        <div className="mt-4">
          <button
            onClick={handleEditClick}
            className="w-full bg-primary/80 text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Edit Event
          </button>
        </div>
      );
    }

    // User has ticket
    if (userTicket) {
      return (
        <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">
              You have a ticket!
            </span>
          </div>
          <button
            onClick={handleTicketClick}
            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-medium shadow-sm transition-colors duration-200"
          >
            View Ticket
          </button>
        </div>
      );
    }

    // Queue position handling
    if (queuePosition) {
      return (
        <div className="mt-4 space-y-1">
          {queuePosition.status === "offered" && (
            <PurchaseTicket
              eventId={eventId!}
              ticketTypeId={queuePosition.ticketTypeId}
            />
          )}
          {queuePosition.status === "waiting" && renderQueuePosition()}
          {queuePosition.status === "expired" && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">Offer expired</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  }, [
    isUserLoaded,
    user,
    guestInfo,
    eventDetails.isEventOwner,
    isEventPage,
    userTicket,
    queuePosition,
    handleEditClick,
    handleTicketClick,
    renderQueuePosition,
    eventId,
  ]);

  const renderPastEventRibbon = useCallback(() => {
    if (!eventDetails.isPastEvent) return null;

    return (
      <>
        <div className="absolute top-4 right-2 text-white text-xs font-extrabold uppercase transform rotate-45 translate-x-10 -translate-y-3 z-20">
          <div className="py-2.5 bg-red-600 shadow-lg">
            <span className="bg-red-700 text-white py-2 px-10">PAST</span>
          </div>
        </div>
        {!isEventPage && (
          <>
            <div className="absolute top-[9.5px] right-[42.5px] transform -rotate-[30deg] translate-x-0 -translate-y-4">
              <div className="bg-red-600 h-6 w-6" />
            </div>
            <div className="absolute top-[62px] -right-[12.5px] transform rotate-[30deg] translate-x-0 -translate-y-4">
              <div className="bg-red-600 h-6 w-6" />
            </div>
          </>
        )}
      </>
    );
  }, [eventDetails.isPastEvent, isEventPage]);

  const renderEventImage = useCallback(() => {
    if (!imageUrl || isEventPage) return null;

    return (
      <div className="p-2">
        <div className="relative w-full rounded-xl aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={event?.name || "Event image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

          {/* Event Owner Badge */}
          {eventDetails.isEventOwner && (
            <div className="absolute bottom-1 left-1">
              <span className="inline-flex items-center gap-1 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-white">
                <StarIcon className="w-3 h-3" fill="currentColor" />
                <span className="hidden sm:inline">Your Event</span>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }, [imageUrl, isEventPage, event?.name, eventDetails.isEventOwner]);

  const renderDateBox = useCallback(() => {
    if (!event) return null;

    const eventDate = new Date(event.eventDate);
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
      eventDate,
    );
    const day = new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(
      eventDate,
    );

    return (
      <div className="w-16 h-16 rounded-lg items-center justify-start flex-col shadow-md shrink-0 overflow-hidden hidden md:flex">
        <div className="uppercase bg-card-foreground flex px-2 py-1 justify-center font-bold text-xs md:text-sm w-full text-card">
          {month}
        </div>
        <div className="text-card-foreground flex-1 flex items-center justify-center text-lg md:text-2xl lg:text-3xl font-bold">
          {day}
        </div>
      </div>
    );
  }, [event]);

  // Early returns
  if (!eventId) {
    return (
      <div className="relative bg-white flex flex-col text-gray-600 shadow-sm rounded-xl border border-gray-200 overflow-hidden h-96">
        <div className="p-6 flex flex-col w-full justify-center items-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-400">
            No event selected
          </h2>
          <p className="text-gray-300 mt-2">
            Please select an event to display
          </p>
        </div>
      </div>
    );
  }

  if (!event || !isUserLoaded) {
    return <EventCardSkeleton />;
  }

  return (
    <motion.div
      className={`relative text-card-foreground transition-all duration-200 overflow-hidden cursor-pointer max-w-xl border-none p-0 hover:border hover:border-primary/20 rounded-xl hover:shadow-xl bg-white/95 hover:bg-white ${
        eventDetails.isPastEvent ? "opacity-75 hover:opacity-100" : ""
      }`}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: motionkey * 0.1,
        duration: 0.4,
        ease: "easeOut",
      }}
    >
      {renderPastEventRibbon()}
      {renderEventImage()}

      <div className={`${isEventPage ? "p-4" : "px-2 pb-4"} `}>
        <h2 className="text-md lg:text-xl md:text-lg font-bold text-gray-700 line-clamp-2 mb-2">
          {event.name}
        </h2>

        <div className="flex flex-col md:flex-row gap-2 lg:gap-4">
          {renderDateBox()}

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4 shrink-0" />
              <span className="text-xs line-clamp-1">{event.location}</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-xs text-card-foreground font-bold">
                KES
              </span>
              <span className="text-lg lg:text-xl font-bold flex items-baseline text-gray-700">
                {FormatMoney(eventDetails.minTicketPrice)}
                {!eventDetails.isSingleTicketType && (
                  <span className="text-xs text-muted-foreground">
                    <Plus className="w-3 h-3 shrink-0" />
                  </span>
                )}{" "}
              </span>
            </div>

            <div className="md:hidden text-xs text-muted-foreground">
              {formatDate(new Date(event.eventDate).toISOString())}
            </div>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          {!eventDetails.isPastEvent && isEventPage && renderTicketStatus()}
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
