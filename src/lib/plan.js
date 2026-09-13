// Subscription plan gating. "pro_gift" is not sold anywhere — it's the
// free-forever override for a self-hosted deployment (see README:
// "Give your own family Pro for free"), set by hand in Firestore.
export const PLAN_LIMITS = {
  free: { maxChildren: 1, maxChapterId: 2, weeklyReport: false, customWords: false },
  pro: { maxChildren: 6, maxChapterId: 99, weeklyReport: true, customWords: true },
  pro_gift: { maxChildren: 6, maxChapterId: 99, weeklyReport: true, customWords: true },
};

export function limitsFor(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}
export function isPro(plan) {
  return plan === "pro" || plan === "pro_gift";
}

export const PRICING = [
  { id: "monthly", label: "Monthly", price: "£4.99", period: "/month" },
  { id: "annual", label: "Annual", price: "£34.99", period: "/year", badge: "Save 40%" },
];
