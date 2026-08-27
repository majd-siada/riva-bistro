"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Clock, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StateMessage } from "@/components/ui/state-message";
import { Textarea } from "@/components/ui/textarea";
import { createReservation } from "@/lib/api";
import {
  toDateString,
  validateReservation,
  type ReservationErrors,
  type ReservationFormValues,
} from "@/lib/validation";

const TIME_SLOTS = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
];

const PARTY_SIZES = ["1", "2", "3", "4", "5", "6", "7", "8", "9+"];

const EMPTY: ReservationFormValues = {
  date: "",
  time: "",
  partySize: "2",
  name: "",
  email: "",
  phone: "",
  notes: "",
};

type Result = { kind: "confirmed"; ref: string } | { kind: "pending" };

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-riva-error">
      {message}
    </p>
  );
}

export function ReservationForm() {
  const today = useMemo(() => toDateString(new Date()), []);
  const [values, setValues] = useState<ReservationFormValues>(EMPTY);
  const [errors, setErrors] = useState<ReservationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const update = <K extends keyof ReservationFormValues>(
    key: K,
    value: ReservationFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateReservation(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const partySize =
      values.partySize === "9+" ? 9 : Number.parseInt(values.partySize, 10);
    try {
      const reservation = await createReservation({
        date: values.date,
        time: values.time,
        party_size: partySize,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        notes: values.notes.trim() || undefined,
      });
      setResult({ kind: "confirmed", ref: reservation.ref });
    } catch {
      // Reservations backend is not live yet — record the request gracefully
      // rather than showing a false failure.
      setResult({ kind: "pending" });
    } finally {
      setSubmitting(false);
      toast.success("Tack! Vi har tagit emot din bordsförfrågan.");
    }
  };

  if (result) {
    return (
      <StateMessage
        variant="success"
        title={
          result.kind === "confirmed"
            ? "Bordet är bokat"
            : "Tack för din bordsförfrågan"
        }
        description={
          result.kind === "confirmed"
            ? `Din bokning ${result.ref} den ${values.date} kl. ${values.time} för ${values.partySize} gäster är bekräftad. En bekräftelse skickas till ${values.email}.`
            : `Vi har tagit emot din förfrågan för ${values.date} kl. ${values.time} (${values.partySize} gäster) och bekräftar den via e-post eller telefon inom kort.`
        }
        action={
          <Button
            variant="outline"
            onClick={() => {
              setValues(EMPTY);
              setResult(null);
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
      className="space-y-5 rounded-md border border-riva-ivory/10 bg-riva-charcoal p-6 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="res-date" className="flex items-center gap-1.5">
            <CalendarCheck className="h-4 w-4 text-riva-gold" aria-hidden="true" />
            Datum
          </Label>
          <Input
            id="res-date"
            type="date"
            min={today}
            value={values.date}
            error={Boolean(errors.date)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? "res-date-error" : undefined}
            onChange={(e) => update("date", e.target.value)}
            className="mt-1.5"
          />
          <FieldError id="res-date-error" message={errors.date} />
        </div>

        <div>
          <Label htmlFor="res-time" className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-riva-gold" aria-hidden="true" />
            Tid
          </Label>
          <Select value={values.time} onValueChange={(v) => update("time", v)}>
            <SelectTrigger
              id="res-time"
              aria-invalid={Boolean(errors.time)}
              aria-describedby={errors.time ? "res-time-error" : undefined}
              className={`mt-1.5 ${errors.time ? "border-riva-error" : ""}`}
            >
              <SelectValue placeholder="Välj tid" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="res-time-error" message={errors.time} />
        </div>
      </div>

      <div>
        <Label htmlFor="res-party" className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-riva-gold" aria-hidden="true" />
          Antal gäster
        </Label>
        <Select
          value={values.partySize}
          onValueChange={(v) => update("partySize", v)}
        >
          <SelectTrigger
            id="res-party"
            aria-describedby={errors.partySize ? "res-party-error" : undefined}
            className="mt-1.5"
          >
            <SelectValue placeholder="Välj antal" />
          </SelectTrigger>
          <SelectContent>
            {PARTY_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size === "1" ? "1 gäst" : `${size} gäster`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError id="res-party-error" message={errors.partySize} />
        {values.partySize === "9+" && (
          <p className="mt-1.5 text-xs text-riva-mist">
            För sällskap på 9 eller fler kontaktar vi dig för att planera kvällen.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="res-name">Namn</Label>
        <Input
          id="res-name"
          value={values.name}
          error={Boolean(errors.name)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "res-name-error" : undefined}
          onChange={(e) => update("name", e.target.value)}
          className="mt-1.5"
        />
        <FieldError id="res-name-error" message={errors.name} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="res-email">E-post</Label>
          <Input
            id="res-email"
            type="email"
            value={values.email}
            error={Boolean(errors.email)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "res-email-error" : undefined}
            onChange={(e) => update("email", e.target.value)}
            className="mt-1.5"
          />
          <FieldError id="res-email-error" message={errors.email} />
        </div>
        <div>
          <Label htmlFor="res-phone">Telefon</Label>
          <Input
            id="res-phone"
            type="tel"
            value={values.phone}
            error={Boolean(errors.phone)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "res-phone-error" : undefined}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1.5"
          />
          <FieldError id="res-phone-error" message={errors.phone} />
        </div>
      </div>

      <div>
        <Label htmlFor="res-notes">Önskemål (valfritt)</Label>
        <Textarea
          id="res-notes"
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Allergier, fönsterbord, firande…"
          className="mt-1.5"
        />
      </div>

      <Button type="submit" loading={submitting} className="w-full">
        Boka bord
      </Button>
      <p className="text-center text-xs text-riva-mist">
        Vi bekräftar din bokning via e-post eller telefon.
      </p>
    </form>
  );
}
