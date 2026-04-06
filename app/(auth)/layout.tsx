import { AuthHeader } from "@/components/layout/auth-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AuthHeader />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8 sm:py-10">
        {children}
      </div>
    </div>
  );
}
