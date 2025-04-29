import SellerDashboard from "@/components/seller/SellerDashboard";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const SellTicketsPage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/");
  return (
    <div className="bg-background">
      <SellerDashboard />
    </div>
  );
};

export default SellTicketsPage;
