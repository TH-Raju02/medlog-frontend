import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { subscriptionsApi } from "./api/medlogApi";
import { PlanId, Subscription } from "../types/api";

const returnUrl = () =>
  Platform.OS === "web" && typeof window !== "undefined"
    ? `${window.location.origin}/payment-result`
    : Linking.createURL("payment-result");

/**
 * Opens Stripe Checkout in the in-app browser. Payment is confirmed with the API afterwards,
 * so a closed browser tab still activates a plan that was actually paid.
 */
export async function startCheckout(
  plan: PlanId
): Promise<{ paid: boolean; subscription?: Subscription }> {
  const redirect = returnUrl();
  const { data } = await subscriptionsApi.checkout({ plan, returnUrl: redirect });
  const { url, sessionId } = data.data;

  const result = await WebBrowser.openAuthSessionAsync(url, redirect);
  if (result.type === "success") {
    const status = Linking.parse(result.url).queryParams?.status;
    if (status === "cancel") return { paid: false };
  }

  const confirmation = await subscriptionsApi.confirm(sessionId);
  return confirmation.data.data;
}
