"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface GuestContextType {
  guestToken: string | null;
  setGuestToken: (token: string) => void;
  clearGuest: () => void;
  isGuest: boolean;
  guestInfo: GuestInfo | null;
  setGuestInfo: (info: GuestInfo) => void;
  convertGuestToUser: () => Promise<void>;
  isConverting: boolean;
}

interface GuestInfo {
  id: string;
  email: string;
  name: string;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [guestToken, setGuestTokenState] = useState<string | null>(null);
  const [guestInfo, setGuestInfoState] = useState<GuestInfo | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const { user, isLoaded } = useUser();
  const convertGuestMutation = useMutation(api.users.convertGuestToUser);

  useEffect(() => {
    // Only load from sessionStorage on client side
    if (typeof window !== "undefined") {
      const savedToken = sessionStorage.getItem("guestToken");
      const savedInfo = sessionStorage.getItem("guestInfo");

      if (savedToken) {
        setGuestTokenState(savedToken);
      }

      if (savedInfo) {
        try {
          setGuestInfoState(JSON.parse(savedInfo));
        } catch (error) {
          console.error("Failed to parse guest info:", error);
        }
      }
    }
  }, []);

  const clearGuest = useCallback(() => {
    setGuestTokenState(null);
    setGuestInfoState(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("guestToken");
      sessionStorage.removeItem("guestInfo");
    }
  }, []);

  const convertGuestToUser = useCallback(async () => {
    if (!guestToken || !user) return;

    setIsConverting(true);
    try {
      await convertGuestMutation({
        guestToken,
        authUserId: user.id,
      });

      // Clear guest data after successful conversion
      clearGuest();
      console.log("Guest account successfully converted to user account");
    } catch (error) {
      console.error("Failed to convert guest to user:", error);
    } finally {
      setIsConverting(false);
    }
  }, [guestToken, user, convertGuestMutation, clearGuest]);

  // Auto-convert guest to user when they sign in
  useEffect(() => {
    if (isLoaded && user && guestToken && !isConverting) {
      convertGuestToUser();
    }
  }, [isLoaded, user, guestToken, isConverting, convertGuestToUser]);

  const setGuestToken = useCallback((token: string) => {
    setGuestTokenState(token);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("guestToken", token);
    }
  }, []);

  const setGuestInfo = useCallback((info: GuestInfo) => {
    setGuestInfoState(info);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("guestInfo", JSON.stringify(info));
    }
  }, []);

  return (
    <GuestContext.Provider
      value={{
        guestToken,
        setGuestToken,
        clearGuest,
        isGuest: !!guestToken && !user,
        guestInfo,
        setGuestInfo,
        convertGuestToUser,
        isConverting,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuest must be used within GuestProvider");
  }
  return context;
};

// Custom hook that combines Clerk user and guest info
export const useCurrentUser = () => {
  const { user } = useUser();
  const { isGuest, guestInfo, guestToken } = useGuest();

  return {
    isAuthenticated: !!user,
    isGuest,
    user,
    guestInfo,
    guestToken,
    // Unified user info
    currentUser: user
      ? {
          user,
          type: "authenticated" as const,
        }
      : isGuest && guestInfo
        ? {
            id: guestToken,
            email: guestInfo.email,
            name: guestInfo.name,
            type: "guest" as const,
          }
        : null,
  };
};
