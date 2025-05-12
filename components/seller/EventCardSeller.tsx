"use client";

import React from "react";
import { EventDataProps } from "./UpcomingEvents";
import { formatDate, useStorageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, EyeIcon, MapPin, Trash2, Users } from "lucide-react";
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
      className="overflow-hidden hover:shadow-lg p-2 bg-transparent border-none md:shadow-xs transition-shadow duration-300 ease-in-out"
    >
      <div
        className="bg-cover bg-center relative aspect-1/1 rounded-xl overflow-hidden"
        style={{
          backgroundImage: event.imageStorageId
            ? `url(${imageUrl})`
            : "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60')",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <CardContent className="pb-5 p-0">
        <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">
          {event.name}
        </h3>

        <Badge className="mb-2" variant="date">
          {event.category}
        </Badge>

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 mt-0.5" />
            <span>{eventDate}</span>
            <span>{event.startTime ?? "N/A"}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 mt-0.5 " />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4 mt-0.5" />
            <span>{event.metrics.totalTickets} capacity</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-2 w-full">
          <div className="flex md:gap-2 justify-evenly md:justify-start w-full">
            <Button variant="default" size="sm">
              <EyeIcon className="h-4 w-4" />
              <span className="hidden md:block"> View</span>
            </Button>

            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 md:mr-1" />
              <span className="hidden md:block"> Edit</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-600 sm:hidden hover:bg-red-50"
              onClick={() => onDelete(event._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 hidden sm:block  hover:bg-red-50"
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
