type Props = {
  message?: string;
};

export function OnboardingLoading({
  message = "Loading…",
}: Props) {
  return (
    <div className="onb-frame flex min-h-[50vh] flex-col items-center justify-center">
      <p className="onb-q-sub">{message}</p>
    </div>
  );
}
