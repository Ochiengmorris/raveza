"use client";

import CreateEventModal from "@/components/seller/CreateEventModal";
import RecentTickets from "@/components/seller/RecentTickets";
import RevenueChart from "@/components/seller/RevenueChart";
import StatsOverview from "@/components/seller/StatsOverview";
import UpcomingEvents from "@/components/seller/UpcomingEvents";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { mockMonthlyRevenue } from "@/lib/convex";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { DownloadIcon, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

const Overview = () => {
  const { user } = useUser();
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

  const eventMetrics = useQuery(api.events.getAllUserEventsMetrics, {
    userId: user?.id ?? "",
  });
  const eventWithMetrics = useQuery(api.events.getSellerEvents, {
    userId: user?.id ?? "",
  });
  const monthlyRevenue = useQuery(api.events.getMonthlyRevenue, {
    userId: user?.id ?? "",
  });
  const ticketDetails = useQuery(api.tickets.getAllUserTickets, {
    userId: user?.id ?? "",
  });

  // Memoize loading state to prevent unnecessary re-renders
  const isLoading = useMemo(() => {
    return (
      eventMetrics === undefined ||
      eventWithMetrics === undefined ||
      monthlyRevenue === undefined ||
      ticketDetails === undefined
    );
  }, [eventMetrics, eventWithMetrics, monthlyRevenue, ticketDetails]);

  // Memoize any data transformations you need to perform
  const formattedRevenue = useMemo(() => {
    return monthlyRevenue || mockMonthlyRevenue;
  }, [monthlyRevenue]);

  console.log(isLoading, formattedRevenue);
  // Memoized component loading states
  const componentLoadingStates = useMemo(() => {
    return {
      statsLoading: eventMetrics === undefined,
      eventsLoading: eventWithMetrics === undefined,
      revenueLoading: monthlyRevenue === undefined,
      ticketsLoading: ticketDetails === undefined,
    };
  }, [eventMetrics, eventWithMetrics, monthlyRevenue, ticketDetails]);

  if (!user) return null;

  return (
    <>
      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">
              Welcome back, {user?.fullName || user?.username}! Here&#39;s
              what&#39;s happening with your events.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <DownloadIcon className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => setIsCreateEventModalOpen(true)}
              className="bg-secondary-foreground/5 text-primary-foreground hover:bg-jmprimary/50"
              size="sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              New Event
            </Button>
          </div>
        </div>

        <StatsOverview
          stats={eventMetrics?.stats}
          isLoading={componentLoadingStates.statsLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <RevenueChart
            className="lg:col-span-2"
            data={mockMonthlyRevenue}
            isLoading={componentLoadingStates.revenueLoading}
          />
          <UpcomingEvents
            events={eventWithMetrics}
            isLoading={componentLoadingStates.eventsLoading}
          />
        </div>

        <RecentTickets
          tickets={ticketDetails}
          isLoading={componentLoadingStates.ticketsLoading}
        />
      </div>

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
      />
    </>
  );
};

export default Overview;
