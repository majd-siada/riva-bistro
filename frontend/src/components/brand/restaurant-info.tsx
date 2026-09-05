import { business, fullAddress } from "@/config/business";
import type { OpeningHour } from "@/lib/api";
import { formatDayHours } from "@/lib/hours";

export function RestaurantInfo({ hours }: { hours: OpeningHour[] }) {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <p className="riva-label">Hitta hit</p>
        <h2 className="mt-3 font-display text-3xl text-riva-cream">Besök oss</h2>
        <address className="mt-6 space-y-2 not-italic text-riva-muted">
          <p>{fullAddress()}</p>
          <p>
            <a href={business.phoneHref} className="hover:text-riva-cream">
              {business.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${business.email}`} className="hover:text-riva-cream">
              {business.email}
            </a>
          </p>
        </address>
      </div>
      <div>
        <p className="riva-label">Öppettider</p>
        <h2 className="mt-3 font-display text-3xl text-riva-cream">När vi har öppet</h2>
        {hours.length > 0 ? (
          <ul className="mt-6 space-y-2 text-sm text-riva-muted">
            {hours.map((h) => (
              <li key={h.weekday} className="flex justify-between gap-4">
                <span>{h.weekday_label}</span>
                <span className="tabular-nums">{formatDayHours(h)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-riva-muted">{business.restaurantHoursLabel}</p>
        )}
        {business.kitchenHours ? (
          <p className="mt-4 text-xs text-riva-muted/80">{business.kitchenHours}</p>
        ) : null}
      </div>
    </div>
  );
}
