import { Clock, MapPin, Phone } from "lucide-react";

import { business, fullAddress } from "@/config/business";
import type { OpeningHour } from "@/lib/api";
import { todayHoursLabel } from "@/lib/hours";
import { cn } from "@/lib/utils";

export function HoursStrip({
  hours,
  className,
}: {
  hours: OpeningHour[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-3",
        className,
      )}
    >
      <InfoChip icon={Clock} label="Öppettider" value={todayHoursLabel(hours)} />
      <InfoChip icon={MapPin} label="Adress" value={fullAddress()} href={business.mapUrl} />
      <InfoChip icon={Phone} label="Telefon" value={business.phone} href={business.phoneHref} />
    </div>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-riva-gold" strokeWidth={1.25} aria-hidden />
      <span>
        <span className="block text-[0.65rem] uppercase tracking-[0.2em] text-riva-gold">
          {label}
        </span>
        <span className="mt-1 block text-sm text-riva-cream">{value}</span>
      </span>
    </>
  );
  const className =
    "flex items-start gap-3 rounded-lg border border-riva-cream/15 bg-riva-black/55 px-4 py-3 backdrop-blur-sm";
  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return <div className={className}>{inner}</div>;
}
