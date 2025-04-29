import { ConvexHttpClient } from "convex/browser";

// Create a client for server-side HTTP requests
export const getConvexClient = () => {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
};

export const mockMonthlyRevenue = [
  { month: 1, revenue: 2500 },
  { month: 2, revenue: 3800 },
  { month: 3, revenue: 4200 },
  { month: 4, revenue: 6100 },
  { month: 5, revenue: 3000 },
  { month: 6, revenue: 0 }, // no sales this month
  { month: 7, revenue: 7200 },
  { month: 8, revenue: 5100 },
  { month: 9, revenue: 0 }, // no sales this month
  { month: 10, revenue: 8600 },
  { month: 11, revenue: 9400 },
  { month: 12, revenue: 10500 },
];
