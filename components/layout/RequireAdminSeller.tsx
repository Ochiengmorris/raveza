import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

export default async function RequireAdminSeller({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Check if user is admin seller via Convex
  const userDetails = await fetchQuery(api.users.getUserById, { userId });

  if (!userDetails?.isSeller) {
    //TODO: make an unauthorized page
    // For now, redirect to home page
    redirect("/seller");
  }

  return <>{children}</>;
}
