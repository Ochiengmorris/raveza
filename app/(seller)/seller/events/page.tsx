"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  DownloadIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import CreateEventModal from "@/components/seller/CreateEventModal";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import EventCardSeller from "@/components/seller/EventCardSeller";
import { cn } from "@/lib/utils";

const SellerEventsPage = () => {
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { user } = useUser();

  const events = useQuery(api.events.getSellerEvents, {
    userId: user?.id ?? "",
  });

  const componentLoadingStates = useMemo(() => {
    return {
      eventsLoading: events === undefined,
    };
  }, [events]);

  if (!user) return null;

  // const events: any = [];

  const categories = [
    "Music",
    "Sports",
    "Arts",
    "Food & Drink",
    "Technology",
    "Travel",
  ];

  // Filter events based on search query and category filter
  const filteredEvents = events
    ? events.filter((event) => {
        const matchesSearch =
          searchQuery === "" ||
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          categoryFilter === "all" || event.category === categoryFilter;

        return matchesSearch && matchesCategory;
      })
    : [];

  // Handle delete event
  const handleDeleteEvent = (eventId: Id<"events">) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      // delete event logic
      console.log(eventId);
    }
  };

  // Function to render category name from ID
  // const getCategoryName = (categoryname: string) => {
  //   if (!categories) return "";
  //   const category = categories.find((cat: any) => cat.id === categoryId);
  //   return category ?  : "";
  // };

  // if (!events) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <Spinner />
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Events</h1>
            <p className="text-slate-500 mt-1">
              Manage your upcoming and past events
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 cursor-pointer"
            >
              <DownloadIcon className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => setIsCreateEventModalOpen(true)}
              className="bg-jmprimary text-primary-foreground hover:bg-jmprimary/50 cursor-pointer"
              size="sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              New Event
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search events..."
              className={cn("focus:ring-0 focus:border-0 pl-10")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <div className="flex items-center text-secondary-foreground">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories &&
                  categories.map((category, index) => (
                    <SelectItem key={index} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {componentLoadingStates.eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="overflow-hidden ">
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="bg-slate-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                No events found
              </h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                {searchQuery || categoryFilter !== "all"
                  ? "No events match your search criteria. Try adjusting your filters."
                  : "You don't have any events yet. Create your first event to get started."}
              </p>
              <Button
                onClick={() => setIsCreateEventModalOpen(true)}
                className="bg-primary/80 hover:bg-primary cursor-pointer"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Create New Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCardSeller
                key={event._id}
                event={event}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        )}
      </div>

      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
      />
    </>
  );
};

export default SellerEventsPage;
