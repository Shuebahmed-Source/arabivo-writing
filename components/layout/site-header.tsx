"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinkClass = (active: boolean) =>
  cn(
    "inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4",
    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-0 sm:min-h-14">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <Link
            href="/dashboard"
            className="text-base font-semibold tracking-tight text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ArabivoWrite
          </Link>
          <nav
            className="flex flex-wrap items-center gap-1 sm:gap-2"
            aria-label="Learning app"
          >
            <Link
              href="/dashboard"
              className={navLinkClass(pathname === "/dashboard")}
            >
              Dashboard
            </Link>
            <Link
              href="/lessons"
              className={navLinkClass(pathname.startsWith("/lessons"))}
            >
              Lessons
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="outline" size="lg" className="min-h-11 w-full sm:w-auto">
                Sign in
              </Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}
