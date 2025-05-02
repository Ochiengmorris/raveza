"use client";

import { api } from "@/convex/_generated/api";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Spinner from "@/components/loaders/Spinner";
import { CalendarDays, Cog, UsersIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { becomeASeller } from "@/actions/becomeASeller";

const SellerDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  // const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  // Only call useQuery if user exists to maintain consistent hook order
  const userDetails = useQuery(
    api.users.getUserById,
    user?.id ? { userId: user.id } : "skip",
  );

  const isLoadingUserDetails =
    isUserLoaded && user?.id && userDetails === undefined;

  // Handle navigation to seller dashboard
  const handleManageAccount = () => {
    router.push("/seller/overview");
  };

  // Handle refreshing user status
  // const handleRefreshStatus = async () => {
  //   setRefreshing(true);
  //   try {
  //     // Force a refetch of user data
  //     await new Promise((resolve) => setTimeout(resolve, 500));
  //     router.refresh();
  //     toast.success("Status refreshed");
  //   } catch (err) {
  //     console.error("Error refreshing status:", err);
  //     toast.error("Failed to refresh status");
  //   } finally {
  //     setRefreshing(false);
  //   }
  // };

  // Handle becoming a seller
  const handleBecomeSeller = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await becomeASeller();

      if (result.status === "ok") {
        toast.success("You have successfully become a seller!");
        // Refresh the page to update the UI
        router.refresh();
      } else if (result.status === "error") {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error becoming a seller:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to become a seller. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while fetching user details
  if (!isUserLoaded || isLoadingUserDetails) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground shadow p-4 rounded-xl">
      <SignedIn>
        {userDetails?.isSeller ? (
          <div className="flex justify-center gap-4">
            <button
              onClick={handleManageAccount}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center"
            >
              <Cog className="w-4 h-4 mr-2" />
              Seller Dashboard
            </button>

            <Link
              href="/seller/events"
              className="flex items-center gap-2 text-foreground bg-foreground/10 hover:bg-foreground/20 px-4 py-2 rounded-lg transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm">View my Events</span>
            </Link>

            {/* <button
              onClick={handleRefreshStatus}
              disabled={refreshing}
              className="flex items-center gap-2 text-foreground bg-foreground/10 hover:bg-foreground/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {refreshing ? <Spinner /> : <RefreshCw className="w-4 h-4" />}
              <span className="text-sm">Refresh Status</span>
            </button> */}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-red-600 text-center">You are not a seller</p>
            <button
              onClick={handleBecomeSeller}
              disabled={isLoading}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50"
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Become a Seller
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg">
            {error}
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-red-600 text-center">
            Please sign in to access this page
          </p>
          {/* <SignInButton mode="modal">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Sign In
            </button>
          </SignInButton> */}
        </div>
      </SignedOut>
    </div>
  );
};

export default SellerDashboard;
