import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";

async function checkAvailability(code: Id<"promoCodes">) {
  const isAvailable = await fetchQuery(api.promoCodes.checkAvailabilityPromo, {
    code,
  });
  return isAvailable;
}

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

  // console.log(promoCodes, code.toUpperCase());

  if (!promoCodes) {
    return {
      success: false,
      error: "No promo codes found for this event",
    };
  }

  try {
    const upperCode = typeof code === "string" ? code.toUpperCase() : "";
    const promoCode = promoCodes.find((p) => p.code === upperCode);
    if (!promoCode) {
      return {
        success: false,
        error: "Promo code not found",
      };
    }

    const isAvailable = await checkAvailability(promoCode._id);
    const isValid = new Date(promoCode.expiresAt) > new Date();
    if (!isValid) {
      return {
        success: false,
        error: "Promo code has expired",
      };
    }
    if (!isAvailable) {
      return {
        success: false,
        error: "Promo code has exhausted its usage limit",
      };
    }

    return {
      success: true,
      promoCodeValues: {
        id: promoCode._id,
        code: promoCode.code,
        discount: promoCode.discountPercentage,
        expiresAt: promoCode.expiresAt,
        isActive: promoCode.isActive,
      },
    };
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return {
      success: false,
      error: "An error occurred while verifying the promo code",
    };
  }
};

export default VerifyPromoCode;
