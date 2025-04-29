"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, User } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  avatar: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { user } = useUser();
  // const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventMetrics = useQuery(api.events.getAllUserEventsMetrics, {
    userId: user?.id ?? "",
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.emailAddresses[0]?.emailAddress || "",
      avatar: user?.imageUrl || "",
    },
  });

  if (!user) return null;

  async function onSubmit(values: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      // Simulate a network request
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form submitted successfully", values);
      toast("Profile updated", {
        description: "Your profile information has been updated successfully.",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast("Update failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating your profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className=" max-w-screen-xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-slate-500">
          Manage your personal information and how it is displayed
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <Card className="lg:col">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and how others see you on the
              platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 rounded-full border-2 border-slate-200 flex items-center justify-center overflow-hidden bg-slate-100">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user?.fullName || user?.username || "User profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{user?.username}</h3>
                    <Badge variant="outline" className="mt-1">
                      Event Organizer
                    </Badge>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/your-image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    //TODO: Implement
                    className="hidden"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Account Info Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
            <CardDescription>
              Your account details and membership information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500">Username</h4>
                <p className="mt-1">{user?.username}</p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-slate-500">
                  Member Since
                </h4>
                <p className="mt-1">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not available"}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-slate-500">
                  Events Created
                </h4>
                <p className="mt-1">{eventMetrics?.stats.liveEvents} events</p>
              </div>

              <Separator />

              <div className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/admin/settings">Manage Account Settings</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
