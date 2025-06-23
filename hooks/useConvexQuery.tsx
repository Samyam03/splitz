import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useConvexQuery = (query: any, args?: any) => {
  const result = useQuery(query, args);
  const [data, setData] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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
  }, [result]);

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
      const response = await mutationFn(args);
      setData(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (error.message !== "User not authenticated" && 
          error.message !== "Called storeUser without authentication present") {
        toast.error(error.message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
};