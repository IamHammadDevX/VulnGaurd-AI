import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";

interface Subscription {
  id: string;
  status: "active" | "cancelled" | "expired" | "paused";
  plan: string;
  renewsAt: string;
  endsAt: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription details
  const fetchSubscription = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/payments/subscription/${user.id}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch subscription");

      const data = await response.json();
      setSubscription(data.subscription);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch subscription on mount
  useEffect(() => {
    void fetchSubscription();
  }, [fetchSubscription]);

  // Create checkout
  const createCheckout = useCallback(
    async (planType: "growth" | "enterprise", billingCycle: "monthly" | "annual" = "monthly") => {
      if (!user?.email) {
        setError("You must be logged in to upgrade");
        return null;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            planType,
            billingCycle,
            email: user.email,
            userId: user.id,
          }),
        });

        if (!response.ok) throw new Error("Failed to create checkout");

        const data = await response.json();
        setError(null);
        return data.checkoutUrl;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Cancel subscription
  const cancelSubscription = useCallback(
    async (subscriptionId: string) => {
      setLoading(true);
      try {
        const response = await fetch("/api/payments/cancel-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ subscriptionId }),
        });

        if (!response.ok) throw new Error("Failed to cancel subscription");

        setError(null);
        // Refresh subscription data
        await fetchSubscription();
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchSubscription]
  );

  return {
    subscription,
    loading,
    error,
    createCheckout,
    cancelSubscription,
    refetch: fetchSubscription,
  };
}
