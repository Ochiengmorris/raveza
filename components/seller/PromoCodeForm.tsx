"use client";

import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { Switch } from "@/components/ui/switch";
import { PromoCodeFormValues, promoCodeSchema } from "@/lib/validation";

interface EventProps {
  _id: string;
  name?: string;
}

interface ExistingCode {
  _id: string;
  code: string;
  eventId: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  startDate: number;
  usedCount?: number;
  usageLimit?: number;
  expiresAt: number;
  isActive: boolean;
}
const PromoCodeForm = ({
  event,
  existingCode = null,
  children,
}: {
  event: EventProps;
  existingCode?: ExistingCode | null;
  children?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const createPromoCode = useMutation(api.promoCodes.createPromoCode);
  const updatePromoCode = useMutation(api.promoCodes.updatePromoCode);

  // Initialize form with existing values or defaults
  const form = useForm<PromoCodeFormValues>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: existingCode
      ? {
          code: existingCode.code,
          eventId: String(existingCode.eventId),
          discountPercentage: existingCode.discountPercentage,
          maxUses: existingCode.usageLimit,
          isActive: existingCode.isActive,
          startDate: existingCode.startDate,
          expiresAt: existingCode.expiresAt || undefined,
        }
      : {
          code: "",
          eventId: event._id,
          discountPercentage: 10,
          maxUses: 100,
          isActive: true,
          expiresAt: undefined,
        },
  });

  // console.log(form.formState.errors);

  async function onSubmit(data: PromoCodeFormValues) {
    // mutation.mutate(data);

    if (data.startDate > data.expiresAt) {
      form.setError("expiresAt", {
        type: "manual",
        message: "Expiration date must be after start date",
      });
      return;
    }

    startTransition(async () => {
      try {
        if (!existingCode) {
          await createPromoCode({
            code: data.code,
            eventId: data.eventId as Id<"events">,
            startDate: data.startDate,
            maxDiscountAmount: undefined,
            usedCount: undefined,
            usageLimit: data.maxUses,
            discountPercentage: data.discountPercentage,
            isActive: data.isActive,
            expiresAt: data.expiresAt,
          });

          toast.success("Promo code created successfully!");
          setIsOpen(false);
        } else {
          await updatePromoCode({
            promoCodeId: existingCode._id as Id<"promoCodes">,
            code: data.code,
            startDate: data.startDate,
            maxDiscountAmount: undefined,
            usedCount: undefined,
            usageLimit: data.maxUses,
            discountPercentage: data.discountPercentage,
            isActive: data.isActive,
            expiresAt: data.expiresAt,
          });
          toast.success("Promo code updated successfully!");
          setIsOpen(false);
        }
      } catch (error) {
        const errorMessage =
          error instanceof ConvexError
            ? (error.data as { message: string }).message
            : "unexpected error occurred";
        toast.error(errorMessage);
        // console.error("Error creating promo code:", error, errorMessage);
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
                    <Input
                      placeholder="SUMMER2023"
                      {...field}
                      className="focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 "
                    />
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
                        <SelectItem key={event._id} value={String(event._id)}>
                          {event.name}
                        </SelectItem>
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
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        {...field}
                        className="focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 "
                      />
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
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        className="focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          field.onChange(
                            e.target.value ? new Date(e.target.value) : null,
                          );
                        }}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          field.onChange(
                            e.target.value ? new Date(e.target.value) : null,
                          );
                        }}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <FormField
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
            /> */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="font-normal">
                    Promo Code Status
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {existingCode ? "Creating Code..." : "Updating Code..."}
                </>
              ) : existingCode ? (
                "Update Code"
              ) : (
                "Create Code"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PromoCodeForm;
