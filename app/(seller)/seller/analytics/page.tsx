// "use client";

// import { useMemo, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Skeleton } from "@/components/ui/skeleton";
// import StatsOverview from "@/components/seller/StatsOverview";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
//   CartesianGrid,
//   LabelList,
// } from "recharts";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { format } from "date-fns";
// import RevenueChart from "@/components/seller/RevenueChart";
// import { useUser } from "@clerk/nextjs";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import { mockMonthlyRevenue } from "@/lib/convex";

// const chartConfig = {
//   revenue: {
//     label: "Revenue",
//     color: "var(--chart-2)",
//   },
// } satisfies ChartConfig;

// const AnalyticsPage = () => {
//   const [selectedYear, setSelectedYear] = useState(
//     new Date().getFullYear().toString(),
//   );
//   const [activeTab, setActiveTab] = useState("overview");

//   const { user } = useUser();
//   const monthlyRevenue = useQuery(api.events.getMonthlyRevenue, {
//     userId: user?.id ?? "",
//   });

//   const eventMetrics = useQuery(api.events.getAllUserEventsMetrics, {
//     userId: user?.id ?? "",
//   });
//   const eventWithMetrics = useQuery(api.events.getSellerEvents, {
//     userId: user?.id ?? "",
//   });
//   const ticketDetails = useQuery(api.tickets.getAllUserTickets, {
//     userId: user?.id ?? "",
//   });
//   // Memoized component loading states
//   const componentLoadingStates = useMemo(() => {
//     return {
//       eventsLoading: eventMetrics === undefined,
//       revenueLoading: monthlyRevenue === undefined,
//       ticketsLoading: ticketDetails === undefined,
//     };
//   }, [eventMetrics, monthlyRevenue, ticketDetails]);

//   const formattedRevenue = useMemo(() => {
//     return monthlyRevenue || mockMonthlyRevenue;
//   }, [monthlyRevenue]);

//   if (!user) return null;

//   interface EventWithMetrics {
//     name: string;
//     category?: string;
//    description: string;
//     location: string;
//     userId: string;
//     imageStorageId?: string;
//     startTime?: string;
//     eventDate: number;
//     organizerName?: string;
//     metrics: {
//       cancelledTickets: number;
//       refundedTickets: number;
//       soldTickets: number;
//       totalAttendees: number;
//       totalTickets: number;
//       revenue: number;
//     };
//   }

//   const events: EventWithMetrics[] = eventWithMetrics || [];

//   // Get event categories for pie chart
//   const getEventCategoriesData = () => {
//     if (!events) return [];

//     const categoryCounts: Record<string, number> = {};

//     events.forEach((event) => {
//       const categoryName = event.category
//         ? event.category
//         : "Uncategorized";
//       categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
//     });

//     return Object.entries(categoryCounts).map(([name, value]) => ({
//       name,
//       value,
//     }));
//   };

//   // Get tickets by events data for bar chart
//   const getTicketsByEventData = () => {
//     if (!events) return [];

//     return events
//       .map((event) => ({
//         name: event.name || "Untitled Event",
//         tickets: event.metrics.soldTickets || 0,
//       }))
//       .sort((a, b) => b.tickets - a.tickets)
//       .slice(0, 5);
//   };

//   // Get tickets by status data for pie chart
//   const getTicketsByStatusData = () => {
//     if (!events) return [];

//     const statusCounts: Record<string, number> = {};

//     events.forEach((event) => {
//       statusCounts[event.status] = (statusCounts[event.status] || 0) + 1;
//     });

//     return Object.entries(statusCounts).map(([name, value]) => ({
//       name,
//       value,
//     }));
//   };

//   // Colors for charts
//   const COLORS = [
//     "#4F46E5",
//     "#EC4899",
//     "#10B981",
//     "#F59E0B",
//     "#6366F1",
//     "#8B5CF6",
//   ];

//   const eventCategoriesData = getEventCategoriesData();
//   const ticketsByEventData = getTicketsByEventData();
//   const ticketsByStatusData = getTicketsByStatusData();

//   // Available years for selection
//   const years = Array.from({ length: 5 }, (_, i) =>
//     (new Date().getFullYear() - 2 + i).toString(),
//   );

//   // Format month names
//   const formatMonth = (monthNum: number) => {
//     const date = new Date();
//     date.setMonth(monthNum - 1);
//     return format(date, "MMM");
//   };

