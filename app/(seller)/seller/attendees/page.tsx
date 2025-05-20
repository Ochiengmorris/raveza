"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SearchIcon,
  MailIcon,
  ExternalLinkIcon,
  CalendarIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const AttendeesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  interface Event {
    id: number;
    name: string;
  }

  interface Attendee {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
    events: number[];
    ticketCount: number;
    totalSpent: number;
  }

  const attendees: Attendee[] = []; // Replace with actual data fetching logic
  const events: Event[] = []; // Replace with actual data fetching logic
  const isLoadingTickets = false; // Replace with actual loading state
  const isLoadingEvents = false; // Replace with actual loading state
  // const isLoadingAttendees = false; // Replace with actual loading state
  // const isLoading = isLoadingTickets || isLoadingEvents || isLoadingAttendees;

  // Filter attendees based on search and event
  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch =
      searchQuery === "" ||
      attendee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEvent =
      eventFilter === "all" || attendee.events.includes(parseInt(eventFilter));

    return matchesSearch && matchesEvent;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const paginatedAttendees = filteredAttendees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendees</h1>
          <p className="text-slate-500 mt-1">
            View all attendees who purchased tickets to your events
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="">
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="All Events" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events &&
                events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-none">
        <CardContent className="p-0">
          {isLoadingTickets || isLoadingEvents ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UserIcon className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                No attendees found
              </h3>
              <p className="text-sm text-slate-500 text-center max-w-md">
                {searchQuery || eventFilter !== "all"
                  ? "No attendees match your search criteria. Try adjusting your filters."
                  : "No one has purchased tickets for your events yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Events Attended</TableHead>
                    <TableHead>Tickets Purchased</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAttendees.map((attendee) => (
                    <TableRow key={attendee.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={
                                attendee.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.fullName)}&background=random`
                              }
                              alt="User avatar"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <p className="ml-3 text-sm font-medium text-slate-900">
                            {attendee.fullName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {attendee.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {attendee.events
                            .slice(0, 3)
                            .map((eventId: number) => (
                              <Badge
                                key={eventId}
                                variant="outline"
                                className="text-xs"
                              >
                                {/* {getEventName(eventId)} */}
                              </Badge>
                            ))}
                          {attendee.events.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{attendee.events.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {attendee.ticketCount}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-900">
                        KSh {attendee.totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-slate-900"
                        >
                          <MailIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-slate-900"
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div className="text-sm text-slate-700">
                    Showing{" "}
                    <span className="font-medium">
                      {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        filteredAttendees.length,
                      )}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredAttendees.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredAttendees.length}
                    </span>{" "}
                    results
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendeesPage;
