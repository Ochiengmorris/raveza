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
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AvatarNameImage from "@/components/other/AvatarNameImage";

const TicketsPage = () => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tickets = useQuery(api.tickets.getAllUserTickets, {
    userId: user?.id ?? "",
  });
  const events = useQuery(api.events.getSellerEvents, {
    userId: user?.id ?? "",
  });

  if (!user) return null;

  // const tickets: Ticket[] = [];

  const isLoadingEvents = false;
  const isLoadingTickets = false;

  // Filter tickets based on search, status and event
  const filteredTickets = tickets
    ? tickets.filter((ticket) => {
        const matchesSearch =
          searchQuery === "" ||
          ticket.user?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          ticket.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || ticket.status === statusFilter;
        const matchesEvent =
          eventFilter === "all" || ticket.eventId.toString() === eventFilter;

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

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
      case "used":
        return <Badge className="bg-amber-100 text-amber-800">Used</Badge>;
      case "refunded":
        return <Badge className="bg-red-100 text-red-800">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-500 mt-1">
            View and manage tickets purchased for your events
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-row gap-2 lg:gap-4">
        <div className="relative flex-1 lg:flex">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by customer name or email..."
            className={"focus:ring-0 focus:border-0  pl-10"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="">
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

        <div className="max-w-xs overflow-hidden lg:w-fit ">
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger>
              <div className="flex items-center overflow-hidden">
                <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="All Events" className="truncate" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events &&
                events.map((event) => (
                  <SelectItem key={event._id} value={event._id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden p-0 lg:px-4 px-2 py-2">
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
                    <TableRow key={ticket._id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                            <AvatarNameImage
                              name={ticket.user?.name || ""}
                              className="h-8 w-8"
                            />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-slate-900">
                              {ticket.user?.name || "Anonymus"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {ticket.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-900">
                          {ticket.event.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {events &&
                            events?.find((e) => e._id === ticket.eventId)
                              ?.eventDate &&
                            formatDate(
                              new Date(
                                events.find((e) => e._id === ticket.eventId)
                                  ?.eventDate || 0,
                              ).toISOString(),
                            )}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(new Date(ticket.purchasedAt).toISOString())}
                        <br />
                        <span className="text-xs">
                          {formatTime(
                            new Date(ticket.purchasedAt).toISOString(),
                          )}
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
