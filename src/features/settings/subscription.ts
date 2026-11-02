import { PlanId, Subscription } from "../../types/api";

export const PLAN_NAMES: Record<PlanId, string> = {
  monthly: "Monthly",
  six_months: "6 Months",
  annual: "12 Months",
};

/** "12 Months · Active", "Monthly · Expired", "No active plan". */
export const subscriptionLabel = (s?: Subscription) => {
  if (!s || s.status === "none" || !s.plan) return "No active plan";
  return `${PLAN_NAMES[s.plan]} · ${s.status === "active" ? "Active" : "Expired"}`;
};
