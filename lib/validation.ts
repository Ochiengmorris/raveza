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

// Promo Code
export const promoCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be less than 20 characters"),
  eventId: z.string(),
  discountPercentage: z.coerce
    .number()
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  startDate: z.coerce.number(),
  maxUses: z.coerce.number().min(1, "Maximum uses must be at least 1"),
  isActive: z.boolean(),
  expiresAt: z.coerce.number(),
});

export type PromoCodeFormValues = z.infer<typeof promoCodeSchema>;
