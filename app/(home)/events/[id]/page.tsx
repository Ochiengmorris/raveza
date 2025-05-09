import Spinner from "@/components/loaders/Spinner";
import { cache } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import EventPageComp from "@/components/events/EventPageComp";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";

export type ticketType = {
  name: string;
  price: number;
  totalTickets: number;
};

export type ticketTypeWithId = ticketType & {
  _id: Id<"ticketTypes">;
};

const getEvent = cache(async (eventId: Id<"events">) => {
  try {
    const event = await fetchQuery(api.events.getById, {
      eventId,
    });
    return event;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id as Id<"events">);

  if (event) {
    const imageUrl = await fetchQuery(api.storage.getUrl, {
      storageId: event.imageStorageId ?? ("" as Id<"_storage">),
    });
    return {
      title: event.name,
      description: event.description,
      openGraph: {
        title: event.name,
        description: event.description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  }
  return {
    title: "Event",
    description: "Event details page",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id as Id<"events">);

  if (!event) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          {/* <p className="text-muted-foreground">Loading event details...</p> */}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <EventPageComp event={event} eventId={id as Id<"events">} />
    </div>
  );
}
