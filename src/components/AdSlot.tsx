"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

interface AdSlotProps {
  id: string;
  className?: string;
  /** Maximum height in pixels to cap the ad size */
  maxHeight?: number;
}

export function AdSlot({ id, className = "", maxHeight }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [filled, setFilled] = useState(false);

  const observeAd = useCallback(() => {
    const el = insRef.current;
    if (!el) return;

    // Use MutationObserver to detect when AdSense injects content
    const observer = new MutationObserver(() => {
      if (el.childElementCount > 0 || el.dataset.adStatus === "filled") {
        setFilled(true);
        observer.disconnect();
      }
    });

    observer.observe(el, {
      childList: true,
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });

    // Also check the data-ad-status attribute that AdSense sets
    // "unfilled" means no ad available — keep hidden
    const checkStatus = () => {
      const status = el.dataset.adStatus;
      if (status === "filled") {
        setFilled(true);
        observer.disconnect();
      }
    };

    // Poll briefly in case the attribute was set before the observer attached
    const timer = setTimeout(checkStatus, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded (e.g. ad blocker) — ad stays hidden
    }
    return observeAd();
  }, [observeAd]);

  return (
    <div
      id={id}
      className={className}
      aria-label="Advertisement"
      role="complementary"
      style={{
        display: filled ? "block" : "none",
        overflow: "hidden",
        ...(maxHeight ? { maxHeight: `${maxHeight}px` } : {}),
      }}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3359889042531313"
        data-ad-slot=""
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
