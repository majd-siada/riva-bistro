"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

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

  return (
    <div className={cn("divide-y divide-riva-cream/10 rounded-lg border border-riva-cream/10", className)}>
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-riva hover:bg-riva-card/50"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : index)}
            >
              <span className="font-display text-lg text-riva-cream">{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-riva-gold transition-transform duration-normal",
                  open && "rotate-180",
                )}
                strokeWidth={1.25}
              />
            </button>
            {open && (
              <div className="px-5 pb-4 text-sm leading-relaxed text-riva-muted">{item.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
