import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";

const VerifyPromoCode = async ({
  eventId,
  code,
}: {
  eventId: Id<"events">;
  code: string;
}) => {
  const promoCodes = await fetchQuery(api.promoCodes.getEventPromoCodes, {
    eventId,
  });

  try {
    const promoCode = promoCodes.find((promoCode) => promoCode.code === code);

    if (promoCode) {
      const isValid = new Date(promoCode.expiresAt) > new Date();
      return isValid
        ? {
            success: true,
            promoCode,
          }
        : {
            success: false,
            error: "Promo code has expired",
          };
    }
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return {
      success: false,
      error: "An error occurred while verifying the promo code",
    };
  }

  return {
    success: false,
    error: "Promo code not found",
  };
};

export default VerifyPromoCode;
