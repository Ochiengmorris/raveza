"use client";

import EventCard from "@/components/events/EventCard";
import Spinner from "@/components/loaders/Spinner";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const searchResults = useQuery(api.events.search, { searchTerm: query });

  if (!searchResults) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const upcomingEvents = searchResults
    .filter((event) => event.eventDate > Date.now())
    .sort((a, b) => a.eventDate - b.eventDate);

  const pastEvents = searchResults
    .filter((event) => event.eventDate <= Date.now())
    .sort((a, b) => b.eventDate - a.eventDate);

  return (
    <div className="h-full bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Results Header */}
        <div className="flex items-center gap-3 mb-8">
          <Search className="w-6 h-6 text-foreground" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Search Results for &quot;{query}&quot;
            </h1>
            <p className="text-secondary-foreground mt-1">
              Found {searchResults.length} events
            </p>
          </div>
        </div>

        {/* No Results State */}
        {searchResults.length === 0 && (
          <div className="text-center border py-12 bg-card shadow-lg text-card-foreground rounded-xl">
            <Search className="w-12 h-12  mx-auto mb-4" />
            <h3 className="text-lg font-medium">No events found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search terms or browse all events
            </p>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <EventCard
                  key={event._id}
                  motionkey={index}
                  eventId={event._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Past Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event, index) => (
                <EventCard
                  key={event._id}
                  motionkey={index}
                  eventId={event._id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
