"use client";

// import {
//   copyToClipBoard,
//   PromoCode,
// // } from "@/app/(home)/events/[id]/EventPageComp";
import Spinner from "@/components/loaders/Spinner";
import PromoCodeForm from "@/components/seller/PromoCodeForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PromoCodeProps } from "@/lib/types";
import { copyToClipBoard } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import {
  Calendar,
  Check,
  Copy,
  Edit,
  Loader2,
  Plus,
  SquarePlus,
  Tag,
  Trash,
  X,
} from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

// Types
interface EventData {
  _id: string;
  name?: string;
  eventDate?: number;
}

interface PromoCodeStatus {
  isActive: boolean;
  statusType: "active" | "inactive" | "past-event";
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PromoCodesPage = () => {
  const { user } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Data fetching
  const events = useQuery(api.events.getSellerEvents, {
    userId: user?.id ?? "",
  });

  const promoCodes = useQuery(
    api.promoCodes.getEventPromoCodes,
    selectedEventId ? { eventId: selectedEventId as Id<"events"> } : "skip",
  );

  // Memoized computations
  const eventsMap = useMemo(() => {
    if (!events) return new Map();
    return new Map(events.map((event) => [event._id, event]));
  }, [events]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId || !eventsMap.has(selectedEventId)) return null;
    return eventsMap.get(selectedEventId);
  }, [selectedEventId, eventsMap]);

  const isLoading = useMemo(() => {
    return (
      events === undefined || (selectedEventId && promoCodes === undefined)
    );
  }, [events, selectedEventId, promoCodes]);

  const hasEvents = useMemo(() => {
    return events && events.length > 0;
  }, [events]);

  // Helper functions
  const formatDiscount = useCallback((percentage: number) => {
    return `${percentage}%`;
  }, []);

  const getPromoCodeStatus = useCallback(
    (code: PromoCodeProps, eventData: EventData | null): PromoCodeStatus => {
      const isEventPast =
        eventData?.eventDate !== undefined && eventData.eventDate < Date.now();

      if (code.isActive && isEventPast) {
        return {
          isActive: false,
          statusType: "past-event",
          label: "Past Event",
          badgeClass: "bg-red-100 text-red-800 hover:bg-red-100",
          icon: Check,
        };
      }

      if (code.isActive) {
        return {
          isActive: true,
          statusType: "active",
          label: "Active",
          badgeClass: "bg-green-100 text-green-800 hover:bg-green-100",
          icon: Check,
        };
      }

      return {
        isActive: false,
        statusType: "inactive",
        label: "Inactive",
        badgeClass: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        icon: X,
      };
    },
    [],
  );

  const handleCopyCode = useCallback(async (code: string) => {
    try {
      await copyToClipBoard(code);
      toast.success("Copied to clipboard");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to copy code",
      );
    }
  }, []);

  const handleDeletePromoCode = useCallback(
    (codeId: string, codeName: string) => {
      if (
        window.confirm("Are you sure you want to delete this promotional code?")
      ) {
        // TODO: Implement actual deletion logic here
        console.log("Deleted code:", codeId, codeName);
        toast.success("Promo code deleted successfully!");
      }
    },
    [],
  );

  const handleEventChange = useCallback((value: string) => {
    setSelectedEventId(value === "none" ? null : value);
  }, []);

  // Event form data
  const eventFormData = useMemo(() => {
    if (!selectedEventId || !selectedEvent) return null;
    return {
      _id: selectedEventId,
      name: selectedEvent.name,
    };
  }, [selectedEventId, selectedEvent]);

  // Early return for unauthenticated users
  if (!user) return null;

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Promotional Codes</h1>
        <p className="text-muted-foreground">
          Create and manage promotional codes for your events to offer discounts
        </p>
      </div>

      {/* Event Selection */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Label htmlFor="event-select">Event:</Label>
          <Select
            value={selectedEventId || ""}
            onValueChange={handleEventChange}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events === undefined ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div>
              ) : hasEvents ? (
                events.map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No events found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content based on state */}
      {!selectedEventId ? (
        // No event selected
        <Card className="border-none">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Select an Event</CardTitle>
            <CardDescription>
              Please select an event to view and manage its promotional codes
            </CardDescription>
          </CardContent>
        </Card>
      ) : isLoading ? (
        // Loading state
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      ) : promoCodes && promoCodes.length > 0 ? (
        // Has promo codes
        <Card className="border-none">
          <CardHeader>
            <CardDescription className="flex items-center justify-between">
              <span>Manage discount codes for {selectedEvent?.name}</span>
              {eventFormData && (
                <PromoCodeForm event={eventFormData}>
                  <Button variant="ghost" size="icon">
                    <SquarePlus className="h-6 w-6" />
                  </Button>
                </PromoCodeForm>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((code) => {
                  const status = getPromoCodeStatus(
                    {
                      ...code,
                      id: code._id,
                      discount: code.discountPercentage,
                    },
                    selectedEvent,
                  );

                  return (
                    <TableRow key={code._id} className="border-none">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{code.code}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleCopyCode(code.code)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy to clipboard</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center">
                          {formatDiscount(code.discountPercentage)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {code.usedCount || 0} / {code.usageLimit}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {code.expiresAt ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            {format(new Date(code.expiresAt), "PP")}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No expiration
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge className={status.badgeClass}>
                          <status.icon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {eventFormData && (
                            <PromoCodeForm
                              event={eventFormData}
                              existingCode={code}
                            >
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </PromoCodeForm>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeletePromoCode(code._id, code.code)
                            }
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        // No promo codes for selected event
        <Card className="border-none">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Promotional Codes</CardTitle>
            <CardDescription className="mb-6">
              You haven&apos;t created any promotional codes for{" "}
              {selectedEvent?.name} yet
            </CardDescription>
            {eventFormData && (
              <PromoCodeForm event={eventFormData}>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Create code
                </Button>
              </PromoCodeForm>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromoCodesPage;
