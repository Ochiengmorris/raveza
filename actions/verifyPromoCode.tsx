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
      error: "Promo codes have  not found",
    };
  }

  try {
    const upperCode = typeof code === "string" ? code.toUpperCase() : "";
    const promoCode = promoCodes.find((p) => p.code === upperCode);

    const isAvailable = await checkAvailability(
      promoCode?._id ?? ("" as Id<"promoCodes">),
    );
    if (!isAvailable) {
      return {
        success: false,
        error: "Promo code has exhausted its usage limit",
      };
    }

    if (promoCode) {
      const isValid = new Date(promoCode.expiresAt) > new Date();
      return isValid
        ? {
            success: true,
            promoCodeValues: {
              id: promoCode._id,
              code: promoCode.code,
              discount: promoCode.discountPercentage,
              expiresAt: promoCode.expiresAt,
              isActive: promoCode.isActive,
            },
          }
        : {
            success: false,
            error: "Promo code has expired",
          };
    } else {
      return {
        success: false,
        error: "Promo code not found",
      };
    }
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return {
      success: false,
      error: "An error occurred while verifying the promo code",
    };
  }
};

export default VerifyPromoCode;
