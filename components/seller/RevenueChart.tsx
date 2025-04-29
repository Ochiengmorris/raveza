"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type TimeRange = "monthly" | "quarterly" | "yearly";

interface RevenueChartProps {
  data?: Array<{ month: number; revenue: number }>;
  isLoading?: boolean;
  className?: string;
}

const RevenueChart = ({ data, isLoading, className }: RevenueChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const processChartData = (
    data: Array<{ month: number; revenue: number }> | undefined,
  ) => {
    if (!data) return [];

    // Format month names
    return data.map((item) => ({
      ...item,
      month: getMonthName(item.month),
    }));
  };

  const getMonthName = (month: number) => {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString("default", { month: "short" });
  };

  const chartData = processChartData(data);

  // Custom tooltip formatter
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2 rounded shadow-lg text-sm">
          <p className="font-medium">{label}</p>
          <p>Revenue: KSh {payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("border border-slate-200 bg-white p-0", className)}>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="font-semibold text-lg text-slate-900">
            Revenue Overview
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={timeRange === "monthly" ? "default" : "ghost"}
              className={cn(
                "text-xs px-2 py-1",
                timeRange === "monthly"
                  ? "bg-jmprimary hover:bg-jmprimary"
                  : "bg-slate-200 text-slate-700",
              )}
              onClick={() => setTimeRange("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={timeRange === "quarterly" ? "default" : "ghost"}
              className={cn(
                "text-xs px-2 py-1",
                timeRange === "quarterly"
                  ? "bg-jmprimary hover:bg-jmprimary"
                  : "bg-slate-200 text-slate-700",
              )}
              onClick={() => setTimeRange("quarterly")}
            >
              Quarterly
            </Button>
            <Button
              variant={timeRange === "yearly" ? "default" : "ghost"}
              className={cn(
                "text-xs px-2 py-1",
                timeRange === "yearly"
                  ? "bg-jmprimary hover:bg-jmprimary"
                  : "bg-slate-200 text-slate-700",
              )}
              onClick={() => setTimeRange("yearly")}
            >
              Yearly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full mt-4" />
        ) : !data || data.length === 0 ? (
          <div className="h-[250px] w-full flex items-center justify-center text-slate-500">
            No revenue data available
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 20,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(0.795 0.184 86.047)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.795 0.184 86.047)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.795 0.184 86.047)"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  dot={{
                    r: 4,
                    fill: "oklch(0.795 0.184 86.047)",
                    strokeWidth: 2,
                    stroke: "#FFFFFF",
                  }}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
