"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  FilterIcon,
  EyeIcon,
  MoreVertical,
  TicketIcon,
  CalendarIcon,
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
import { format } from "date-fns";
import { formatDate } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

const TicketsPage = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!user) return null;

  interface User {
    fullName?: string;
    email?: string;
    avatar?: string;
  }

  interface TicketType {
    name: string;
  }

  interface Ticket {
    id: number;
    eventId: number;
    user?: User;
    status: "valid" | "used" | "refunded";
    purchaseDate: string;
    ticketType?: TicketType;
    amount: number;
  }

  interface Event {
    id: number;
    name: string;
    date: string;
  }

  const events: Event[] = [];
  const tickets: Ticket[] = [];

  const isLoadingEvents = false;
  const isLoadingTickets = false;

  // Filter tickets based on search, status and event
  const filteredTickets = tickets
    ? tickets.filter((ticket) => {
        const matchesSearch =
          searchQuery === "" ||
          ticket.user?.fullName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          ticket.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || ticket.status === statusFilter;
        const matchesEvent =
          eventFilter === "all" || ticket.eventId === parseInt(eventFilter);

        return matchesSearch && matchesStatus && matchesEvent;
      })
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Format time
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch (error) {
      console.log(error);
      return "";
    }
  };

  // Get event name by ID
  const getEventName = (eventId: number) => {
    if (!events) return "";
    const event = events.find((event) => event.id === eventId);
    return event ? event.name : "";
  };

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "used":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "refunded":
        return <Badge className="bg-red-100 text-red-800">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-500 mt-1">
            View and manage tickets purchased for your events
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by customer name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <FilterIcon className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-64">
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

      <Card className="overflow-hidden">
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
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <TicketIcon className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                No tickets found
              </h3>
              <p className="text-sm text-slate-500 text-center max-w-md">
                {searchQuery || statusFilter !== "all" || eventFilter !== "all"
                  ? "No tickets match your search criteria. Try adjusting your filters."
                  : "No tickets have been purchased for your events yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Date Purchased</TableHead>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={
                                ticket.user?.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.user?.fullName || "User")}&background=random`
                              }
                              alt="User avatar"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-slate-900">
                              {ticket.user?.fullName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {ticket.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-900">
                          {getEventName(ticket.eventId)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {events &&
                            events?.find((e) => e.id === ticket.eventId)
                              ?.date &&
                            formatDate(
                              events.find((e) => e.id === ticket.eventId)
                                ?.date || "",
                            )}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(ticket.purchaseDate)}
                        <br />
                        <span className="text-xs">
                          {formatTime(ticket.purchaseDate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {ticket.ticketType?.name || "Standard"}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-900">
                        KSh {Number(ticket.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
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
                        filteredTickets.length,
                      )}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredTickets.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredTickets.length}
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

export default TicketsPage;
