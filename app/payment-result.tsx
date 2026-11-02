import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Loader } from "../src/components/ui/Loader";
import { subscriptionsApi } from "../src/services/api/medlogApi";
import { useAuthStore } from "../src/store/authStore";

// Closes the web checkout popup and hands the URL back to the window that opened it.
WebBrowser.maybeCompleteAuthSession();

/** Landing route for the Stripe return deep link (medlog://payment-result). */
export default function PaymentResultScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const { status, session_id: sessionId } = useLocalSearchParams<{ status?: string; session_id?: string }>();

  useEffect(() => {
    let cancelled = false;
    const finish = async () => {
      if (!user) {
        router.replace("/(auth)/login");
        return;
      }
      if (status === "success" && sessionId) {
        try {
          const { data } = await subscriptionsApi.confirm(sessionId);
          await refreshUser();
          if (!cancelled && data.data.paid) {
            router.replace("/(auth)/onboarding-complete");
            return;
          }
        } catch {
          // fall through to the subscription page, which shows the current state
        }
      }
      if (!cancelled) router.replace("/settings/subscription");
    };
    finish();
    return () => {
      cancelled = true;
    };
  }, [refreshUser, router, sessionId, status, user]);

  return <Loader />;
}
