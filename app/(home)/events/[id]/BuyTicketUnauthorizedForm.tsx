"use client";

import JoinQueue from "@/components/tickets/JoinQueue";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface JoinQueueProps {
  eventId: Id<"events">;
  ticketTypeId: Id<"ticketTypes">;
  selectedCount: number;
  promoCodeId?: Id<"promoCodes">;
  name?: string;
  email?: string;
}

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

type FormData = z.infer<typeof formSchema>;

const BuyTicketUnauthorizedForm = ({
  eventId,
  ticketTypeId,
  selectedCount,
  promoCodeId,
  name,
  email,
}: JoinQueueProps) => {
  const [showDialog, setShowDialog] = React.useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name || "",
      email: email || "",
    },
  });
  async function onSubmit(values: FormData) {
    // Handle form submission logic here
    console.log("Form submitted with values:", values);
    // You can call a function to handle the ticket purchase or queue joining
    // For example: await joinQueue(eventId, ticketTypeId, selectedCount, promoCodeId, values);
    setShowDialog(true);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={cn("text-muted-foreground")}>
                  Your Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={cn("focus:ring-0 focus:border-0")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={cn("text-muted-foreground")}>
                  Your Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    className={cn("focus:ring-0 focus:border-0")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            onSubmit={form.handleSubmit(onSubmit)}
            className={`place-self-end font-semibold py-6 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${showDialog ? "hidden" : ""}`}
          >
            Continue
          </Button>
        </form>
      </Form>
      {showDialog && (
        <Card className="border-0 p-4 space-y-0">
          <h2 className="text-lg font-semibold">Confirm Details</h2>
          <div className="text-sm  md:text-md">
            <span>Name :</span>
            <span className="font-semibold ml-6">{form.getValues("name")}</span>
          </div>
          <div className="text-sm  md:text-md">
            <span className="text-muted-foreground">Email :</span>
            <span className="font-semibold ml-6">
              {form.getValues("email")}
            </span>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant={"outline"} onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <JoinQueue
              eventId={eventId}
              ticketTypeId={ticketTypeId}
              selectedCount={selectedCount}
              promoCodeId={promoCodeId}
              name={form.getValues("name")}
              email={form.getValues("email")}
            />
          </div>
        </Card>
      )}
    </>
  );
};

export default BuyTicketUnauthorizedForm;
