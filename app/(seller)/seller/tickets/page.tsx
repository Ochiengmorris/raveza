"use client";

import React, { useState, useMemo, useCallback } from "react";
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
  RefreshCwIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { formatDate } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AvatarNameImage from "@/components/other/AvatarNameImage";

// Types
interface FilterState {
  search: string;
  status: string;
  event: string;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

// Constants
const ITEMS_PER_PAGE = 9;
const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "valid", label: "Valid" },
  { value: "used", label: "Used" },
  { value: "refunded", label: "Refunded" },
] as const;

const STATUS_STYLES = {
  valid: "bg-green-100 text-green-800 border-green-200",
  used: "bg-amber-100 text-amber-800 border-amber-200",
  refunded: "bg-red-100 text-red-800 border-red-200",
  default: "bg-slate-100 text-slate-800 border-slate-200",
} as const;

const TicketsPage = () => {
  const { user } = useUser();

  // State management
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    event: "all",
  });

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  // Data fetching
  const tickets = useQuery(api.tickets.getAllUserTickets, {
    userId: user?.id ?? "",
  });

  const events = useQuery(api.events.getSellerEvents, {
    userId: user?.id ?? "",
  });

  const isLoading = tickets === undefined || events === undefined;

  // Memoized filtered and paginated data
  const { filteredTickets, paginatedTickets, totalPages, eventsMap } =
    useMemo(() => {
      if (!tickets || !events) {
        return {
          filteredTickets: [],
          paginatedTickets: [],
          totalPages: 0,
          eventsMap: new Map(),
        };
      }

      // Create a map of events for quick lookup
      const eventsMap = new Map(events.map((event) => [event._id, event]));

      const filtered = tickets.filter((ticket) => {
        const matchesSearch =
          !filters.search ||
          ticket.user?.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          ticket.user?.email
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          ticket.event?.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase());

        const matchesStatus =
          filters.status === "all" || ticket.status === filters.status;
        const matchesEvent =
          filters.event === "all" ||
          ticket.eventId.toString() === filters.event;

        return matchesSearch && matchesStatus && matchesEvent;
      });

      const totalPages = Math.ceil(filtered.length / pagination.itemsPerPage);
      const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const paginated = filtered.slice(
        startIndex,
        startIndex + pagination.itemsPerPage,
      );

      return {
        filteredTickets: filtered,
        paginatedTickets: paginated,
        totalPages,
        eventsMap,
      };
    }, [tickets, events, filters, pagination]);

  // Event handlers
  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ search: "", status: "all", event: "all" });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  // Helper functions
  const formatTime = useCallback((dateString: string | number) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch {
      return "N/A";
    }
  }, []);

  const renderStatusBadge = useCallback((status: string) => {
    const statusKey = status as keyof typeof STATUS_STYLES;
    const style = STATUS_STYLES[statusKey] || STATUS_STYLES.default;

    return (
      <Badge className={`${style} border font-medium`} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }, []);

  const getTicketActions = useCallback(
    (ticketId: string) => [
      {
        label: "View Details",
        icon: EyeIcon,
        onClick: () => console.log("View ticket:", ticketId),
        className: "text-blue-600 hover:text-blue-700",
      },
    ],
    [],
  );

  // Early return for unauthenticated users
  if (!user) return null;

  const hasActiveFilters =
    filters.search || filters.status !== "all" || filters.event !== "all";
  const showPagination = totalPages > 1;

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-600 mt-1">
            View and manage tickets purchased for your events
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-slate-600"
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
          <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {filteredTickets.length} ticket
            {filteredTickets.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by customer name, email, or event..."
            className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px] border-slate-300">
            <div className="flex items-center">
              <FilterIcon className="h-4 w-4 mr-2 text-slate-400" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.event}
          onValueChange={(value) => handleFilterChange("event", value)}
        >
          <SelectTrigger className="w-full sm:w-[200px] border-slate-300">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events?.map((event) => (
              <SelectItem key={event._id} value={event._id.toString()}>
                <span className="truncate">{event.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            // Loading state
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[300px]" />
                      <Skeleton className="h-3 w-[200px]" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ) : filteredTickets.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-16">
              <TicketIcon className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                {hasActiveFilters ? "No matching tickets" : "No tickets found"}
              </h3>
              <p className="text-sm text-slate-500 text-center max-w-md mb-4">
                {hasActiveFilters
                  ? "No tickets match your current search criteria. Try adjusting your filters."
                  : "No tickets have been purchased for your events yet."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            // Data table
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="font-semibold text-slate-700">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Event
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Purchase Date
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Ticket Type
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTickets.map((ticket) => {
                    const eventData = eventsMap.get(ticket.eventId);

                    return (
                      <TableRow
                        key={ticket._id}
                        className="border-slate-100 hover:bg-slate-50"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <AvatarNameImage
                              name={ticket.user?.name || "Anonymous"}
                              className="h-10 w-10 rounded-full"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {ticket.user?.name || "Anonymous"}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {ticket.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {ticket.event?.name || "Unknown Event"}
                            </p>
                            {eventData?.eventDate && (
                              <p className="text-xs text-slate-500">
                                {formatDate(
                                  new Date(eventData.eventDate).toISOString(),
                                )}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div>
                            <p className="text-sm text-slate-900">
                              {formatDate(
                                new Date(ticket.purchasedAt).toISOString(),
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatTime(ticket.purchasedAt)}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <span className="text-sm text-slate-900">
                            {ticket.ticketType?.name || "Standard"}
                          </span>
                        </TableCell>

                        <TableCell className="py-4">
                          <span className="text-sm font-semibold text-slate-900">
                            KSh {Number(ticket.amount || 0).toLocaleString()}
                          </span>
                        </TableCell>

                        <TableCell className="py-4">
                          {renderStatusBadge(ticket.status)}
                        </TableCell>

                        <TableCell className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-slate-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {getTicketActions(ticket._id).map(
                                (action, index) => (
                                  <DropdownMenuItem
                                    key={index}
                                    onClick={action.onClick}
                                    className={action.className}
                                  >
                                    <action.icon className="h-4 w-4 mr-2" />
                                    {action.label}
                                  </DropdownMenuItem>
                                ),
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {showPagination && (
                <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing{" "}
                    <span className="font-medium">
                      {Math.min(
                        (pagination.currentPage - 1) * pagination.itemsPerPage +
                          1,
                        filteredTickets.length,
                      )}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.currentPage * pagination.itemsPerPage,
                        filteredTickets.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredTickets.length}
                    </span>{" "}
                    tickets
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>

                    <span className="text-sm text-slate-600 px-2">
                      Page {pagination.currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={pagination.currentPage === totalPages}
                      className="h-8 w-8 p-0"
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
