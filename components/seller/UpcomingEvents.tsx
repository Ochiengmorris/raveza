"use client";

import {
  CalendarIcon,
  MapPinIcon,
  TicketIcon,
  ChevronRightIcon,
  Badge,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { Metrics } from "@/convex/events";

interface UpcomingEventsProps {
  events?: EventDataProps[];
  isLoading?: boolean;
}

export interface EventDataProps {
  _id: Id<"events">;
  name: string;
  eventDate: number;
  category?: string;
  imageStorageId?: Id<"_storage">;
  startTime?: string;
  location: string;
  userId: string;
  description: string;
  metrics: Metrics;
}

const UpcomingEventsPage = ({
  events,
  isLoading = false,
}: UpcomingEventsProps) => {
  // Only show upcoming events (date is in the future)
  const getUpcomingEvents = () => {
    if (!events) return [];

    const today = new Date();

    return events
      .filter((event) => new Date(event.eventDate) >= today)
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
      )
      .slice(0, 2);
  };

  const upcomingEvents = getUpcomingEvents();
  // const upcomingEvents = events;

  // Helper function to get category name
  // const getCategoryName = (categoryId: number) => {
  //   if (!categoryId) return "";

  //   // This is a mock implementation since we don't have a categories array
  //   switch (categoryId) {
  //     case 1:
  //       return "Music";
  //     case 2:
  //       return "Tech";
  //     case 3:
  //       return "Business";
  //     case 4:
  //       return "Sports";
  //     case 5:
  //       return "Arts";
  //     default:
  //       return "";
  //   }
  // };

  // Helper function to get category style
  const getCategoryStyle = (categoryName: string) => {
    if (!categoryName) return "bg-slate-100 text-slate-800";

    switch (categoryName) {
      case "Music":
        return "bg-pink-100 text-pink-800"; // Music
      case "Sports":
        return "bg-blue-100 text-blue-800"; // Tech
      case "Arts":
        return "bg-jmprimary/10 text-jmprimary"; // Business
      case "Food & Drink":
        return "bg-emerald-100 text-emerald-800"; // Sports
      case "Technology":
        return "bg-amber-100 text-amber-800"; // Arts
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Helper function to calculate tickets progress percentage
  const calculateProgress = (event: EventDataProps) => {
    if (!event)
      return {
        sold: 0,
        capacity: 0,
        percentage: 0,
      };

    const percentage = Math.round(
      (event.metrics.soldTickets / event.metrics.totalTickets) * 100,
    );

    return {
      sold: event.metrics.soldTickets,
      capacity: event.metrics.totalTickets,
      percentage: percentage,
    };
  };

  return (
    <Card className="border border-slate-200 bg-white p-0 pb-2">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="font-semibold text-lg text-slate-900">
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {isLoading ? (
          // Loading state
          <div className="">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : upcomingEvents?.length === 0 ? (
          // No events state
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No upcoming events
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Create your first event to get started
            </p>
            <Link
              href="/admin/events"
              className="text-jmprimary hover:text-jmprimary text-sm font-medium"
            >
              Go to Events
            </Link>
          </div>
        ) : (
          // Events loaded state
          <>
            {upcomingEvents?.map((event, index) => {
              const progress = calculateProgress(event);
              const categoryName = event.category;
              const categoryStyle = getCategoryStyle(categoryName ?? "");

              const eventDate = formatDate(
                new Date(event.eventDate).toISOString(),
              );

              return (
                <div
                  key={event._id}
                  className={cn(
                    "pb-3 mb-3",
                    index < upcomingEvents.length - 1 &&
                      "border-b border-slate-200",
                  )}
                >
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium text-slate-900">{event.name}</h3>
                    {categoryName && (
                      <Badge className={categoryStyle}>{categoryName}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mb-1">
                    <CalendarIcon className="inline-block h-3.5 w-3.5 mr-1" />
                    <span>{eventDate}</span> •<span className="ml-1">8 AM</span>
                  </div>
                  <div className="text-sm text-slate-500 mb-2">
                    <MapPinIcon className="inline-block h-3.5 w-3.5 mr-1" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">
                      <TicketIcon className="inline-block h-3.5 w-3.5 mr-1" />
                      {
                        <>
                          <span>{progress.sold}</span>/
                          <span>{progress.capacity}</span> tickets sold
                        </>
                      }
                    </span>
                    <span
                      className={cn(
                        "font-medium",

                        progress.percentage >= 75
                          ? "text-green-600"
                          : progress.percentage >= 50
                            ? "text-jmprimary"
                            : progress.percentage >= 25
                              ? "text-amber-600"
                              : "text-red-600",
                      )}
                    >
                      {`${progress.percentage}%`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                    <div
                      className={cn(
                        `h-1.5 rounded-full`,
                        progress.percentage >= 75
                          ? "text-green-600 bg-green-600"
                          : progress.percentage >= 50
                            ? "text-jmprimary bg-jmprimary"
                            : progress.percentage >= 25
                              ? "text-amber-600 bg-amber-600"
                              : "text-red-600 bg-red-600",
                      )}
                      style={{
                        width: `${progress.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <Link
              href="/admin/events"
              className="mt-3 text-jmprimary hover:text-jmprimary text-sm font-medium flex items-center justify-center"
            >
              View all events
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsPage;
