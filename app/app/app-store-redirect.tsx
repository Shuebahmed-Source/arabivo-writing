"use client";

import { useEffect, useState } from "react";

const APP_STORE_URL = "https://apps.apple.com/app/id6781979187";
const FALLBACK_DELAY_MS = 1500;
const TIKTOK_UA_REGEX = /musical_ly|TikTok/i;

export function AppStoreRedirect() {
  const [isTikTok, setIsTikTok] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const tiktok = TIKTOK_UA_REGEX.test(navigator.userAgent);
    setIsTikTok(tiktok);

    if (tiktok) return;

    window.location.href = APP_STORE_URL;

    const timer = setTimeout(() => setShowFallback(true), FALLBACK_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <p style={styles.wordmark}>
          Arabivo<b>Write</b>
        </p>
        {isTikTok ? (
          <>
            <div style={styles.steps}>
              <div style={styles.step}>
                <span style={styles.stepNumber}>1</span>
                <span>Tap ••• in the top corner</span>
              </div>
              <div style={styles.step}>
                <span style={styles.stepNumber}>2</span>
                <span>Tap &ldquo;Open in browser&rdquo;</span>
              </div>
            </div>
            <p style={styles.text}>We&rsquo;ll take you straight to the App Store.</p>
          </>
        ) : (
          <>
            <p style={styles.text}>Opening the App Store...</p>
            {showFallback && (
              <a href={APP_STORE_URL} style={styles.button}>
                Tap here to open the App Store
              </a>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#ffffff",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "16px",
  },
  wordmark: {
    fontSize: "20px",
    fontWeight: 500,
    color: "#111827",
    margin: 0,
  },
  text: {
    fontSize: "16px",
    color: "#6b7280",
    margin: 0,
  },
  button: {
    marginTop: "8px",
    padding: "12px 24px",
    borderRadius: "9999px",
    backgroundColor: "hsl(160 84% 32%)",
    color: "#ffffff",
    fontWeight: 600,
    textDecoration: "none",
    fontSize: "15px",
  },
  steps: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "flex-start",
  },
  step: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "16px",
    color: "#111827",
  },
  stepNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "9999px",
    backgroundColor: "hsl(160 84% 32%)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    flexShrink: 0,
  },
};