//   return (
//     <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
//           <p className="text-slate-500 mt-1">
//             Analyze your event performance and sales data
//           </p>
//         </div>

//         <div className="mt-4 md:mt-0">
//           <Select value={selectedYear} onValueChange={setSelectedYear}>
//             <SelectTrigger className="w-32">
//               <SelectValue placeholder="Select Year" />
//             </SelectTrigger>
//             <SelectContent>
//               {years.map((year) => (
//                 <SelectItem key={year} value={year}>
//                   {year}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
//         <TabsList className="grid w-full grid-cols-3 mb-6">
//           <TabsTrigger value="overview">Overview</TabsTrigger>
//           <TabsTrigger value="events">Events</TabsTrigger>
//           <TabsTrigger value="tickets">Tickets</TabsTrigger>
//         </TabsList>

//         <TabsContent value="overview" className="space-y-6">
//           <StatsOverview stats={eventMetrics?.stats} />
//           <RevenueChart data={formattedRevenue} />
//         </TabsContent>

//         <TabsContent value="events" className="space-y-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card className="p-0 border-none pt-4">
//               <CardHeader>
//                 <CardTitle className="text-lg">Events by Category</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {componentLoadingStates.eventsLoading ? (
//                   <div className="space-y-4">
//                     <Skeleton className="h-[300px] w-full" />
//                   </div>
//                 ) : (
//                   <ResponsiveContainer width="100%" height={300}>
//                     <PieChart>
//                       <Pie
//                         data={eventCategoriesData}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         outerRadius={100}
//                         fill="#8884d8"
//                         dataKey="value"
//                         label={({ name, percent }) =>
//                           `${name} ${(percent * 100).toFixed(0)}%`
//                         }
//                       >
//                         {eventCategoriesData.map((_, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={COLORS[index % COLORS.length]}
//                           />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         formatter={(value) => [`${value} events`, "Count"]}
//                       />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 )}
//               </CardContent>
//             </Card>

