"use client";

import { useState } from "react";
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
import { ApiError, sendEventInquiry } from "@/lib/api";
import { isValidEmail } from "@/lib/validation";

const EVENT_TYPES = [
  "Företagsmiddag",
  "Möte",
  "Privat middag",
  "Firande",
  "Fest",
  "Annat",
];

type Values = {
  name: string;
  email: string;
  phone: string;
  event_type: string;
  guests: string;
  date: string;
  message: string;
};

const EMPTY: Values = {
  name: "",
  email: "",
  phone: "",
  event_type: "",
  guests: "",
  date: "",
  message: "",
};

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function EventInquiryForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Ange ditt namn";
    if (!values.email.trim()) next.email = "Ange din e-post";
    else if (!isValidEmail(values.email)) next.email = "Ogiltig e-postadress";
    if (!values.message.trim()) next.message = "Beskriv gärna ditt event";
    else if (values.message.trim().length < 10) next.message = "Meddelandet är för kort";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await sendEventInquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        event_type: values.event_type,
        guests: values.guests.trim(),
        date: values.date,
        message: values.message.trim(),
      });
      setSent(true);
      toast.success("Tack! Din förfrågan har skickats.");
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message
          : "Något gick fel. Försök igen eller kontakta oss direkt.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <StateMessage
        variant="success"
        title="Tack för din förfrågan"
        description={`Vi återkommer till ${values.email} för att planera ert event.`}
        action={
          <Button
            variant="outline"
            onClick={() => {
              setValues(EMPTY);
              setSent(false);
            }}
          >
            Skicka en till förfrågan
          </Button>
        }
      />
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      noValidate
      className="space-y-5 rounded-lg border border-riva-ink/10 bg-riva-ivory p-6 shadow-subtle md:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ev-name">Namn</Label>
          <Input
            id="ev-name"
            value={values.name}
            error={Boolean(errors.name)}
            aria-invalid={Boolean(errors.name)}
            onChange={(e) => update("name", e.target.value)}
            className="mt-1.5"
          />
          {errors.name && <p className="mt-1.5 text-xs text-riva-error">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="ev-email">E-post</Label>
          <Input
            id="ev-email"
            type="email"
            value={values.email}
            error={Boolean(errors.email)}
            aria-invalid={Boolean(errors.email)}
            onChange={(e) => update("email", e.target.value)}
            className="mt-1.5"
          />
          {errors.email && <p className="mt-1.5 text-xs text-riva-error">{errors.email}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ev-phone">Telefon (valfritt)</Label>
          <Input
            id="ev-phone"
            type="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="ev-type">Typ av event</Label>
          <Select value={values.event_type} onValueChange={(v) => update("event_type", v)}>
            <SelectTrigger id="ev-type" className="mt-1.5">
              <SelectValue placeholder="Välj typ" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ev-guests">Antal gäster (valfritt)</Label>
          <Input
            id="ev-guests"
            inputMode="numeric"
            value={values.guests}
            onChange={(e) => update("guests", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="ev-date">Önskat datum (valfritt)</Label>
          <Input
            id="ev-date"
            type="date"
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="ev-message">Berätta om ert event</Label>
        <Textarea
          id="ev-message"
          value={values.message}
          error={Boolean(errors.message)}
          aria-invalid={Boolean(errors.message)}
          placeholder="Tillfälle, önskemål, upplägg…"
          onChange={(e) => update("message", e.target.value)}
          className="mt-1.5"
        />
        {errors.message && <p className="mt-1.5 text-xs text-riva-error">{errors.message}</p>}
      </div>

      {serverError && (
        <p className="text-sm text-riva-error" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="gold" loading={submitting} className="w-full">
        Skicka förfrågan
      </Button>
    </form>
  );
}
