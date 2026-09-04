"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StateMessage } from "@/components/ui/state-message";
import { Textarea } from "@/components/ui/textarea";
import { business } from "@/config/business";
import {
  ApiError,
  createReservation,
  fetchAvailability,
  type Availability,
  type Reservation,
} from "@/lib/api";
import { isValidEmail, toDateString } from "@/lib/validation";

type ContactErrors = Partial<Record<"name" | "phone" | "email", string>>;

export function ReservationForm() {
  const today = useMemo(() => toDateString(new Date()), []);

  const [date, setDate] = useState("");
  const [availability, setAvailability] = useState<(Availability & { horizon_days?: number }) | null>(
    null,
  );
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [availError, setAvailError] = useState<string | null>(null);

  const maxDate = useMemo(() => {
    const days = availability?.horizon_days ?? 90;
    return toDateString(new Date(Date.now() + days * 864e5));
  }, [availability?.horizon_days]);

  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState("");
  const [contact, setContact] = useState({ name: "", phone: "", email: "", special: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<(Reservation & { email_sent?: boolean }) | null>(null);

  const maxParty = availability?.max_party_size ?? 12;

  useEffect(() => {
    if (!date) {
      setAvailability(null);
      return;
    }
    let active = true;
    setLoadingAvail(true);
    setAvailError(null);
    setTime("");
    fetchAvailability(date)
      .then((data) => {
        if (!active) return;
        setAvailability(data);
      })
      .catch(() => {
        if (!active) return;
        setAvailError("Kunde inte hämta lediga tider. Försök igen.");
        setAvailability(null);
      })
      .finally(() => active && setLoadingAvail(false));
    return () => {
      active = false;
    };
  }, [date]);

  useEffect(() => {
    if (guests > maxParty) setGuests(maxParty);
  }, [guests, maxParty]);

  // Slots that can still seat this party (capacity per slot vs. guests).
  const slots = useMemo(() => {
    if (!availability) return [];
    return availability.slots.map((s) => ({
      time: s.time,
      available: s.available && s.remaining >= guests,
    }));
  }, [availability, guests]);

  useEffect(() => {
    if (time && !slots.find((s) => s.time === time && s.available)) setTime("");
  }, [slots, time]);

  const validateContact = (): boolean => {
    const next: ContactErrors = {};
    if (!contact.name.trim()) next.name = "Ange ditt namn";
    if (!contact.phone.trim()) next.phone = "Ange ett telefonnummer";
    if (!contact.email.trim()) next.email = "Ange din e-post";
    else if (!isValidEmail(contact.email)) next.email = "Ogiltig e-postadress";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!date || !time) {
      setServerError("Välj datum och tid.");
      return;
    }
    if (!validateContact()) return;

    setSubmitting(true);
    try {
      const reservation = await createReservation({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: contact.email.trim(),
        party_size: guests,
        date,
        time,
        special_request: contact.special.trim() || "",
      });
      setResult(reservation);
      toast.success("Bokningen är bekräftad.");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Något gick fel. Försök igen.";
      setServerError(message);
      // The slot may have filled up — refresh availability so the UI is honest.
      if (err instanceof ApiError && (err.code === "full" || err.code === "closed")) {
        fetchAvailability(date).then(setAvailability).catch(() => {});
        setTime("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <StateMessage
        variant="success"
        icon={<Check className="h-8 w-8" />}
        title="Bokningen är bekräftad"
        description={`Bokningsnummer ${result.ref} · ${result.date} kl. ${result.time.slice(
          0,
          5,
        )} för ${result.party_size} gäster.${
          result.email_sent
            ? ` En bekräftelse har skickats till ${result.email}.`
            : " Vi kunde inte skicka e-post just nu — spara bokningsnumret."
        }`}
        action={
          <Button
            variant="outline"
            onClick={() => {
              setResult(null);
              setDate("");
              setTime("");
              setContact({ name: "", phone: "", email: "", special: "" });
            }}
          >
            Gör en ny bokning
          </Button>
        }
      />
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      noValidate
      className="rounded-lg border border-riva-cream/10 bg-riva-card p-6 md:p-8"
    >
      {/* Step 1 — Datum */}
      <div>
        <Label htmlFor="res-date" className="flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-riva-gold" aria-hidden="true" />
          Datum
        </Label>
        <Input
          id="res-date"
          type="date"
          lang="sv-SE"
          min={today}
          max={maxDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1.5"
        />
      </div>

      {/* Step 2 — Tid + gäster */}
      {date && (
        <div className="mt-6 border-t border-riva-cream/10 pt-6">
          {loadingAvail ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          ) : availError ? (
            <p className="text-sm text-riva-error">{availError}</p>
          ) : availability && !availability.enabled ? (
            <StateMessage
              variant="empty"
              title="Onlinebokning är inte aktiverad"
              description={`Ring oss gärna på ${business.phone} så hjälper vi dig med din bokning.`}
            />
          ) : availability && availability.closed ? (
            <StateMessage
              variant="empty"
              title="Vi har stängt den valda dagen"
              description="Välj en annan dag för din bokning."
            />
          ) : (
            <>
              <div>
                <span className="text-sm font-medium text-riva-cream">Antal gäster</span>
                <div className="mt-2 flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Färre gäster"
                    disabled={guests <= 1}
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-lg font-semibold tabular-nums text-riva-cream">
                    {guests}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Fler gäster"
                    disabled={guests >= maxParty}
                    onClick={() => setGuests((g) => Math.min(maxParty, g + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-riva-muted">
                    Upp till {maxParty} gäster online
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-sm font-medium text-riva-cream">Välj tid</span>
                {slots.length === 0 ? (
                  <p className="mt-2 text-sm text-riva-muted">
                    Inga lediga sittningar den här dagen. Det kan bero på att köket har stängt,
                    att sista sittningen redan passerat, eller att dagen är fullbokad. Prova en
                    annan dag eller ring oss på {business.phone}.
                  </p>
                ) : (
                  <div
                    className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5"
                    role="group"
                    aria-label="Lediga tider"
                  >
                    {slots.map((s) => (
                      <button
                        key={s.time}
                        type="button"
                        disabled={!s.available}
                        aria-pressed={time === s.time}
                        onClick={() => setTime(s.time)}
                        className={
                          "rounded-md border px-2 py-2 text-sm tabular-nums transition-riva focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riva-gold " +
                          (time === s.time
                            ? "border-riva-gold bg-riva-gold text-riva-black"
                            : s.available
                              ? "border-riva-cream/20 text-riva-cream hover:border-riva-gold"
                              : "cursor-not-allowed border-riva-cream/10 text-riva-muted/40 line-through")
                        }
                      >
                        {s.time.slice(0, 5)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3 — Kontakt */}
      {time && (
        <div className="mt-6 space-y-4 border-t border-riva-cream/10 pt-6">
          <div>
            <Label htmlFor="res-name">Namn</Label>
            <Input
              id="res-name"
              value={contact.name}
              error={Boolean(errors.name)}
              aria-invalid={Boolean(errors.name)}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              className="mt-1.5"
            />
            {errors.name && <p className="mt-1.5 text-xs text-riva-error">{errors.name}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="res-phone">Telefon</Label>
              <Input
                id="res-phone"
                type="tel"
                value={contact.phone}
                error={Boolean(errors.phone)}
                aria-invalid={Boolean(errors.phone)}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="mt-1.5"
              />
              {errors.phone && <p className="mt-1.5 text-xs text-riva-error">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="res-email">E-post</Label>
              <Input
                id="res-email"
                type="email"
                value={contact.email}
                error={Boolean(errors.email)}
                aria-invalid={Boolean(errors.email)}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="mt-1.5"
              />
              {errors.email && <p className="mt-1.5 text-xs text-riva-error">{errors.email}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="res-special">Särskilda önskemål (valfritt)</Label>
            <Textarea
              id="res-special"
              value={contact.special}
              placeholder="Allergier, barnstol, fönsterbord…"
              onChange={(e) => setContact({ ...contact, special: e.target.value })}
              className="mt-1.5"
            />
          </div>

          {serverError && (
            <p className="text-sm text-riva-error" role="alert">
              {serverError}
            </p>
          )}

          <Button type="submit" size="lg" variant="gold" loading={submitting} className="w-full">
            Bekräfta bokning
          </Button>
          <p className="text-center text-xs text-riva-muted">
            Du får en direkt bekräftelse med bokningsnummer.
          </p>
        </div>
      )}
    </form>
  );
}
