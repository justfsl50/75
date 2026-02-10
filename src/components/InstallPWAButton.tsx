"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Capture the event globally so it's never missed even before React mounts
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.__pwaInstallPrompt = e as BeforeInstallPromptEvent;
  });
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as unknown as { standalone: boolean }).standalone)
  );
}

export function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showAndroidFallback, setShowAndroidFallback] = useState(false);

  useEffect(() => {
    // Already installed as a standalone app
    if (isInStandaloneMode()) {
      setInstalled(true);
      return;
    }

    // iOS: Show manual instructions since beforeinstallprompt is not supported
    if (isIOS()) {
      setShowIOSPrompt(true);
      return;
    }

    // Check if the prompt was already captured globally before React mounted
    if (window.__pwaInstallPrompt) {
      setDeferredPrompt(window.__pwaInstallPrompt);
    }

    // Listen for future prompt events
    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    // Android fallback: if no prompt after 3s, the site may not be served
    // over HTTPS or doesn't fully meet PWA criteria. Show manual instructions.
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    if (isAndroid()) {
      fallbackTimer = setTimeout(() => {
        if (!window.__pwaInstallPrompt) {
          setShowAndroidFallback(true);
        }
      }, 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  if (installed) return null;

  // iOS fallback
  if (showIOSPrompt) {
    return (
      <Button
        onClick={() =>
          alert(
            'To install this app:\n\n1. Tap the Share button (square with arrow) in Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"'
          )
        }
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Share className="h-3.5 w-3.5" />
        Install App
      </Button>
    );
  }

  // Android: native install prompt
  if (deferredPrompt) {
    const handleInstall = async () => {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
      }
      window.__pwaInstallPrompt = null;
      setDeferredPrompt(null);
    };

    return (
      <Button
        onClick={handleInstall}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Download className="h-3.5 w-3.5" />
        Install App
      </Button>
    );
  }

  // Android fallback: prompt didn't fire (HTTP or criteria not met)
  if (showAndroidFallback) {
    return (
      <Button
        onClick={() =>
          alert(
            'To install this app:\n\n1. Tap the browser menu (⋮) in Chrome\n2. Tap "Add to Home screen" or "Install app"\n3. Tap "Add"\n\nNote: The app must be accessed over HTTPS for automatic install prompts.'
          )
        }
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Download className="h-3.5 w-3.5" />
        Install App
      </Button>
    );
  }

  return null;
}
