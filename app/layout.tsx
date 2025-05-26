import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Poppins } from "next/font/google";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
// import NextTopLoader from "nextjs-toploader";
import SyncUserWithConvex from "@/components/other/SyncUserWithConvex";
import { GuestProvider } from "@/components/providers/GuestProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${poppins.variable} ${montserrat.variable}  ${geistMono.variable} antialiased`}
      >
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
