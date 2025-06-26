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
      // Add timeout to prevent hanging mutations
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout - please try again")), 20000)
      );
      
      const mutationPromise = mutationFn(args);
      const response = await Promise.race([mutationPromise, timeoutPromise]);
      
      setData(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Handle WebSocket specific errors with better messaging
      if (error.message.includes("TooManyConcurrentMutations") || 
          error.message.includes("WebSocket") ||
          error.message.includes("timeout")) {
        const wsError = new Error("Connection issue - please wait a moment and try again");
        if (error.message !== "User not authenticated" && 
            error.message !== "Called storeUser without authentication present") {
          toast.error(wsError.message);
        }
        throw wsError;
      } else {
        if (error.message !== "User not authenticated" && 
            error.message !== "Called storeUser without authentication present") {
          toast.error(error.message);
        }
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
};