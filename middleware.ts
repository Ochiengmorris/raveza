import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/server"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

// Store the access token and its expiry time
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const mpesaCredentials = {
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
};

async function generateAccessToken(): Promise<string | null> {
  const url =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const auth = Buffer.from(
    `${mpesaCredentials.consumerKey}:${mpesaCredentials.consumerSecret}`,
  ).toString("base64");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error("Error generating access token:", errorDetails);
    throw new Error(`Failed to generate access token: ${errorDetails}`);
  }

  const data = await response.json();

  // Cache the token and set its expiry time (usually 3600 seconds)
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return cachedToken;
}
export async function getAccessToken(): Promise<string | null> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    // Return cached token if valid
    return cachedToken;
  }

  // Otherwise, generate a new token
  return generateAccessToken();
}
