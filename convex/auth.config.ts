const authConfig = {
    providers: [
      {
        domain: process.env.CLERK_JWT_ISSUER,
        applicationID: "convex",
      },
    ]
  };

export default authConfig;