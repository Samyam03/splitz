import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

export const useConvexQuery = (query: any, args?: any) => {
  const { isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Always call useQuery, but pass a conditional query
  const result = useQuery(
    isLoaded && isSignedIn ? query : api.users.skip,
    args
  );

  useEffect(() => {
    // If auth is not loaded yet, keep loading
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    // If user is not signed in, set data to null and stop loading
    if (!isSignedIn) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (result === undefined) {
      setLoading(true);
    } else {
      try {
        setData(result);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        // Only show non-auth related errors
        if (error.message !== "User not authenticated" && 
            error.message !== "Called storeUser without authentication present") {
          toast.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    }
  }, [result, isLoaded, isSignedIn]);

  return { data, loading, error };
};

export const useConvexMutation = (mutation: any) => {
  const mutationFn = useMutation(mutation);
  const [data, setData] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (args?: any) => {
    setLoading(true);
    setError(null);
    try {
      // Increase timeout and add better error handling
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout - please try again")), 30000)
      );
      
      const mutationPromise = mutationFn(args);
      const response = await Promise.race([mutationPromise, timeoutPromise]);
      
      setData(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Don't show connection errors for auth-related failures
      if (error.message === "User not authenticated" || 
          error.message === "Called storeUser without authentication present") {
        throw error; // Re-throw without showing toast
      }
      
      // Handle specific connection errors
      if (error.message.includes("TooManyConcurrentMutations")) {
        const wsError = new Error("Too many requests - please wait a moment and try again");
        toast.error(wsError.message);
        throw wsError;
      } else if (error.message.includes("WebSocket") || error.message.includes("timeout")) {
        const wsError = new Error("Connection issue - please wait a moment and try again");
        toast.error(wsError.message);
        throw wsError;
      } else {
        // Show other errors normally
        toast.error(error.message);
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
};