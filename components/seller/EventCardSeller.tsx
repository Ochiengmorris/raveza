"use client";

import React from "react";
import { EventDataProps } from "./UpcomingEvents";
import { cn, formatDate, useStorageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Edit,
  EyeIcon,
  MapPin,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";

const EventCardSeller = ({
  event,
  onDelete,
}: {
  event: EventDataProps;
  onDelete: (eventId: Id<"events">) => void;
}) => {
  const imageUrl = useStorageUrl(event.imageStorageId) ?? "";

  const eventDate = formatDate(new Date(event.eventDate).toISOString());

  return (
    <Card
      key={event._id}
      className="overflow-hidden bg-white border-gray-100 hover:shadow-sm p-0 transition-shadow duration-200 ease-in-out"
    >
      <div
        className="h-40 bg-cover bg-center relative"
        style={{
          backgroundImage: event.imageStorageId
            ? `url(${imageUrl})`
            : "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60')",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute right-[2.5px]">
          <Badge
            className={cn(
              "rounded-none rounded-tr-md",
              event !== undefined ? "bg-primary" : "bg-amber-500",
            )}
          >
            {event !== undefined ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      <CardContent className="pb-5 px-4 ">
        <h3 className="font-semibold text-lg text-slate-900 mb-1 line-clamp-1">
          {event.name}
        </h3>

        {/* Replace with actual category name */}
        {/* {categoryName && ( */}
        <Badge className="mb-2 text-slate-900 bg-primary/10">
          {event.category}
        </Badge>
        {/* )} */}

        <div className="space-y-2 mt-3">
          <div className="flex items-start gap-2 text-sm text-primary-foreground">
            <Calendar className="h-4 w-4 mt-0.5" />
            <span>{eventDate}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-primary-foreground">
            <Clock className="h-4 w-4 mt-0.5" />
            <span>{event.startTime ?? "Start Time"}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-primary-foreground">
            <MapPin className="h-4 w-4 mt-0.5 " />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-primary-foreground">
            <Users className="h-4 w-4 mt-0.5" />
            <span>{event.metrics.totalTickets} capacity</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 w-full">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <EyeIcon className="h-4 w-4" />
              View
            </Button>

            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(event._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCardSeller;
