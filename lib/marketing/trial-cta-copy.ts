/** Hero / pricing primary label when the user is signed out. */
export function primaryTrialCtaLabel(trialDays: number): string {
  if (trialDays === 3) {
    return "Start 3-Day Free Trial";
  }
  if (trialDays > 0) {
    return "Start Free Trial";
  }
  return "Subscribe";
}
