"use client";

import Spinner from "@/components/loaders/Spinner";
import TicketCard from "@/components/tickets/TicketCard";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Ticket } from "lucide-react";

export default function MyTicketsPage() {
  const { user } = useUser();
  const tickets = useQuery(api.events.getUserTickets, {
    userId: user?.id ?? "",
  });

  if (!tickets)
    return (
      <div className=" absolute top-1/2 right-1/2">
        <Spinner />
      </div>
    );

  const validTickets = tickets.filter((t) => t.status === "valid");
  const otherTickets = tickets.filter((t) => t.status !== "valid");

  const upcomingTickets = validTickets.filter(
    (t) => t.event && t.event.eventDate > Date.now(),
  );
  const pastTickets = validTickets.filter(
    (t) => t.event && t.event.eventDate <= Date.now(),
  );

  return (
    <div className="h-full bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                My Tickets
              </h1>
              <div className="bg-white md:hidden px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Ticket className="w-5 h-5" />
                  <span className="font-medium">
                    {tickets.length} Total Tickets
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-foreground/70 text-sm md:text-base">
              Manage and view all your tickets in one place
            </p>
          </div>
          <div className="bg-white hidden md:flex shrink-0 px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <div className="flex shrink-0 items-center gap-2 text-gray-600">
              <Ticket className="w-5 h-5" />
              <span className="font-medium">
                {tickets.length} Total Tickets
              </span>
            </div>
          </div>
        </div>

        {upcomingTickets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTickets.map((ticket) => (
                <TicketCard key={ticket._id} ticketId={ticket._id} />
              ))}
            </div>
          </div>
        )}

        {pastTickets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold  mb-4">Past Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTickets.map((ticket) => (
                <TicketCard key={ticket._id} ticketId={ticket._id} />
              ))}
            </div>
          </div>
        )}

        {otherTickets.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold  mb-4">Other Tickets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherTickets.map((ticket) => (
                <TicketCard key={ticket._id} ticketId={ticket._id} />
              ))}
            </div>
          </div>
        )}

        {tickets.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">
              No tickets yet
            </h3>
            <p className="text-gray-600 mt-1">
              When you purchase tickets, they&apos;ll appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
