"use client";

import { useEffect, useRef, useState } from "react";

/** Tracks an element's content width so SVG charts can lay out to real pixels. */
export function useElementWidth<T extends HTMLElement>(fallback = 500) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width] as const;
}
