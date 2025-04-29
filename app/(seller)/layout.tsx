import type { Metadata } from "next";
import RequireAdminSeller from "@/components/layout/RequireAdminSeller";
import NextTopLoader from "nextjs-toploader";
import Sidebar from "@/components/seller/Sidebar";
import MobileNavbar from "@/components/seller/MobileNavbar";
import "../globals.css";

export const metadata: Metadata = {
  title: "UmojaTickets: Buy & Sell Tickets for Events & Concerts",
  description:
    "UmojaTickets is a leading ticketing platform in Kenya for events and concerts, offering easy ticket purchases and seamless event management for both organizers and attendees.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAdminSeller>
      <NextTopLoader showSpinner={false} />
      <div className="flex h-full bg-gray-100">
        <Sidebar />
        <MobileNavbar />
        <main className="flex-1 overflow-y-scroll md:ml-64 lg:ml-72 pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </RequireAdminSeller>
  );
}