//             <Card className="p-0 border-none pt-4">
//               <CardHeader>
//                 <CardTitle className="text-lg">
//                   Top Events by Ticket Sales
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {componentLoadingStates.eventsLoading ||
//                 componentLoadingStates.ticketsLoading ? (
//                   <div className="space-y-4">
//                     <Skeleton className="h-[300px] w-full" />
//                   </div>
//                 ) : ticketsByEventData.length === 0 ? (
//                   <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
//                     No ticket data available
//                   </div>
//                 ) : (
//                   <ResponsiveContainer width="100%" height={300}>
//                     <BarChart
//                       data={ticketsByEventData}
//                       layout="vertical"
//                       margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
//                     >
//                       <XAxis type="number" />
//                       <YAxis
//                         dataKey="name"
//                         type="category"
//                         tick={{ fontSize: 12 }}
//                         width={150}
//                         tickFormatter={(value) =>
//                           value.length > 15 ? `${value.slice(0, 15)}...` : value
//                         }
//                       />
//                       <Tooltip
//                         formatter={(value) => [`${value} tickets`, "Sold"]}
//                       />
//                       <Bar dataKey="tickets" fill="#4F46E5" barSize={20} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         <TabsContent value="tickets" className="space-y-6">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card className="p-0 border-none pt-4">
//               <CardHeader>
//                 <CardTitle className="text-lg">Tickets by Status</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {componentLoadingStates.ticketsLoading ? (
//                   <div className="space-y-4">
//                     <Skeleton className="h-[300px] w-full" />
//                   </div>
//                 ) : ticketsByStatusData.length === 0 ? (
//                   <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
//                     No ticket data available
//                   </div>
//                 ) : (
//                   <ResponsiveContainer width="100%" height={300}>
//                     <PieChart>
//                       <Pie
//                         data={ticketsByStatusData}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         outerRadius={100}
//                         fill="#8884d8"
//                         dataKey="value"
//                         label={({ name, percent }) =>
//                           `${name} ${(percent * 100).toFixed(0)}%`
//                         }
//                       >
//                         {ticketsByStatusData.map((entry, index) => {
//                           let color;
//                           switch (entry.name.toLowerCase()) {
//                             case "confirmed":
//                               color = "#10B981";
//                               break;
//                             case "pending":
//                               color = "#F59E0B";
//                               break;
//                             case "refunded":
//                               color = "#EF4444";
//                               break;
//                             default:
//                               color = COLORS[index % COLORS.length];
//                           }
//                           return <Cell key={`cell-${index}`} fill={color} />;
//                         })}
//                       </Pie>
//                       <Tooltip
//                         formatter={(value) => [`${value} tickets`, "Count"]}
//                       />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 )}
//               </CardContent>
//             </Card>

//             <Card className="p-0 border-none pt-4">
//               <CardHeader>
//                 <CardTitle className="text-lg">Monthly Revenue</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {componentLoadingStates.revenueLoading ? (
//                   <div className="space-y-4">
//                     <Skeleton className="h-[300px] w-full" />
//                   </div>
//                 ) : !formattedRevenue ? (
//                   <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
//                     No revenue data available
//                   </div>
//                 ) : (
//                   <ChartContainer config={chartConfig}>
//                     <BarChart
//                       accessibilityLayer
//                       data={formattedRevenue}
//                       margin={{ left: -30, top: 20 }}
//                     >
//                       <CartesianGrid vertical={false} />
//                       <XAxis
//                         dataKey="month"
//                         tickFormatter={(value) => formatMonth(value)}
//                       />
//                       <YAxis tickFormatter={(value) => `${value / 1000}k`} />
//                       <ChartTooltip
//                         cursor={false}
//                         content={<ChartTooltipContent hideLabel />}
//                       />
//                       <Bar
//                         dataKey="revenue"
//                         fill={chartConfig.revenue.color}
//                         radius={8}
//                       >
//                         <LabelList
//                           position="top"
//                           offset={12}
//                           className="fill-foreground"
//                           fontSize={10}
//                           formatter={(value: number) => `${value / 1000}k`}
//                         />
//                       </Bar>
//                     </BarChart>
//                   </ChartContainer>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default AnalyticsPage;

"use client";

import { useMemo, useState } from "react";
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
  CartesianGrid,
  LabelList,
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

// Types
interface EventMetrics {
  cancelledTickets: number;
  refundedTickets: number;
  soldTickets: number;
  totalAttendees: number;
  totalTickets: number;
  revenue: number;
}

interface EventWithMetrics {
  name: string;
  category?: string;
  description: string;
  location: string;
  userId: string;
  imageStorageId?: string;
  startTime?: string;
  eventDate: number;
  organizerName?: string;
  status?: string;
  metrics: EventMetrics;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

interface TicketsByEventData {
  name: string;
  tickets: number;
}

// Constants
const CHART_COLORS = [
  "#3B3F66", // Muted Indigo
  "#A55C7D", // Dusty Rose
  "#4C7A5D", // Soft Moss Green
  "#C08B3E", // Muted Mustard
  "#5A5E8F", // Cool Slate Blue
  "#7266A6", // Desaturated Purple
];

const STATUS_COLORS = {
  confirmed: "#10B981",
  pending: "#F59E0B",
  refunded: "#EF4444",
} as const;

const chartConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
};

// Utility functions
const formatMonth = (monthNum: number): string => {
  const date = new Date();
  date.setMonth(monthNum - 1);
  return format(date, "MMM");
};

const formatCurrency = (value: number): string => `KSh ${value / 1000}k`;

const truncateText = (text: string, maxLength: number = 15): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

const generateYears = (count: number = 5): string[] =>
  Array.from({ length: count }, (_, i) =>
    (new Date().getFullYear() - 2 + i).toString(),
  );

// Custom hooks
const useAnalyticsData = (userId: string) => {
  const monthlyRevenue = useQuery(api.events.getMonthlyRevenue, { userId });
  const eventMetrics = useQuery(api.events.getAllUserEventsMetrics, { userId });
  const eventWithMetrics = useQuery(api.events.getSellerEvents, { userId });
  const ticketDetails = useQuery(api.tickets.getAllUserTickets, { userId });

  const loadingStates = useMemo(
    () => ({
      eventsLoading: eventMetrics === undefined,
      revenueLoading: monthlyRevenue === undefined,
      ticketsLoading: ticketDetails === undefined,
    }),
    [eventMetrics, monthlyRevenue, ticketDetails],
  );

  const formattedRevenue = useMemo(
    () => monthlyRevenue || mockMonthlyRevenue,
    [monthlyRevenue],
  );

  return {
    monthlyRevenue,
    eventMetrics,
    eventWithMetrics: (eventWithMetrics || []) as EventWithMetrics[],
    ticketDetails,
    loadingStates,
    formattedRevenue,
  };
};

// Data processing functions
const getEventCategoriesData = (
  events: EventWithMetrics[],
): ChartDataPoint[] => {
  if (!events.length) return [];

  const categoryCounts = events.reduce(
    (acc, event) => {
      const categoryName = event.category || "Uncategorized";
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));
};

const getTicketsByEventData = (
  events: EventWithMetrics[],
): TicketsByEventData[] => {
  if (!events.length) return [];

  return events
    .map((event) => ({
      name: event.name || "Untitled Event",
      tickets: event.metrics?.soldTickets || 0,
    }))
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 5);
};

