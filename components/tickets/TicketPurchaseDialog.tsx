"use client";

import { useState } from "react";
import { CreditCard, Loader, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import { formatPhoneNumber } from "@/lib/utils";
import { createMpesaPaymentRequest } from "@/actions/createMpesaPaymentRequest";
import {
  // checkStatusTransaction,
  queryTransactionCheck,
} from "@/actions/queryTransactionCheck";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function TicketPurchaseDialog({
  open,
  setIsOpen,
  eventId,
  ticketTypeId,
}: {
  open: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  eventId: Id<"events">;
  ticketTypeId: Id<"ticketTypes">;
}) {
  const [paymentMethod, setPaymentMethod] = useState<string>("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStkPushSent, setIsStkPushSent] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const { user } = useUser();
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
    ticketTypeId,
  });

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     console.log("doing this");
  //     if (checking) {
  //       const data = await checkStatusTransaction({
  //         checkoutRequestId: checkoutId,
  //       });

  //       if (data.transaction && data.transaction.status === "completed") {
  //         console.log("success");
  //         clearInterval(interval);
  //         setIsStkPushSent(false);
  //         setChecking(false);
  //         router.replace("/tickets/purchase-success");
  //       } else if (data.transaction && data.transaction.status === "failed") {
  //         console.log("failed");
  //         clearInterval(interval);
  //         setIsStkPushSent(false);
  //         setChecking(false);
  //       }
  //     }
  //   }, 4000);

  //   return () => clearInterval(interval);
  // }, [checking]);

  const handlePurchaseStripe = async () => {
    if (!user || !queuePosition || queuePosition.status !== "offered") {
      toast("Oops! Sorry, try reseving again", {
        description: "You took too long to purchase",
      });
      router.back();
      return;
    }
    toast("Payment Processor - Stripe", {
      description: "Coming soon...",
    });
  };

  const handlePurchaseMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(false);
    if (!user || !queuePosition || queuePosition.status !== "offered") {
      toast("Oops! Sorry, try reseving again", {
        description: "You took too long to purchase",
      });
      router.back();
      return;
    }

    try {
      setIsLoading(true);

      const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

      const response = await createMpesaPaymentRequest({
        eventId,
        phoneNumber: formattedPhoneNumber,
        ticketTypeId,
      });

      if (response.status === "ok") {
        setCheckoutId(response.data.checkoutRequestId);
        setIsStkPushSent(true);
        setChecking(true);
        toast("STK Push Sent", {
          description: "Please check your phone to complete the transaction.",
        });

        // Delay showing the confirm button
        setShowConfirmButton(false); // Reset visibility
        setTimeout(() => {
          setShowConfirmButton(true);
        }, 6000); // Show the button after 6 seconds
      }
    } catch (error) {
      toast("Oops! Sorry, try again later", {
        description: "An error occurred",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueryTransaction = async () => {
    if (!checkoutId) return;

    try {
      setIsLoading(true);

      const result = await queryTransactionCheck({
        checkoutRequestId: checkoutId,
      });

      if (result.status === "ok") {
        router.replace("/tickets/purchase-success");
        toast("Transaction Status", {
          description: `Result: ${result.message}`,
        });

        setIsStkPushSent(false);
      } else {
        toast("Transaction Failed", {
          description: result.message || "Unable to check transaction status.",
        });
        setIsStkPushSent(false);
      }
    } catch (error) {
      toast("Query Failed", {
        description: "An error occurred while querying the transaction.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Payment Method</DialogTitle>
          <DialogDescription>
            Select your preferred payment method to purchase your ticket.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup
            onValueChange={handlePaymentMethodChange}
            className="grid grid-cols-2 gap-4"
            defaultValue="mpesa"
          >
            <div>
              <RadioGroupItem
                value="stripe"
                id="stripe"
                className="peer sr-only"
              />
              <Label
                htmlFor="stripe"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <CreditCard className="mb-3 h-6 w-6" />
                Stripe
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="mpesa"
                id="mpesa"
                className="peer sr-only"
              />
              <Label
                htmlFor="mpesa"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Phone className="mb-3 h-6 w-6" />
                M-Pesa
              </Label>
            </div>
          </RadioGroup>
        </div>
        {paymentMethod === "stripe" ? (
          <Button
            onClick={handlePurchaseStripe}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader className=" h-4 w-4 animate-spin" />
                <p>Redirecting...</p>
              </>
            ) : (
              <p>Pay with Stripe</p>
            )}
          </Button>
        ) : (
          paymentMethod === "mpesa" && (
            <form onSubmit={handlePurchaseMpesa} className="space-y-4">
              {isStkPushSent ? (
                <div className="">
                  {checking && (
                    <p className="text-sm text-center mb-2 text-muted-foreground flex items-center justify-center gap-2">
                      {/* <Loader className=" h-4 w-4 animate-spin" /> */}
                      Click below after paying to confirm your purchase
                    </p>
                  )}
                  {showConfirmButton && (
                    <Button
                      onClick={handleQueryTransaction}
                      className="w-full font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <p>Confirming...</p>
                        </>
                      ) : (
                        "Confirm Transaction"
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="mpesa-number">M-Pesa Phone Number</Label>
                    <Input
                      id="mpesa-number"
                      type="tel"
                      placeholder="e.g., 0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <p>Processing...</p>
                      </>
                    ) : (
                      <p>Pay with Mpesa</p>
                    )}
                  </Button>
                </>
              )}
            </form>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
