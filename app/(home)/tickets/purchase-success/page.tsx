import ConfettiComp from "@/components/other/Confetti";
import Ticket from "@/components/tickets/Ticket";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ticket Success",
};

async function TicketSuccess() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const convex = getConvexClient();
  const tickets = await convex.query(api.events.getUserTickets, { userId });
  const latestTicket = tickets[tickets.length - 1];

  if (!latestTicket) {
    redirect("/");
  }

  return (
    <>
      <div className="h-full bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold ">Ticket Purchase Successful!</h1>
            <p className="mt-2 text-gray-600">
              Your ticket has been confirmed and is ready to use
            </p>
          </div>

          <Ticket ticketId={latestTicket._id} />
        </div>
      </div>
      <ConfettiComp />
    </>
  );
}

export default TicketSuccess;
