import { Id } from "@/convex/_generated/dataModel";

export const categoryOptions = [
  "Music",
  "Sports",
  "Arts",
  "Food & Drink",
  "Technology",
  "Travel",
];

export type EventProps = {
  _id: Id<"events">;
  name: string;
  category?: string;
  location: string;
  userId: string;
  imageStorageId?: Id<"_storage">;
  startTime?: string;
  description: string;
  organizerName?: string;
  eventDate: number;
};

export type PromoCodeProps = {
  id: Id<"promoCodes">;
  code: string;
  discount: number;
  expiresAt: number;
  isActive: boolean;
};

export type TicketType = {
  _id: Id<"ticketTypes">;
  name: string;
  price: number;
  totalTickets: number;
  eventId: Id<"events">;
};

export type TicketProps = {
  _id: Id<"tickets">;
  eventId: Id<"events">;
  ticketTypeId: Id<"ticketTypes">;
  promocodeId?: Id<"promoCodes">;
  userId: string;
  purchasedAt: number;
  count: number;
  status: "valid" | "used" | "refunded" | "cancelled";
  paymentIntentId?: string;
  amount?: number;
};

export type WaitingList = {
  _id: Id<"waitingList">;
  eventId: Id<"events">;
  ticketTypeId: Id<"ticketTypes">;
  promoCodeId?: Id<"promoCodes">;
  count: number;
  userId: string;
  promoCodeDiscount?: number;
  status: "waiting" | "offered" | "purchased" | "expired";
  offerExpiresAt?: number;
};
