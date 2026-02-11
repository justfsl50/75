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

    const checkFilled = () => {
      // Only show when AdSense explicitly marks the ad as "filled"
      if (el.dataset.adStatus === "filled") {
        setFilled(true);
        observer.disconnect();
        return true;
      }
      return false;
    };

    const observer = new MutationObserver(() => {
      checkFilled();
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });

    // Poll a few times in case the attribute was set before the observer
    const t1 = setTimeout(checkFilled, 1500);
    const t2 = setTimeout(checkFilled, 3000);
    const t3 = setTimeout(() => {
      checkFilled();
      observer.disconnect();
    }, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
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
