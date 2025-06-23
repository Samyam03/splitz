"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function ConvexClientProviderInner({
  children,
}: {
  children: React.ReactNode;
}) {
  useStoreUserEffect();
  return children;
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <ConvexClientProviderInner>{children}</ConvexClientProviderInner>
    </ConvexProviderWithClerk>
  );
}