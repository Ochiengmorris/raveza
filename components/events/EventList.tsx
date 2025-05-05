"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { CalendarDays, Loader, Ticket } from "lucide-react";
import React, { useMemo } from "react";
import EventCard from "./EventCard";

const EventList = () => {
  const events = useQuery(api.events.get);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    if (!events) return { upcomingEvents: [], pastEvents: [] };

    const now = Date.now();
    const upcoming = events
      .filter((event) => event.eventDate > now)
      .sort((a, b) => a.eventDate - b.eventDate);

    const past = events
      .filter((event) => event.eventDate <= now)
      .sort((a, b) => b.eventDate - a.eventDate);

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  if (!events) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
      {/* Header */}
      <section className="flex items-center justify-between mb-8">
        <div className="w-full">
          <div className="flex items-center justify-between ">
            <h1 className="text-2xl md:text-3xl heading font-bold text-foreground">
              Upcoming Events
            </h1>
            <div className="bg-white px-1.5 hidden py-0.5 md:hidden rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 text-sm ">
                <CalendarDays className="w-5 h-5 " />
                <span className="font-medium ">
                  {upcomingEvents.length} Upcoming Events
                </span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-primary-foreground text-sm md:text-base">
            Discover & book tickets for amazing events
          </p>
        </div>
        <div className="bg-white md:block shrink-0 hidden px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="w-5 h-5" />
            <span className="font-medium">
              {upcomingEvents.length} Upcoming Events
            </span>
          </div>
        </div>
      </section>

      {/* Upcoming Events Grid */}
      {upcomingEvents.length > 0 ? (
        <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-6 mb-12">
          {upcomingEvents.map((event, index) => (
            <EventCard key={event._id} motionkey={index} eventId={event._id} />
          ))}
        </section>
      ) : (
        <div className="border bg-card text-card-foreground rounded-xl shadow-lg p-12 text-center mb-12">
          <Ticket className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No upcoming events</h3>
          <p className="text-muted-foreground mt-1">
            Check back later for new events
          </p>
        </div>
      )}

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-2xl md:text-3xl heading font-bold text-foreground mb-6">
            <span className="text-destructive">Past</span> Events
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-6">
            {pastEvents.map((event, index) => (
              <EventCard
                key={event._id}
                motionkey={index}
                eventId={event._id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EventList;
