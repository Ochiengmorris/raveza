// "use client";

// import { useMutation, useQuery } from "convex/react";
// import { ConvexError } from "convex/values";
// import { Clock, OctagonXIcon } from "lucide-react";
// import { Skeleton } from "../ui/skeleton";
// import { Id } from "@/convex/_generated/dataModel";
// import { api } from "@/convex/_generated/api";
// import { toast } from "sonner";
// import { WAITING_LIST_STATUS } from "@/convex/constants";
// import { useTransition } from "react";
// import { useGuest } from "../providers/GuestProvider";

// export default function JoinQueue({
//   eventId,
//   userId,
//   ticketTypeId,
//   selectedCount,
//   promoCodeId,
//   name,
//   email,
// }: {
//   eventId: Id<"events">;
//   userId: string;
//   ticketTypeId: Id<"ticketTypes">;
//   selectedCount: number;
//   promoCodeId?: Id<"promoCodes">;
//   name?: string;
//   email?: string;
// }) {
//   const joinWaitingList = useMutation(api.events.joinWaitingList);
//   const createGuestUserMutation = useMutation(api.users.createGuestUser);
//   const [isPending, startTransition] = useTransition();
//   const { setGuestToken, setGuestInfo } = useGuest();

//   const queuePosition = useQuery(api.waitingList.getQueuePosition, {
//     eventId,
//     userId,
//     ticketTypeId,
//   });
//   const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
//     eventId,
//     userId,
//   });
//   const availability = useQuery(api.events.getEventAvailability, {
//     eventId,
//     ticketTypeId,
//   });
//   const event = useQuery(api.events.getById, { eventId });

//   if (!ticketTypeId || !event) return null;

//   const isEventOwner = userId === event?.userId;
//   const handleJoinQueue = async () => {
//     if (userId) {
//       try {
//         const result = await joinWaitingList({
//           eventId,
//           userId,
//           ticketTypeId,
//           selectedCount,
//           promoCodeId,
//         });
//         if (result.success) {
//           console.log("Successfully joined waiting list");
//           toast.success(result.message, {
//             duration: 5000,
//           });
//         } else {
//           toast.error("Uh! Oh! Sorry!", {
//             description: result.message,
//             duration: 5000,
//           });
//         }
//       } catch (error) {
//         if (
//           error instanceof ConvexError &&
//           error.message.includes("joined the waiting list too many times")
//         ) {
//           toast.error("Slow down there!", {
//             description: error.data,
//             duration: 5000,
//           });
//         } else {
//           console.error("Error joining waiting list:", error);
//           toast.error("Uh oh! Something went wrong.", {
//             description: "Failed to join queue. Please try again later.",
//           });
//         }
//       }
//     } else if (!userId && name && email) {
//       startTransition(async () => {
//         try {
//           const guestUser = await createGuestUserMutation({
//             name,
//             email,
//           });

//           if (!guestUser) {
//             toast.error("Failed to create guest user. Please try again.");
//             return;
//           }
//           setGuestToken(guestUser.guestToken);
//           setGuestInfo({
//             id: guestUser.guestUserId,
//             name,
//             email,
//           });

//           const result = await joinWaitingList({
//             eventId,
//             userId: guestUser.guestUserId,
//             ticketTypeId,
//             selectedCount,
//             promoCodeId,
//           });

//           if (result.success) {
//             console.log("Successfully joined waiting list as guest");
//             toast.success(result.message, {
//               duration: 5000,
//             });
//           } else {
//             toast.error("Uh! Oh! Sorry!", {
//               description: result.message,
//               duration: 5000,
//             });
//           }
//         } catch (error) {
//           if (
//             error instanceof ConvexError &&
//             error.message.includes("joined the waiting list too many times")
//           ) {
//             toast.error("Slow down there!", {
//               description: error.data,
//               duration: 5000,
//             });
//           } else {
//             console.error("Error joining waiting list:", error);
//             toast.error("Uh oh! Something went wrong.", {
//               description: "Failed to join queue. Please try again later.",
//             });
//           }
//         }
//       });
//     }
//   };

//   if (queuePosition === undefined || availability === undefined || !event) {
//     return <Skeleton className="w-full h-12 " />;
//   }

//   if (userTicket) {
//     return null;
//   }

