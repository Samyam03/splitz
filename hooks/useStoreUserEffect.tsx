import { useConvexMutation } from "./useConvexQuery";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

export const useStoreUserEffect = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { mutate: storeUser } = useConvexMutation(api.users.store);

  useEffect(() => {
    // If clerk has loaded and the user is signed in
    if (isLoaded && isSignedIn) {
      // Store the user in Convex
      storeUser().catch(console.error);
    }
  }, [isLoaded, isSignedIn, storeUser]);

  return { isLoaded, isSignedIn };
};