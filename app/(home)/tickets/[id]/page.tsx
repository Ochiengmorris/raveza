"use client";

import Ticket from "@/components/tickets/Ticket";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatDate } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function TicketPage() {
  const params = useParams();
  const { user } = useUser();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const ticket = useQuery(api.tickets.getTicketWithDetails, {
    ticketId: params.id as Id<"tickets">,
  });

  useEffect(() => {
    if (!user) {
      redirect("/");
    }

    if (!ticket || ticket.userId !== user.id) {
      redirect("/tickets");
    }

    if (!ticket.event) {
      redirect("/tickets");
    }
  }, [user, ticket]);

  if (!ticket || !ticket.event) {
    return null;
  }



  const exportAsPng = async () => {
    if (!ticketRef.current) return;

    try {
      setExporting(true);

      // Add a class temporarily for better rendering
      ticketRef.current.classList.add("exporting");

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // Increased scale for better quality
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 1920, // Better resolution
        windowHeight: 1080,
      });

      // Remove the temporary class
      ticketRef.current.classList.remove("exporting");

      // Convert to PNG and download
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `ticket-${ticket.event?.name}-${formatDate(new Date().toISOString())}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Ticket exported successfully!");
    } catch (error) {
      console.error("Failed to export as PNG", error);
      toast.error("Failed to export ticket as PNG. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const exportAsPdf = async () => {
    if (!ticketRef.current) return;

    try {
      setExporting(true);

      // Add a class temporarily for better rendering
      ticketRef.current.classList.add("exporting");

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // Remove the temporary class
      ticketRef.current.classList.remove("exporting");

      // Define padding
      const padding = 10; // in mm

      // Get image dimensions
      const imgWidth = 210 - 2 * padding; // A4 width is 210mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create a new canvas with padding
      const paddedCanvas = document.createElement("canvas");
      paddedCanvas.width = canvas.width + 2 * padding;
      paddedCanvas.height = canvas.height + 2 * padding;
      const ctx = paddedCanvas.getContext("2d");
      if (!ctx) return;

      // Fill the background with white
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);

      // Draw the original canvas onto the padded canvas
      ctx.drawImage(canvas, padding, padding);

      // Convert the padded canvas to an image
      const imgData = paddedCanvas.toDataURL("image/png", 1.0);

      // Initialize jsPDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? "portrait" : "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", padding, padding, imgWidth, imgHeight);

      // Add metadata
      pdf.setProperties({
        title: `Ticket - ${ticket.event?.name}`,
        subject: `Event Ticket - ${ticket.event?.name}`,
        author: "Umoja Tickets",
        creator: "Umoja Tickets",
        keywords: "ticket,event,umoja"
      });

      // Save the PDF
      const fileName = `ticket-${ticket.event?.name}-${formatDate(new Date().toISOString())}.pdf`;
      pdf.save(fileName);

      toast.success("Ticket exported successfully!");
    } catch (error) {
      console.error("Error exporting ticket as PDF:", error);
      toast.error("Failed to export ticket as PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="h-full bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 space-y-8">
          {/* Navigation and Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/tickets"
              className="flex items-center text-foreground hover:text-foreground/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Tickets
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={exportAsPdf}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 text-foreground hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">PDF</span>
              </button>
              <button
                onClick={exportAsPng}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 text-foreground hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">PNG</span>
              </button>
            </div>
          </div>

          {/* Event Info Summary */}
          <div
            className={`bg-card text-card-foreground p-6 rounded-lg shadow-sm ${ticket.event.is_cancelled ? "border-red-800/50" : ""}`}
          >
            <h1 className="text-xl md:text-2xl font-bold">
              {ticket.event.name}
            </h1>
            <p className="mt-1 text-foreground/70 text-sm md:text-base">
              {formatDate(new Date(ticket.event.eventDate).toISOString())} at{" "}
              {ticket.event.location}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.event.is_cancelled
                    ? "bg-red-50 text-red-700"
                    : ticket.event.eventDate < Date.now()
                      ? "bg-gray-50 text-gray-700"
                      : "bg-green-300/30 text-green-700"
                  }`}
              >
                {ticket.event.is_cancelled
                  ? "Cancelled"
                  : ticket.event.eventDate < Date.now()
                    ? "Ended"
                    : "Valid Ticket"}
              </span>
              <span className="text-sm text-foreground/70">
                Purchased on{" "}
                {formatDate(new Date(ticket.purchasedAt).toISOString())}
              </span>
            </div>
            {ticket.event.is_cancelled && (
              <p className="mt-4 text-sm text-red-600/70">
                This event has been cancelled. A refund will be processed if it
                hasn&apos;t been already.
              </p>
            )}
          </div>
        </div>

        {/* Ticket Component */}
        <div
          ref={ticketRef}
          className={`${ticket.event.eventDate < Date.now() ? (ticket.event.is_cancelled ? "" : "grayscale") : ""}`}
        >
          <Ticket ticketId={ticket._id} />
        </div>

        {/* Additional Information */}
        <div
          className={`mt-8 rounded-lg p-4 bg-card text-card-foreground shadow-sm`}
        >
          <h3
            className={`text-sm font-medium ${ticket.event.is_cancelled ? "" : ""
              }`}
          >
            Need Help?
          </h3>
          <p
            className={`mt-1 text-sm ${ticket.event.is_cancelled
                ? "text-foreground/70"
                : "text-foreground/70"
              }`}
          >
            {ticket.event.is_cancelled
              ? "For questions about refunds or cancellations, please contact our support team at team@umojatickets.com"
              : "If you have any issues with your ticket, please contact our support team at team@umojatickets.com"}
          </p>
        </div>
      </div>
    </div>
  );
}