//   const isPastEvent = event.eventDate < Date.now();
//   return (
//     <div>
//       {(!queuePosition ||
//         queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
//         (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
//           queuePosition.offerExpiresAt &&
//           queuePosition.offerExpiresAt <= Date.now())) && (
//         <>
//           {isEventOwner ? (
//             <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
//               <OctagonXIcon className="w-5 h-5" />
//               <span>You cannot buy a ticket for your own event</span>
//             </div>
//           ) : isPastEvent ? (
//             <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
//               <Clock className="w-5 h-5" />
//               <span>Event has ended</span>
//             </div>
//           ) : availability.purchasedCount >= availability?.totalTickets ? (
//             <div className="text-center p-3">
//               <p className="text-md font-semibold text-red-600">
//                 Sorry, this ticket type is sold out
//               </p>
//             </div>
//           ) : (
//             <button
//               onClick={handleJoinQueue}
//               className="w-full px-6 py-3 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
//               disabled={isPending}
//             >
//               Buy Ticket
//             </button>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

"use client";

import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { Clock, OctagonXIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { WAITING_LIST_STATUS } from "@/convex/constants";
import { useTransition, useCallback, useMemo } from "react";
import { useGuest } from "@/components/providers/GuestProvider";
import { Button } from "../ui/button";

interface JoinQueueProps {
  eventId: Id<"events">;
  userId?: string;
  ticketTypeId: Id<"ticketTypes">;
  selectedCount: number;
  promoCodeId?: Id<"promoCodes">;
  name?: string;
  email?: string;
}

export default function JoinQueue({
  eventId,
  userId,
  ticketTypeId,
  selectedCount,
  promoCodeId,
  name,
  email,
}: JoinQueueProps) {
  const joinWaitingList = useMutation(api.events.joinWaitingList);
  const createGuestUserMutation = useMutation(api.users.createGuestUser);
  const [isPending, startTransition] = useTransition();
  const { setGuestToken, setGuestInfo } = useGuest();

  // Only fetch data when we have required params
  const shouldFetchData = Boolean(ticketTypeId && eventId);
  const shouldFetchUserData = shouldFetchData && Boolean(userId);

  const queuePosition = useQuery(
    api.waitingList.getQueuePosition,
    shouldFetchUserData ? { eventId, userId: userId!, ticketTypeId } : "skip",
  );

  const userTicket = useQuery(
    api.tickets.getUserTicketForEvent,
    shouldFetchUserData ? { eventId, userId: userId! } : "skip",
  );

  const availability = useQuery(
    api.events.getEventAvailability,
    shouldFetchData ? { eventId, ticketTypeId } : "skip",
  );

  const event = useQuery(
    api.events.getById,
    shouldFetchData ? { eventId } : "skip",
  );

  // Memoized computed values
  const computedState = useMemo(() => {
    if (!event) return null;

    const isEventOwner = userId && userId === event.userId;
    const isPastEvent = event.eventDate < Date.now();
    const isSoldOut =
      availability && availability.purchasedCount >= availability.totalTickets;
    const hasUserTicket = Boolean(userTicket);
    const isAuthenticated = Boolean(userId);
    const isGuest = !userId && Boolean(name && email);

    const isQueueExpiredOrOffered =
      queuePosition &&
      (queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
        (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
          queuePosition.offerExpiresAt &&
          queuePosition.offerExpiresAt <= Date.now()));

    return {
      isEventOwner,
      isPastEvent,
      isSoldOut,
      hasUserTicket,
      isAuthenticated,
      isGuest,
      canShowButton: !queuePosition || isQueueExpiredOrOffered,
    };
  }, [event, userId, availability, userTicket, queuePosition, name, email]);

  // Centralized error handler
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error ${context}:`, error);

    if (
      error instanceof ConvexError &&
      error.message.includes("joined the waiting list too many times")
    ) {
      toast.error("Slow down there!", {
        description: error.data,
        duration: 5000,
      });
    } else {
      toast.error("Uh oh! Something went wrong.", {
        description: `Failed to ${context}. Please try again later.`,
        duration: 5000,
      });
    }
  }, []);

  // Success handler
  const handleSuccess = useCallback((message: string) => {
    toast.success(message, { duration: 5000 });
  }, []);

  // Join queue for authenticated users
  const joinQueueAsUser = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await joinWaitingList({
        eventId,
        userId,
        ticketTypeId,
        selectedCount,
        promoCodeId,
      });

      if (result.success) {
        handleSuccess(result.message);
      } else {
        toast.error("Uh! Oh! Sorry!", {
          description: result.message,
          duration: 5000,
        });
      }
    } catch (error) {
      handleError(error, "join queue");
    }
  }, [
    eventId,
    userId,
    ticketTypeId,
    selectedCount,
    promoCodeId,
    joinWaitingList,
    handleSuccess,
    handleError,
  ]);

  // Join queue for guest users
  const joinQueueAsGuest = useCallback(async () => {
    if (!name || !email) return;

    try {
      const guestUser = await createGuestUserMutation({ name, email });

      if (!guestUser) {
        toast.error("Failed to create guest user. Please try again.");
        return;
      }

      // Update guest context
      setGuestToken(guestUser.guestToken);
      setGuestInfo({
        id: guestUser.guestUserId,
        name,
        email,
      });

      // Join waiting list as guest
      const result = await joinWaitingList({
        eventId,
        userId: guestUser.guestUserId,
        ticketTypeId,
        selectedCount,
        promoCodeId,
      });

      if (result.success) {
        handleSuccess(result.message);
      } else {
        toast.error("Uh! Oh! Sorry!", {
          description: result.message,
          duration: 5000,
        });
      }
    } catch (error) {
      handleError(error, "join queue as guest");
    }
  }, [
    name,
    email,
    createGuestUserMutation,
    setGuestToken,
    setGuestInfo,
    eventId,
    ticketTypeId,
    selectedCount,
    promoCodeId,
    joinWaitingList,
    handleSuccess,
    handleError,
  ]);

  // Main handler
  const handleJoinQueue = useCallback(async () => {
    if (userId) {
      await joinQueueAsUser();
    } else if (name && email) {
      startTransition(() => joinQueueAsGuest());
    } else {
      // Handle case where neither authenticated user nor guest info is provided
      toast.error("Please provide your information to continue", {
        description: "Name and email are required for guest purchases.",
        duration: 5000,
      });
    }
  }, [userId, name, email, joinQueueAsUser, joinQueueAsGuest]);

  // Loading state
  if (!shouldFetchData || availability === undefined || !event) {
    return <Skeleton className="w-full h-12" />;
  }

  // For authenticated users, wait for queue position and user ticket data
  if (userId && (queuePosition === undefined || userTicket === undefined)) {
    return <Skeleton className="w-full h-12" />;
  }

  // Early return if user already has ticket
  if (computedState?.hasUserTicket) {
    return null;
  }

  // Don't show button if user is in active queue
  if (!computedState?.canShowButton) {
    return null;
  }

  // Render different button states
  const renderButton = () => {
    if (computedState?.isEventOwner) {
      return (
        <div
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg"
          role="alert"
          aria-label="Cannot purchase own event"
        >
          <OctagonXIcon className="w-5 h-5" aria-hidden="true" />
          <span>You cannot buy a ticket for your own event</span>
        </div>
      );
    }

    if (computedState?.isPastEvent) {
      return (
        <div
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg"
          role="alert"
          aria-label="Event has ended"
        >
          <Clock className="w-5 h-5" aria-hidden="true" />
          <span>Event has ended</span>
        </div>
      );
    }

    if (computedState?.isSoldOut) {
      return (
        <div className="text-center p-3" role="alert">
          <p className="text-md font-semibold text-red-600">
            Sorry, this ticket type is sold out
          </p>
        </div>
      );
    }

    // Check if user can actually purchase (authenticated or has guest info)
    const canPurchase =
      computedState?.isAuthenticated || computedState?.isGuest;
    const buttonText = computedState?.isAuthenticated
      ? "Buy Ticket"
      : computedState?.isGuest
        ? "Buy Ticket as Guest"
        : "Login Required";

    return (
      <Button
        onClick={handleJoinQueue}
        disabled={isPending || !canPurchase}
        className="w-full font-semibold"
        aria-label={`${buttonText} - ${selectedCount} ticket${selectedCount > 1 ? "s" : ""}`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
            Processing...
          </>
        ) : (
          buttonText
        )}
      </Button>
    );
  };

  return <div>{renderButton()}</div>;
}
