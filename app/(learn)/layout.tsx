import { PageContainer } from "@/components/layout/page-container";
import { SiteHeader } from "@/components/layout/site-header";

export const dynamic = "force-dynamic";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <PageContainer>{children}</PageContainer>
    </div>
  );
}
