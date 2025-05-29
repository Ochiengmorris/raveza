import type { Metadata } from "next";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
// import NextTopLoader from "nextjs-toploader";
import SyncUserWithConvex from "@/components/other/SyncUserWithConvex";
import { GuestProvider } from "@/components/providers/GuestProvider";

export const metadata: Metadata = {
  title: {
    default: "Raveza",
    template: "%s | Raveza",
  },
  description:
    "Buy & Sell Tickets for Events & Concerts | Discover and book tickets to the most exciting events happening near you.",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`  antialiased`}>
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <GuestProvider>
              <SyncUserWithConvex />
              <main className="flex flex-col h-screen">{children}</main>
              <Toaster />
            </GuestProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
