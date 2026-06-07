export function isLifetimeStatus(status: string | null | undefined): boolean {
  return status === "lifetime";
}

export function isPaidSubscriptionStatus(
  status: string | null | undefined,
): boolean {
  if (!status) {
    return false;
  }
  return status === "active" || status === "trialing" || status === "lifetime";
}
