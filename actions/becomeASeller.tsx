"use server";

import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { auth } from "@clerk/nextjs/server";

export const becomeASeller = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const convex = getConvexClient();

  try {
    await convex.mutation(api.users.updateSeller, {
      userId,
      isSeller: true,
    });

    return {
      status: "ok",
      message: "You have successfully become a seller",
    };
  } catch (error) {
    console.error("Error becoming a seller:", error);
    throw new Error("Error becoming a seller");
  }
};
