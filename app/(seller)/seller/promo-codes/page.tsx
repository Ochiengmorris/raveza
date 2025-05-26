"use client";

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
import React, { useState } from "react";
import { toast } from "sonner";

const PromoCodesPage = () => {
  const { user } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const events = useQuery(api.events.getSellerEvents, {
    userId: user?.id ?? "",
  });

  const promoCodes = useQuery(
    api.promoCodes.getEventPromoCodes,
    selectedEventId
      ? {
          eventId: selectedEventId as Id<"events">,
        }
      : "skip",
  );

  // Format discount for display
  const formatDiscount = (percentage: number) => {
    return `${percentage}%`;
  };

  if (!user) return null;
  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Promotional Codes</h1>
        <p className="text-muted-foreground">
          Create and manage promotional codes for your events to offer discounts
        </p>
      </div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Label htmlFor="event-select">Event:</Label>
          <Select
            value={selectedEventId?.toString() || ""}
            onValueChange={(value) => setSelectedEventId(value)}
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
              ) : events && events.length > 0 ? (
                events.map((event) => (
                  <SelectItem key={event._id} value={event._id.toString()}>
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

        {selectedEventId && events && events.length > 0 && <></>}
      </div>
      {!selectedEventId && (
        <Card className="border-none">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Select an Event</CardTitle>
            <CardDescription>
              Please select an event to view and manage its promotional codes
            </CardDescription>
          </CardContent>
        </Card>
      )}
      {selectedEventId && !promoCodes && (
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      )}
      {selectedEventId && promoCodes && promoCodes.length > 0 && (
        <Card className="border-none">
          <CardHeader>
            {/* <CardTitle>Promo Codes</CardTitle> */}
            <CardDescription className="flex items-center">
              Manage discount codes for{" "}
              {events?.find((event) => event._id === selectedEventId)?.name}
              <PromoCodeForm
                event={{
                  _id: selectedEventId,
                  name: events?.find((event) => event._id === selectedEventId)
                    ?.name,
                }}
              >
                <Button className="ml-auto" variant={"ghost"} size={"icon"}>
                  <SquarePlus className="h-6 w-6" />
                </Button>
              </PromoCodeForm>
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
                {promoCodes.map((code) => (
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
                                // onClick={() => copyToClipboard(code.code)}
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
                      {code.isActive &&
                      events?.find((event) => event._id === selectedEventId)
                        ?.eventDate !== undefined &&
                      events.find((event) => event._id === selectedEventId)!
                        .eventDate < Date.now() ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          <Check className="h-3 w-3 mr-1" /> Past Event
                        </Badge>
                      ) : code.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Check className="h-3 w-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        >
                          <X className="h-3 w-3 mr-1" /> Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <PromoCodeForm
                          event={{
                            _id: selectedEventId,
                            name: events?.find(
                              (event) => event._id === selectedEventId,
                            )?.name,
                          }}
                          existingCode={code}
                        >
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PromoCodeForm>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this promotional code?",
                              )
                            ) {
                              toast.success("Promo code deleted successfully!");
                            }
                          }}
                        >
                          {<Trash className="h-4 w-4 text-destructive" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {selectedEventId && promoCodes && promoCodes.length === 0 && (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Promotional Codes</CardTitle>
            <CardDescription className="mb-6">
              You haven&apos;t created any promotional codes for{" "}
              {events?.find((event) => event._id === selectedEventId)?.name} yet
            </CardDescription>
            <PromoCodeForm
              event={{
                _id: selectedEventId,
                name: events?.find((event) => event._id === selectedEventId)
                  ?.name,
              }}
            >
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Create
              </Button>
            </PromoCodeForm>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromoCodesPage;
