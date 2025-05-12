"use client";

import { useStorageUrl } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  BadgeCheck,
  LayoutDashboard,
  MapPin,
  Ticket as TicketIcon,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import QRCode from "react-qr-code";
import React from "react";

import Spinner from "@/components/loaders/Spinner";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

const Ticket = ({ ticketId }: { ticketId: Id<"tickets"> }) => {
  const ticket = useQuery(api.tickets.getTicketWithDetails, { ticketId });
  const user = useQuery(api.users.getUserById, {
    userId: ticket?.userId ?? "",
  });
  const imageUrl = useStorageUrl(ticket?.event?.imageStorageId);

  if (!ticket || !ticket.event || !user) {
    return (
      <div className=" absolute top-1/2 right-1/2">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className={`max-w-[400px] mx-auto bg-card text-card-foreground rounded-xl shadow-xl ${ticket.event.is_cancelled ? "border-red-800/50" : ""}`}
    >
      {/* Event Header with Image */}
      <div className="relative ">
        {imageUrl && (
          <div className="relative rounded-t-xl overflow-hidden w-full aspect-[21/15] md:aspect-[21/10] ">
            <Image
              src={imageUrl}
              alt={ticket.event.name}
              fill
              className={`object-cover object-center ${ticket.event.is_cancelled ? "opacity-50" : ""}`}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90" />
          </div>
        )}
        <div
          className={`px-6 py-4 ${imageUrl ? "absolute bottom-0 left-0 right-0" : ticket.event.is_cancelled ? "bg-red-600/50" : "bg-primary/50"} `}
        >
          <h2
            className={`text-xl md:text-2xl font-bold ${imageUrl ? "text-white" : "text-foreground"}`}
          >
            {ticket.event.name}
          </h2>
          {ticket.event.is_cancelled && (
            <p className="text-red-600 mt-1 text-sm md:text-base">
              This event has been cancelled
            </p>
          )}
        </div>

        <div className="absolute -bottom-4 border border-r-0 border-t-0 border-b-0  border-l-black -right-5 bg-background p-5 rounded-full" />
        <div className="absolute -bottom-4 -left-5 border border-l-0 border-t-0 border-b-0  border-r-black  bg-background p-5 rounded-full" />
      </div>

      {/* Ticket Content */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 gap-6">
          {/* Left Column - Event Details */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Date */}
            <div className="w-20 h-20 rounded-lg flex items-center justify-start flex-col shadow-md shrink-0 overflow-hidden">
              <div className="uppercase bg-card-foreground px-2 py-1 justify-center flex font-semibold w-full text-card">
                {new Intl.DateTimeFormat("en-US", { month: "short" }).format(
                  new Date(ticket.event.eventDate),
                )}
              </div>
              <div className="text-card-foreground flex-1 flex items-center justify-center text-3xl font-semibold">
                {new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(
                  new Date(ticket.event.eventDate),
                )}
              </div>
            </div>

            <div>
              {/* Location */}
              <div className="flex items-center text-gray-600">
                <MapPin
                  className={`w-5 h-5 mr-3 ${ticket.event.is_cancelled ? "text-red-800/50" : "text-primary"}`}
                />
                <div>
                  <p className="text-sm text-muted-foreground/80">Location</p>
                  <p className="font-semibold text-primary/80">
                    {ticket.event.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <User
                  className={`w-5 h-5 mr-3 ${ticket.event.is_cancelled ? "text-red-800/50" : "text-primary"}`}
                />
                <div>
                  <p className="text-sm text-muted-foreground/80">
                    Ticket Holder
                  </p>
                  <p className="font-semibold text-primary/80">{user.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="grid grid-cols-2 items-center">
            <div className="flex flex-col place-self-start mt-3">
              <div className="flex items-center text-gray-600">
                <TicketIcon
                  className={`w-5 h-5 mr-3 ${ticket.event.is_cancelled ? "text-red-800/50" : "text-primary"}`}
                />
                <div>
                  <p className="text-sm text-muted-foreground/80">
                    Ticket Type
                  </p>
                  <p className="uppercase font-semibold  text-primary/80">
                    {ticket.ticketType?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <Users
                  className={`w-5 h-5 mr-3 ${ticket.event.is_cancelled ? "text-red-800/50" : "text-primary"}`}
                />
                <div>
                  <p className="text-sm text-muted-foreground/80">
                    Ticket Quantity
                  </p>
                  <p className="font-bold text-2xl  text-primary/80">
                    {(() => {
                      switch (ticket.count) {
                        case 1:
                          return <>1 TICKET</>;
                        case 2:
                          return <>2 TICKETS</>;
                        default:
                          if (ticket.count > 2) {
                            return <>{ticket.count} TICKETS</>;
                          }
                          return <>Default price</>;
                      }
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <LayoutDashboard
                  className={`w-5 h-5 mr-3 ${ticket.event.is_cancelled ? "text-red-800/50" : "text-primary"}`}
                />
                <div>
                  <p className="text-sm text-muted-foreground/80">Promoter</p>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">
                      {ticket.eventOwner?.name.split(" ")[0]}
                    </p>
                    <BadgeCheck
                      className={`w-4 h-4 ${ticket.event.is_cancelled ? "text-red-800/50" : ""}`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`bg-gray-100 w-fit p-4 mx-auto rounded-lg ${ticket.event.is_cancelled ? "opacity-50" : ""}`}
            >
              <QRCode value={ticket._id} className="w-32 h-32" />
            </div>
            {/* <p className="mt-2 text-xs text-gray-500 break-all text-center max-w-[200px] md:max-w-full">
              Ticket ID: {ticket._id}
            </p> */}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-foreground/70 mb-2">
            Important Information
          </h3>
          {ticket.event.is_cancelled ? (
            <p className="text-sm text-red-600">
              This event has been cancelled. A refund will be processed if it
              hasn&apos;t been already.
            </p>
          ) : (
            <ul className="text-sm text-foreground/70 space-y-1">
              <li>• Please arrive at least 30 minutes before the event</li>
              <li>• Have your ticket QR code ready for scanning</li>
              <li>• This ticket is non-transferable</li>
            </ul>
          )}
        </div>
      </div>

      {/* Ticket Footer */}
      <div
        className={`${ticket.event.is_cancelled ? "" : ""} px-6 py-4 flex justify-between items-center`}
      >
        <span className="text-sm text-foreground/70">
          Purchased on: {new Date(ticket.purchasedAt).toLocaleString()}
        </span>
        <span
          className={`text-sm font-medium ${ticket.event.is_cancelled ? "text-red-600" : "text-jmprimary"}`}
        >
          {ticket.event.is_cancelled ? "Cancelled" : "Valid Ticket"}
        </span>
      </div>
    </div>
  );
};

export default Ticket;
