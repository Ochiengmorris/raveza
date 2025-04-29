const authConfig = {
  providers: [
    {
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      // domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      domain: "https://immortal-grackle-65.clerk.accounts.dev/",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
