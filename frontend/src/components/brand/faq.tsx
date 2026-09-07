"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FaqItem[];
  className?: string;
}

export function FAQ({ items, className }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className={cn("divide-y divide-riva-cream/10 rounded-lg border border-riva-cream/10", className)}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${baseId}-btn-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div key={item.question}>
            <button
              type="button"
              id={buttonId}
              className="flex min-h-11 w-full items-center justify-between gap-4 px-5 py-3 text-left transition-riva hover:bg-riva-card/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riva-gold"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
            >
              <span className="font-display text-lg text-riva-cream">{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-riva-gold transition-transform duration-normal",
                  open && "rotate-180",
                )}
                strokeWidth={1.25}
                aria-hidden="true"
              />
            </button>
            {open ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-5 pb-4 text-sm leading-relaxed text-riva-muted"
              >
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
