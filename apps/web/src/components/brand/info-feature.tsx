import type { LucideIcon } from "lucide-react";

import { GoldDivider } from "@/components/brand/gold-divider";
import { cn } from "@/lib/utils";

interface InfoFeatureProps {
  icon: LucideIcon;
  label: string;
  text: string;
  className?: string;
}

export function InfoFeature({ icon: Icon, label, text, className }: InfoFeatureProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-riva-gold" strokeWidth={1.25} />
        <GoldDivider variant="short" className="flex-1 opacity-60" />
      </div>
      <p className="riva-label">{label}</p>
      <p className="text-sm leading-relaxed text-riva-muted">{text}</p>
    </div>
  );
}
