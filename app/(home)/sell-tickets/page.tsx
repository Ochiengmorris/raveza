import SellerDashboard from "@/components/seller/SellerDashboard";
import { Metadata } from "next";
// import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
  title: "Sell Tickets",
};

const SellTicketsPage = async () => {
  return (
    <div className="bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <div className="rounded-xl text-card-foreground overflow-hidden">
          {/* Header Section */}
          <div className="bg-primary/10 px-6 py-8 text-black shadow rounded-b-xl mb-4">
            <h2 className="text-2xl font-bold">Seller Dashboard</h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Manage your seller profile and payment settings
            </p>
          </div>

          <SellerDashboard />
        </div>
      </div>
    </div>
  );
};

export default SellTicketsPage;
