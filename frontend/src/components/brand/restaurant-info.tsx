import { business as fallbackBusiness, fullAddress as fallbackFullAddress } from "@/config/business";
import type { OpeningHour } from "@/lib/api";
import { formatDayHours } from "@/lib/hours";
import {
  fullAddressFrom,
  type PublicBusiness,
} from "@/lib/public-business";

export function RestaurantInfo({
  hours,
  business,
}: {
  hours: OpeningHour[];
  business?: PublicBusiness;
}) {
  const address = business ? fullAddressFrom(business) : fallbackFullAddress();
  const phone = business?.phone ?? fallbackBusiness.phone;
  const phoneHref = business?.phoneHref ?? fallbackBusiness.phoneHref;
  const email = business?.email ?? fallbackBusiness.email;
  const kitchenHours = business?.kitchenHours ?? fallbackBusiness.kitchenHours;
  const hoursLabel =
    business?.restaurantHoursLabel ?? fallbackBusiness.restaurantHoursLabel;

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <p className="riva-label">Hitta hit</p>
        <h2 className="mt-3 font-display text-3xl text-riva-cream">Besök oss</h2>
        <address className="mt-6 space-y-2 not-italic text-riva-muted">
          <p>{address}</p>
          {phone ? (
            <p>
              <a href={phoneHref} className="hover:text-riva-cream">
                {phone}
              </a>
            </p>
          ) : null}
          <p>
            <a href={`mailto:${email}`} className="hover:text-riva-cream">
              {email}
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
          <p className="mt-6 text-riva-muted">{hoursLabel}</p>
        )}
        {kitchenHours ? (
          <p className="mt-4 text-xs text-riva-muted/80">{kitchenHours}</p>
        ) : null}
      </div>
    </div>
  );
}
