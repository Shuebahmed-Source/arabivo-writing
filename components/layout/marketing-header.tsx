import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex min-h-14 w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:min-h-16 sm:px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-lg"
        >
          ArabivoWrite
        </Link>
        <nav
          className="flex flex-wrap items-center gap-2"
          aria-label="Marketing"
        >
          <Button
            variant="ghost"
            size="lg"
            nativeButton={false}
            render={<Link href="/sign-in" />}
            className="min-h-11 px-4"
          >
            Sign in
          </Button>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/sign-up" />}
            className="min-h-11 px-4"
          >
            Start learning
          </Button>
        </nav>
      </div>
    </header>
  );
}
