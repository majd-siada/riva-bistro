import type { LucideIcon } from "lucide-react";

import { GoldDivider } from "@/components/brand/gold-divider";
import { cn } from "@/lib/utils";

interface ValueCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
  className?: string;
}

export function ValueCard({ icon: Icon, title, body, className }: ValueCardProps) {
  return (
    <div className={cn("riva-card p-6 md:p-8", className)}>
      <Icon className="h-5 w-5 text-riva-gold" strokeWidth={1.25} />
      <GoldDivider variant="short" className="my-5 opacity-50" />
      <h3 className="font-display text-xl text-riva-cream">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-riva-muted">{body}</p>
    </div>
  );
}
