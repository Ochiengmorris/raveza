"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import StatsOverview from "@/components/seller/StatsOverview";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import RevenueChart from "@/components/seller/RevenueChart";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { mockMonthlyRevenue } from "@/lib/convex";

const chartConfig = {
  desktop: {
    label: "revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const AnalyticsPage = () => {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [revenueData, setRevenueData] =
    useState<{ month: number; revenue: number }[]>(mockMonthlyRevenue);
  const { user } = useUser();

  const eventMetrics = useQuery(api.events.getAllUserEventsMetrics, {
    userId: user?.id ?? "",
  });

  if (!user) return null;

  console.log(
    setIsLoadingEvents,
    setIsLoadingRevenue,
    setIsLoadingTickets,
    setRevenueData,
  );

  interface Event {
    id: string;
    title: string;
    categoryId: number;
    status: string;
    ticketsSold: number;
  }

  // interface CategoryCount {
  //   name: string;
  //   value: number;
  // }

  // interface TicketsByEvent {
  //   name: string;
  //   tickets: number;
  // }

  // interface StatusCount {
  //   name: string;
  //   value: number;
  // }

  const events: Event[] = []; // Replace with actual data fetching logic

  // Get event categories for pie chart
  const getEventCategoriesData = () => {
    if (!events) return [];

    const categoryCounts: Record<string, number> = {};

    events.forEach((event) => {
      const categoryName = event.categoryId
        ? getCategoryName(event.categoryId)
        : "Uncategorized";
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Get tickets by events data for bar chart
  const getTicketsByEventData = () => {
    if (!events) return [];

    return events
      .map((event) => ({
        name: event.title || "Untitled Event",
        tickets: event.ticketsSold || 0,
      }))
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5);
  };

  // Get tickets by status data for pie chart
  const getTicketsByStatusData = () => {
    if (!events) return [];

    const statusCounts: Record<string, number> = {};

    events.forEach((event) => {
      statusCounts[event.status] = (statusCounts[event.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Helper function to get category name
  const getCategoryName = (categoryId: number) => {
    if (!events) return "Unknown";
    // This is a mock implementation since we don't have a categories array
    switch (categoryId) {
      case 1:
        return "Music";
      case 2:
        return "Technology";
      case 3:
        return "Business";
      case 4:
        return "Sports";
      case 5:
        return "Arts & Culture";
      default:
        return "Other";
    }
  };

  // Colors for charts
  const COLORS = [
    "#4F46E5",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#6366F1",
    "#8B5CF6",
  ];

  const eventCategoriesData = getEventCategoriesData();
  const ticketsByEventData = getTicketsByEventData();
  const ticketsByStatusData = getTicketsByStatusData();

  // Available years for selection
  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - 2 + i).toString(),
  );

  // Format number as KSh
  // const formatCurrency = (value: number) => {
  //   return `KSh ${value.toLocaleString()}`;
  // };

  // Format month names
  const formatMonth = (monthNum: number) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return format(date, "MMM");
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1">
            Analyze your event performance and sales data
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatsOverview stats={eventMetrics?.stats} />
          <RevenueChart data={revenueData} />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Events by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingEvents ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={eventCategoriesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {eventCategoriesData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} events`, "Count"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Top Events by Ticket Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTickets || isLoadingEvents ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : ticketsByEventData.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
                    No ticket data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={ticketsByEventData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={150}
                        tickFormatter={(value) =>
                          value.length > 15 ? `${value.slice(0, 15)}...` : value
                        }
                      />
                      <Tooltip
                        formatter={(value) => [`${value} tickets`, "Sold"]}
                      />
                      <Bar dataKey="tickets" fill="#4F46E5" barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tickets by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTickets ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : ticketsByStatusData.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
                    No ticket data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ticketsByStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {ticketsByStatusData.map((entry, index) => {
                          let color;
                          switch (entry.name.toLowerCase()) {
                            case "confirmed":
                              color = "#10B981";
                              break;
                            case "pending":
                              color = "#F59E0B";
                              break;
                            case "refunded":
                              color = "#EF4444";
                              break;
                            default:
                              color = COLORS[index % COLORS.length];
                          }
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} tickets`, "Count"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingRevenue ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : !revenueData ? (
                  <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
                    No revenue data available
                  </div>
                ) : (
                  <ChartContainer config={chartConfig}>
                    <BarChart
                      accessibilityLayer
                      layout="vertical"
                      data={revenueData}
                      margin={{ left: -20 }}
                    >
                      <XAxis
                        dataKey="revenue"
                        tickFormatter={(value) => `KSh ${value / 1000}k`}
                        hide
                      />
                      <YAxis
                        dataKey={"month"}
                        tickFormatter={formatMonth}
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />

                      <Bar
                        dataKey="revenue"
                        fill="var(--color-revenue"
                        radius={5}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
