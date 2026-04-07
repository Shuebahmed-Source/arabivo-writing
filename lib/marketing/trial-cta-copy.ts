/**
 * Hero / pricing primary label when the user is signed out.
 * For “Start 3-Day Free Trial” / “Start Free Trial”, set STRIPE_TRIAL_PERIOD_DAYS on the server (e.g. Vercel).
 * If unset, we avoid cold “Subscribe” copy that looks unlike the signed-in CTA.
 */
export function primaryTrialCtaLabel(trialDays: number): string {
  if (trialDays === 3) {
    return "Start 3-Day Free Trial";
  }
  if (trialDays === 7) {
    return "Start 7-Day Free Trial";
  }
  if (trialDays > 0) {
    return "Start Free Trial";
  }
  return "Start your free trial";
}