const getTicketsByStatusData = (
  events: EventWithMetrics[],
): ChartDataPoint[] => {
  if (!events.length) return [];

  const statusCounts = events.reduce(
    (acc, event) => {
      if (event.status) {
        acc[event.status] = (acc[event.status] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
};

// Components
const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-[300px] w-full" />
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
    {message}
  </div>
);

const EventsCategoryChart = ({
  data,
  loading,
}: {
  data: ChartDataPoint[];
  loading: boolean;
}) => (
  <Card className="p-0 border-none pt-4">
    <CardHeader>
      <CardTitle className="text-lg">Events by Category</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
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
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} events`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

const TopEventsChart = ({
  data,
  loading,
}: {
  data: TicketsByEventData[];
  loading: boolean;
}) => (
  <Card className="p-0 border-none pt-4">
    <CardHeader>
      <CardTitle className="text-lg">Top Events by Ticket Sales</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <LoadingSkeleton />
      ) : data.length === 0 ? (
        <EmptyState message="No ticket data available" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12 }}
              width={150}
              tickFormatter={truncateText}
            />
            <Tooltip formatter={(value) => [`${value} tickets`, "Sold"]} />
            <Bar dataKey="tickets" fill="#4F46E5" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

const TicketsStatusChart = ({
  data,
  loading,
}: {
  data: ChartDataPoint[];
  loading: boolean;
}) => (
  <Card className="p-0 border-none pt-4">
    <CardHeader>
      <CardTitle className="text-lg">Tickets by Status</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <LoadingSkeleton />
      ) : data.length === 0 ? (
        <EmptyState message="No ticket data available" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
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
              {data.map((entry, index) => {
                const statusKey =
                  entry.name.toLowerCase() as keyof typeof STATUS_COLORS;
                const color =
                  STATUS_COLORS[statusKey] ||
                  CHART_COLORS[index % CHART_COLORS.length];
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Pie>
            <Tooltip formatter={(value) => [`${value} tickets`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

const MonthlyRevenueChart = ({
  data,
  loading,
}: {
  data: { month: number; revenue: number }[];
  loading: boolean;
}) => (
  <Card className="p-0 border-none pt-4">
    <CardHeader>
      <CardTitle className="text-lg">Monthly Revenue</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <LoadingSkeleton />
      ) : !data ? (
        <EmptyState message="No revenue data available" />
      ) : (
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: -30, top: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickFormatter={formatMonth} />
            <YAxis tickFormatter={formatCurrency} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="revenue" fill={chartConfig.revenue.color} radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={10}
                formatter={formatCurrency}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </CardContent>
  </Card>
);

// Main component
const AnalyticsPage = () => {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useUser();

  const { eventMetrics, eventWithMetrics, loadingStates, formattedRevenue } =
    useAnalyticsData(user?.id ?? "");

  const chartData = useMemo(
    () => ({
      eventCategories: getEventCategoriesData(eventWithMetrics),
      ticketsByEvent: getTicketsByEventData(eventWithMetrics),
      ticketsByStatus: getTicketsByStatusData(eventWithMetrics),
    }),
    [eventWithMetrics],
  );

  if (!user) return null;

  const years = generateYears();

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6">
      {/* Header */}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatsOverview stats={eventMetrics?.stats} />
          <RevenueChart data={formattedRevenue} />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EventsCategoryChart
              data={chartData.eventCategories}
              loading={loadingStates.eventsLoading}
            />
            <TopEventsChart
              data={chartData.ticketsByEvent}
              loading={
                loadingStates.eventsLoading || loadingStates.ticketsLoading
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TicketsStatusChart
              data={chartData.ticketsByStatus}
              loading={loadingStates.ticketsLoading}
            />
            <MonthlyRevenueChart
              data={formattedRevenue}
              loading={loadingStates.revenueLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
