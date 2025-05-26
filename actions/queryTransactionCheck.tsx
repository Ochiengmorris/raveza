"use server";

import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { MpesaCredentials } from "@/lib/mpesa";
import { getAccessToken } from "@/middleware";
// import { auth } from "@clerk/nextjs/server";

const mpesaCredentials: MpesaCredentials = {
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  passkey: process.env.MPESA_PASSKEY!,
  shortcode: process.env.MPESA_SHORTCODE!,
};

export async function queryTransactionCheck({
  checkoutRequestId,
  // guestUserId,
}: {
  checkoutRequestId: string;
  guestUserId?: string;
}) {
  // const { userId } = await auth();
  // const effectiveId = userId ?? guestUserId;
  // if (!effectiveId) throw new Error("Not authenticated");

  const accessToken = await getAccessToken();

  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3);

  const password = Buffer.from(
    `${mpesaCredentials.shortcode}${mpesaCredentials.passkey}${timestamp}`,
  ).toString("base64");

  const requestBody = {
    BusinessShortCode: mpesaCredentials.shortcode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const convex = getConvexClient();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.ResultCode === "0") {
      const transaction = await convex.query(
        api.mpesaTransactions.getByCheckoutRequestId,
        {
          checkoutRequestId,
        },
      );

      if (!transaction) {
        console.error(
          "Transaction not found for CheckoutRequestID:",
          checkoutRequestId,
        );
        return { message: "Transaction not found", status: 404 };
      }

      const metadata = JSON.parse(transaction.metadata);

      await convex.mutation(api.mpesaTransactions.updateStatus, {
        checkoutRequestId: data.CheckoutRequestID,
        status: "completed",
        resultCode: Number(data.ResultCode),
        resultDesc: data.ResultDesc,
      });

      // Process the ticket purchase
      const result = await convex.mutation(api.events.purchaseMpesaTicket, {
        eventId: metadata.eventId,
        userId: metadata.userId,
        waitingListId: metadata.waitingListId,
        paymentInfo: {
          amount: transaction.amount,
          checkoutRequestId: data.CheckoutRequestID,
        },
      });
      if (transaction.promoCodeId) {
        await convex.mutation(api.promoCodes.createPromoCodeRedemption, {
          userId: metadata.userId,
          promoCodeId: transaction.promoCodeId,
          eventId: metadata.eventId,
          ticketId: result,
          redeemedAt: Date.now(),
          dicountAmount: transaction.amount,
        });
      }

      await convex.mutation(api.users.updateUserBalance, {
        eventId: metadata.eventId,
        amount: transaction.amount,
      });

      return {
        status: "ok",
        message: data.ResultDesc,
      };
    } else {
      try {
        // Update the transaction status to failed
        await convex.mutation(api.mpesaTransactions.updateStatus, {
          checkoutRequestId: data.CheckoutRequestID,
          status: "failed",
          resultCode: Number(data.ResultCode),
          resultDesc: data.ResultDesc,
        });

        return {
          status: "failed",
          message: data.ResultDesc,
        };
      } catch (updateError) {
        console.error("Error updating ticket payment status:", updateError);
        return { message: "Error updating ticket payment status", status: 500 };
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error querying transaction:", error.message);
      return {
        status: 500,
        message: error.message || "Query failed",
      };
    }
    console.error("Unexpected error:", error);
    return {
      status: 500,
      message: "Query failed",
    };
  }
}

// export const checkStatusTransaction = async ({
//   checkoutRequestId,
// }: {
//   checkoutRequestId: string | null;
// }) => {
//   if (!checkoutRequestId) {
//     console.error("CheckoutRequestId is required");
//     return { message: "CheckoutRequestId is required", status: 400 };
//   }
//   const convex = getConvexClient();

//   try {
//     const transaction = await convex.query(
//       api.mpesaTransactions.getByCheckoutRequestId,
//       {
//         checkoutRequestId,
//       },
//     );

//     if (!transaction) {
//       console.error(
//         "Transaction not found for CheckoutRequestID:",
//         checkoutRequestId,
//       );
//       return { message: "Transaction not found", status: 404 };
//     }

//     return { transaction };
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("Error querying transaction:", error.message);
//       return {
//         status: 500,
//         message: error.message || "Query failed",
//       };
//     }
//     console.error("Unexpected error:", error);
//     return {
//       status: 500,
//       message: "Query failed",
//     };
//   }
// };
