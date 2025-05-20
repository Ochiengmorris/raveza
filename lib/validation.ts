import { z } from "zod";

export const ticketSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
  totalTickets: z.number().min(1, "Must have at least 1 ticket"),
});

export const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string({
    required_error: "Category is required",
  }),
  eventDate: z
    .date()
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "Event date must be in the future",
    ),
  time: z.string().min(1, "Time is required"),
  ticketTypes: z
    .array(ticketSchema)
    .min(1, "At least one ticket type required"),
});

export type EventFormType = z.infer<typeof eventFormSchema>;
