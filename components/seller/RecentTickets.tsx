"use client";

import { format } from "date-fns";
import {
  Badge,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  FilterIcon,
  MoreVerticalIcon,
  SearchIcon,
  TicketIcon,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import AvatarNameImage from "@/components/other/AvatarNameImage";

interface RecentTicketsProps {
  tickets?: TicketProps[];
  isLoading?: boolean;
}

export interface TicketProps {
  _id: Id<"tickets">;
  amount?: number;
  eventId: Id<"events">;
  count: number;
  status: string;
  paymentIntentId?: string;
  ticketTypeId: Id<"ticketTypes">;
  purchasedAt: number;
  userId: string;
  ticketType: {
    name?: string;
    price?: number;
  };
  event: {
    name?: string;
    eventDate?: number;
    location?: string;
  };
  user: {
    name?: string;
    email?: string;
  };
}

const RecentTickets = ({ tickets, isLoading = false }: RecentTicketsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Filter tickets based on search
  const filteredTickets = tickets
    ? tickets
        .filter((ticket: TicketProps) => {
          return (
            searchQuery === "" ||
            ticket.user?.name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            ticket.user?.email
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
        })
        .sort((a, b) => {
          return (
            new Date(b.purchasedAt).getTime() -
            new Date(a.purchasedAt).getTime()
          );
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
    <Card className="border border-slate-200 bg-card mb-6 p-0">
      <div className="border-b border-slate-200 px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-lg text-slate-900">
          Recent <span className="hidden lg:inline"> Ticket</span> Purchases
        </h2>
        <div className="mt-2 sm:mt-0 flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 h-9 text-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <FilterIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="">
        {isLoading ? (
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
              {searchQuery
                ? "No tickets match your search criteria. Try adjusting your search."
                : "No tickets have been purchased for your events yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto px-4">
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
                {paginatedTickets.map((ticket: TicketProps) => (
                  <TableRow key={ticket._id} className=" border-none">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                          <AvatarNameImage
                            name={ticket.user?.name || "User"}
                            className="h-8 w-8"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-slate-900 ">
                            {ticket.user?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {ticket.user?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-900 line-clamp-2">
                        {ticket.event?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {ticket.event?.eventDate &&
                          formatDate(
                            new Date(ticket.event.eventDate).toISOString(),
                          )}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(new Date(ticket.purchasedAt).toISOString())}
                      <br />
                      <span className="text-xs">
                        {formatTime(new Date(ticket.purchasedAt).toISOString())}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">
                      {ticket.ticketType?.name || "Standard"}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-900">
                      KSh {Number(ticket.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900"
                      >
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 0 && (
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
                  <span className="font-medium">{filteredTickets.length}</span>{" "}
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
                    <span className="sr-only">Previous</span>
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
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentTickets;
