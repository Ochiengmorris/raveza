"use client";

import {
  CalendarIcon,
  MapPinIcon,
  TicketIcon,
  ChevronRightIcon,
  ClockIcon,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { Metrics } from "@/convex/events";

interface UpcomingEventsProps {
  events?: EventDataProps[];
  isLoading?: boolean;
  maxEvents?: number;
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

// Category styling configuration
const CATEGORY_STYLES = {
  Music: "bg-pink-100 text-pink-800 border-pink-200",
  Sports: "bg-blue-100 text-blue-800 border-blue-200",
  Arts: "bg-purple-100 text-purple-800 border-purple-200",
  "Food & Drink": "bg-emerald-100 text-emerald-800 border-emerald-200",
  Technology: "bg-amber-100 text-amber-800 border-amber-200",
  Business: "bg-indigo-100 text-indigo-800 border-indigo-200",
  default: "bg-slate-100 text-slate-800 border-slate-200",
} as const;

// Progress bar color configuration
const PROGRESS_COLORS = [
  { threshold: 75, color: "bg-green-600", textColor: "text-green-600" },
  { threshold: 50, color: "bg-blue-600", textColor: "text-blue-600" },
  { threshold: 25, color: "bg-amber-600", textColor: "text-amber-600" },
  { threshold: 0, color: "bg-red-600", textColor: "text-red-600" },
] as const;

const UpcomingEventsPage = ({
  events = [],
  isLoading = false,
  maxEvents = 2,
}: UpcomingEventsProps) => {
  // Memoize upcoming events calculation
  const upcomingEvents = useMemo(() => {
    if (!events.length) return [];

    const now = Date.now();
    return events
      .filter((event) => event.eventDate >= now)
      .sort((a, b) => a.eventDate - b.eventDate)
      .slice(0, maxEvents);
  }, [events, maxEvents]);

  // Helper function to get category style
  const getCategoryStyle = (categoryName?: string): string => {
    if (!categoryName) return CATEGORY_STYLES.default;
    return (
      CATEGORY_STYLES[categoryName as keyof typeof CATEGORY_STYLES] ||
      CATEGORY_STYLES.default
    );
  };

  // Helper function to calculate tickets progress
  const calculateProgress = (metrics: Metrics) => {
    const { soldTickets = 0, totalTickets = 0 } = metrics;
    const percentage =
      totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0;

    return {
      sold: soldTickets,
      capacity: totalTickets,
      percentage: Math.min(percentage, 100), // Cap at 100%
    };
  };

  // Helper function to get progress color
  const getProgressColor = (percentage: number) => {
    return (
      PROGRESS_COLORS.find((config) => percentage >= config.threshold) ||
      PROGRESS_COLORS[PROGRESS_COLORS.length - 1]
    );
  };

  // Format time helper
  const formatEventTime = (startTime?: string) => {
    if (!startTime) return "Time TBD";
    try {
      // Assuming startTime is in format "HH:MM" or similar
      return startTime;
    } catch {
      return "Time TBD";
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200 p-0">
        <CardHeader className="p-2 pb-2">
          <CardTitle className="font-semibold text-lg text-slate-900">
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-4">
            {Array.from({ length: maxEvents }, (_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 p-0 gap-0">
      <CardHeader className="p-4">
        <CardTitle className="font-semibold text-lg text-slate-900">
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {upcomingEvents.length === 0 ? (
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
              href="/seller/events"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Go to Events
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        ) : (
          // Events loaded state
          <div className="gap-4">
            {upcomingEvents.map((event, index) => {
              const progress = calculateProgress(event.metrics);
              const categoryStyle = getCategoryStyle(event.category);
              const progressColor = getProgressColor(progress.percentage);
              const eventDate = formatDate(
                new Date(event.eventDate).toISOString(),
              );
              const eventTime = formatEventTime(event.startTime);

              return (
                <article
                  key={event._id}
                  className={cn(
                    "pb-4",
                    index < upcomingEvents.length - 1 &&
                      "border-b border-slate-200",
                  )}
                >
                  {/* Event header */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-900 leading-tight pr-2">
                      {event.name}
                    </h3>
                    {event.category && (
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border shrink-0",
                          categoryStyle,
                        )}
                      >
                        {event.category}
                      </span>
                    )}
                  </div>

                  {/* Event details */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-sm text-slate-600">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                      <span>{eventDate}</span>
                      <span className="mx-1">•</span>
                      <ClockIcon className="h-3.5 w-3.5 mr-1 shrink-0" />
                      <span>{eventTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPinIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Ticket progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-slate-700">
                        <TicketIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                        <span>
                          <span className="font-medium">{progress.sold}</span>
                          <span className="text-slate-500">
                            /{progress.capacity}
                          </span>
                          <span className="ml-1">tickets sold</span>
                        </span>
                      </div>
                      <span
                        className={cn("font-medium", progressColor.textColor)}
                      >
                        {progress.percentage}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          progressColor.color,
                        )}
                        style={{ width: `${progress.percentage}%` }}
                        role="progressbar"
                        aria-valuenow={progress.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${progress.percentage}% of tickets sold`}
                      />
                    </div>
                  </div>
                </article>
              );
            })}

            {/* View all link */}
            <Link
              href="/seller/events"
              className="inline-flex items-center justify-center w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors py-2"
            >
              View all events
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsPage;
