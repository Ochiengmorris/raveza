import React from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import EventCardSkeleton from "@/components/events/EventCardSkeleton";
import Link from "next/link";
import EventCard from "@/components/events/EventCard";

const FeaturedEventsSection = async () => {
  const events =
    (await fetchQuery(api.events.get))
      .filter((e) => e.eventDate > Date.now())
      .splice(0, 3) || [];

  // Generate skeleton loaders when loading
  const renderSkeletons = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <EventCardSkeleton key={index} />
    ));
  };
  return (
    <section className="py-16 bg-background/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className=" text-landingsecondary sm:text-[50px] xs:text-[40px] text-[30px] font-bold">
              Featured Events
            </h2>
            <p className="sm:text-[18px] text-[14px] text-primary-foreground uppercase tracking-wider">
              Don&apos;t miss out on these popular events
            </p>
          </div>{" "}
          <Link
            href="/events"
            className="hidden md:flex items-center text-primary-foreground/80 hover:text-primary-foreground hover:underline-offset-4 hover:underline  font-medium"
          >
            View All Events
          </Link>
        </div>

        <div className="grid grid-cols-2 w-full md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {!events && renderSkeletons()}
          {events &&
            events.map((event) => (
              <EventCard motionkey={1} key={event._id} eventId={event._id} />
            ))}
          {events && events.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-neutral-500">
                No featured events at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEventsSection;
