"use client";

import { useEffect } from "react";

/**
 * Adds `is-visible` to `.reveal` elements as they scroll into view.
 * Progressive enhancement only — content is fully visible without JS and for
 * users who prefer reduced motion.
 */
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    const scan = () =>
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => observer.observe(el));
    scan();

    const mutation = new MutationObserver(scan);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
