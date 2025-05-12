import type { Metadata } from "next";
import RequireAdminSeller from "@/components/layout/RequireAdminSeller";
import NextTopLoader from "nextjs-toploader";
import Sidebar from "@/components/seller/Sidebar";
import MobileNavbar from "@/components/seller/MobileNavbar";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Seller",
    template: "%s | Seller",
  },
  description:
    "Buy & Sell Tickets for Events & Concerts | Discover and book tickets to the most exciting events happening near you.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAdminSeller>
      <NextTopLoader showSpinner={false} />
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <MobileNavbar />
        <main className="flex-1 overflow-y-auto md:ml-64 lg:ml-72 pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </RequireAdminSeller>
  );
}
