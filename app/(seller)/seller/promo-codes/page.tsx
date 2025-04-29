"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  Eye,
  Trash,
  Edit,
  Plus,
  Copy,
  Calendar,
  Percent,
  Check,
  X,
  Tag,
} from "lucide-react";

// Define validation schema for creating promotional code
const promoCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be less than 20 characters"),
  eventId: z.coerce.number(),
  discountPercentage: z.coerce
    .number()
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  maxUses: z.coerce.number().min(1, "Maximum uses must be at least 1"),
  isActive: z.boolean(),
  expiresAt: z.string().optional(),
});

type PromoCodeFormValues = z.infer<typeof promoCodeSchema>;

// Promotional code redemption component
interface User {
  fullName: string;
}

interface Redemption {
  id: string;
  redeemedAt: string;
  user?: User;
  discountAmount: string;
}

interface PromoCode {
  id: string;
  code: string;
}

interface RedemptionsDialogProps {
  promoCode: PromoCode;
}

const RedemptionsDialog = ({ promoCode }: RedemptionsDialogProps) => {
  // const { data: redemptions, isLoading } = useQuery({
  //   queryKey: [`/api/promo-codes/${promoCode.id}/redemptions`],
  //   enabled: !!promoCode,
  // });
  const isLoading: boolean = false;

  const redemptions: Redemption[] = [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" /> View Usage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Redemptions for code: {promoCode.code}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : redemptions && redemptions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Discount Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redemptions.map((redemption: Redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell>
                    {redemption.redeemedAt
                      ? format(new Date(redemption.redeemedAt), "PP")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {redemption.user
                      ? redemption.user.fullName
                      : "Unknown User"}
                  </TableCell>
                  <TableCell>
                    KES {parseFloat(redemption.discountAmount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No redemptions found for this promotional code.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Component for creating or editing a promo code
interface Event {
  id: number;
  name: string;
}

interface ExistingCode {
  id: string;
  code: string;
  eventId: number;
  discountPercentage: number;
  maxUses: number;
  isActive: boolean;
  expiresAt?: string;
}

interface PromoCodeFormProps {
  events: Event[];
  existingCode?: ExistingCode | null;
  onSuccess: () => void;
}

const PromoCodeForm = ({
  events,
  existingCode = null,
  onSuccess,
}: PromoCodeFormProps) => {
  // const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Initialize form with existing values or defaults
  const form = useForm<PromoCodeFormValues>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: existingCode
      ? {
          code: existingCode.code,
          eventId: existingCode.eventId,
          discountPercentage: existingCode.discountPercentage,
          maxUses: existingCode.maxUses,
          isActive: existingCode.isActive,
          expiresAt: existingCode.expiresAt
            ? new Date(existingCode.expiresAt).toISOString().split("T")[0]
            : undefined,
        }
      : {
          code: "",
          eventId: events && events.length > 0 ? events[0].id : undefined,
          discountPercentage: 10,
          maxUses: 100,
          isActive: true,
          expiresAt: undefined,
        },
  });

  // Create or update mutation
  // const mutation = useMutation({
  //   mutationFn: async (data: PromoCodeFormValues) => {
  //     // Format the data
  //     // Make sure we send a proper Date object for expiresAt, not just an ISO string
  //     // This is needed because Drizzle/Zod expects Date objects for date fields
  //     const formattedData = {
  //       ...data,
  //       expiresAt: data.expiresAt
  //         ? new Date(data.expiresAt + "T23:59:59")
  //         : undefined,
  //     };

  //     if (existingCode) {
  //       // Update </Button>existing code
  //       return apiRequest(
  //         "PUT",
  //         `/api/promo-codes/${existingCode.id}`,
  //         formattedData
  //       );
  //     } else {
  //       // Create new code
  //       return apiRequest(
  //         "POST",
  //         `/api/events/${data.eventId}/promo-codes`,
  //         formattedData
  //       );
  //     }
  //   },
  //   onSuccess: () => {
  //     // Invalidate queries to refresh data
  //     queryCli</Form>ent.invalidateQueries({ queryKey: ["/api/events"] });
  //     events.forEach((event) => {
  //       queryClient.invalidateQueries({
  //         queryKey: [`/api/events/${event.id}/promo-codes`],
  //       });
  //     });

  //     toast({
  //       title: existingCode
  //         ? "Promotional code updated"
  //         : "Promotional code created",
  //       description: existingCode
  //         ? `The code "${form.getValues().code}" has been updated successfully.`
  //         : `The code "${form.getValues().code}" has been created successfully.`,
  //     });

  //     setIsOpen(false);
  //     onSuccess();
  //   },
  //   onError: (error: any) => {
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to process promotional code",
  //       variant: "destructive",
  //     });
  //   },
  // });
  console.log(onSuccess);

  function onSubmit(data: PromoCodeFormValues) {
    // mutation.mutate(data);
    console.log(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {existingCode ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Create Promotional Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingCode ? "Edit" : "Create"} Promotional Code
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="SUMMER2023" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the code users will enter to receive the discount
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                      disabled={!!existingCode} // Can't change event if editing
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={String(event.id)}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Maximum Uses</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    If set, the code will automatically expire after this date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Active</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              {/* <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {existingCode ? "Update" : "Create"} Code
              </Button> */}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const PromoCodes = () => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  // Format discount for display
  const formatDiscount = (percentage: number) => {
    return `${percentage}%`;
  };

  interface Event {
    id: number;
    name: string;
  }

  const events: Event[] = [];
  const eventsLoading = false;
  interface PromoCodeType {
    id: string;
    code: string;
    eventId: number;
    discountPercentage: number;
    usedCount: number;
    maxUses: number;
    expiresAt?: string;
    isActive: boolean;
  }

  const promoCodes: PromoCodeType[] = [];
  const codesLoading = false;
  const deleteCodeMutation = {
    mutate: async (id: string) => {
      // Implement your delete logic here
      console.log("Deleting code:", id);
    },
    isPending: false,
  };
  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Promotional Codes</h1>
        <p className="text-muted-foreground">
          Create and manage promotional codes for your events to offer discounts
        </p>
      </div>

      {/* continue */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Label htmlFor="event-select">Event:</Label>
          <Select
            value={selectedEventId?.toString() || ""}
            onValueChange={(value) => setSelectedEventId(Number(value))}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {eventsLoading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </div>
              ) : events && events.length > 0 ? (
                events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
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

      {!selectedEventId ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Select an Event</CardTitle>
            <CardDescription>
              Please select an event to view and manage its promotional codes
            </CardDescription>
          </CardContent>
        </Card>
      ) : codesLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : promoCodes && promoCodes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Promotional Codes</CardTitle>
            <CardDescription>
              Manage discount codes for{" "}
              {events?.find((event) => event.id === selectedEventId)?.name}
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
                  <TableRow key={code.id}>
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
                        <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatDiscount(code.discountPercentage)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {code.usedCount} / {code.maxUses}
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
                      {code.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Check className="h-3 w-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-100 text-red-800 hover:bg-red-100"
                        >
                          <X className="h-3 w-3 mr-1" /> Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <RedemptionsDialog promoCode={code} />
                        <PromoCodeForm
                          events={events}
                          existingCode={code}
                          onSuccess={() => {
                            // if (selectedEventId) {
                            //   queryClient.invalidateQueries({
                            //     queryKey: [
                            //       `/api/events/${selectedEventId}/promo-codes`,
                            //     ],
                            //   });
                            // }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this promotional code?",
                              )
                            ) {
                              deleteCodeMutation.mutate(code.id);
                            }
                          }}
                          disabled={deleteCodeMutation.isPending}
                        >
                          {deleteCodeMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Promotional Codes</CardTitle>
            <CardDescription className="mb-6">
              You haven&apos;t created any promotional codes for this event yet
            </CardDescription>
            <PromoCodeForm
              events={events}
              onSuccess={() => {
                if (selectedEventId) {
                  // queryClient.invalidateQueries({ queryKey: [`/api/events/${selectedEventId}/promo-codes`] });
                }
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromoCodes;
