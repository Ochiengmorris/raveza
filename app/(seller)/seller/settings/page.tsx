"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const SettingsPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onPasswordSubmit(values: PasswordFormValues) {
    setIsSubmitting(true);
    try {
      // do the logic here
      //then...
      console.log(values);
      passwordForm.reset();

      toast("Password updated", {
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      toast("Update failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating your password",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-slate-500">
          Manage your account security and preferences
        </p>
      </div>
      <Tabs defaultValue="security" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent
          value="security"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Password Change */}
          <Card className="border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                Password
              </CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter current password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting} className="">
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="border-none">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Account Deletion</AlertTitle>
                <AlertDescription>
                  Deleting your account is permanent. All your data will be
                  wiped out immediately and you won&apos;t be able to get it
                  back.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => toast("Account deletion coming soon")}
                variant="destructive"
              >
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent
          value="billing"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <Card className="border-none">
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your payment methods and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <p className="text-slate-500">
                  Billing features are coming soon.
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  You&apos;ll be able to manage payment methods and see invoices
                  here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="notifications"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <Card className="border-none">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control what notifications you receive and how
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <p className="text-slate-500">
                  Notification preferences are coming soon.
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  You&apos;ll be able to customize email, mobile, and in-app
                  notifications here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
