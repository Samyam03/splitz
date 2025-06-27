import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useStoreUserEffect = () => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const storeUser = useMutation(api.users.store);
  const hasStoredUser = useRef(false);

  useEffect(() => {
    // If clerk has loaded, user is signed in, and we haven't stored the user yet
    if (isLoaded && isSignedIn && userId && !hasStoredUser.current) {
      hasStoredUser.current = true;
      // Store the user in Convex using the built-in useMutation
      storeUser()
        .then(() => {
          console.log("User stored successfully");
        })
        .catch((error) => {
          console.error("Failed to store user:", error);
          hasStoredUser.current = false; // Reset on error to retry
        });
    }
    
    // Reset when user signs out
    if (isLoaded && !isSignedIn) {
      hasStoredUser.current = false;
    }
  }, [isLoaded, isSignedIn, userId, storeUser]);

  return { isLoaded, isSignedIn };
};