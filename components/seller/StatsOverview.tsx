import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsOverviewProps {
  stats?: {
    liveEvents: number;
    totalTicketsSold: number;
    totalAttendees: number;
    totalRevenue: number;
  };
  isLoading?: boolean;
}

const StatsOverview = ({ stats, isLoading = false }: StatsOverviewProps) => {
  const statsItems = [
    {
      title: "All Events",
      value: stats?.liveEvents || 0,
      change: 12,
      changeType: "increase",
      icon: (
        <div className="rounded-full bg-blue-100 p-3 mr-4">
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Tickets Sold",
      value: stats?.totalTicketsSold || 0,
      change: 8,
      changeType: "increase",
      icon: (
        <div className="rounded-full bg-green-100 p-3 mr-4">
          <svg
            className="h-5 w-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Attendees",
      value: stats?.totalAttendees || 0,
      change: 5,
      changeType: "increase",
      icon: (
        <div className="rounded-full bg-purple-100 p-3 mr-4">
          <svg
            className="h-5 w-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Total Revenue",
      value: stats?.totalRevenue || 0,
      change: 3,
      changeType: "decrease",
      icon: (
        <div className="rounded-full bg-amber-100 p-3 mr-4">
          <svg
            className="h-5 w-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      ),
    },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {isLoading ? (
        // Loading state
        <>
          {[1, 2, 3, 4].map((id) => (
            <Card key={id} className="p-4 border-none">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-32 mt-2" />
            </Card>
          ))}
        </>
      ) : (
        // Data loaded state
        <>
          {statsItems.map((item, index) => (
            <Card key={index} className="p-4 border border-slate-200 bg-white">
              <div className="flex items-center">
                {item.icon}
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {item.title === "Revenue"
                      ? formatCurrency(item.value)
                      : formatNumber(item.value)}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "mt-2 text-xs flex items-center",
                  item.changeType === "increase"
                    ? "text-green-600"
                    : "text-red-600",
                )}
              >
                <span className="flex items-center">
                  {item.changeType === "increase" ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  <span>{item.change}%</span>
                </span>
                <span className="text-slate-500 ml-1">from last month</span>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
};

export default StatsOverview;
