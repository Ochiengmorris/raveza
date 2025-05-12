import EventCard from "@/components/events/EventCard";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import React from "react";

const Upcoming = async () => {
  const events =
    (await fetchQuery(api.events.get))
      .filter((e) => e.eventDate > Date.now())
      .splice(0, 4) || [];
  return (
    <section className="py-14 ">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col items-start">
          {/* section heading */}
          <h2
            className={
              "text-black sm:text-[50px] xs:text-[40px] text-[30px] font-bold"
            }
          >
            Upcoming Events
          </h2>

          {/* section subheading */}
          <p className="sm:text-[18px] text-[14px] text-primary uppercase tracking-wider">
            Browse events happening soon
          </p>

          <div className="mt-6 grid grid-cols-2 w-full md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* {!events && renderSkeletons()} */}
            {events &&
              events.map((event) => (
                <EventCard key={event._id} eventId={event._id} motionkey={1} />
              ))}
            {events && events.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-neutral-500">
                  No upcoming events at the moment. Check back soon!
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center w-full  md:hidden">
            <Link
              href="/events"
              className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
            >
              View All Upcoming Events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Upcoming;
