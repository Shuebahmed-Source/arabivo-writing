"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LearnHeader() {
  const pathname = usePathname();
  const dashboardActive =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const lessonsActive = pathname.startsWith("/lessons");

  return (
    <nav className="learn-nav">
      <Link href="/dashboard" className="learn-wordmark">
        Arabivo<b>Write</b>
      </Link>

      <div className="learn-nav-center learn-nav-tabs">
        <Link
          href="/dashboard"
          className={`learn-nav-tab${dashboardActive ? " active" : ""}`}
        >
          Dashboard
        </Link>
        <Link
          href="/lessons"
          className={`learn-nav-tab${lessonsActive ? " active" : ""}`}
        >
          Lessons
        </Link>
      </div>

      <div className="learn-nav-actions">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button type="button" className="learn-nav-signin">
              Sign in
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </Show>
      </div>
    </nav>
  );
}
