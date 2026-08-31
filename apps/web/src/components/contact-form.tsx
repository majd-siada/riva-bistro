"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateMessage } from "@/components/ui/state-message";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, sendContactMessage } from "@/lib/api";
import { validateContact, type ContactErrors, type ContactFormValues } from "@/lib/validation";

const EMPTY: ContactFormValues = { name: "", email: "", phone: "", subject: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const update = <K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const next = validateContact(values);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        subject: values.subject.trim() || undefined,
        message: values.message.trim(),
      });
      setSent(true);
      toast.success("Tack! Ditt meddelande har skickats.");
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
        title="Tack för ditt meddelande"
        description={`Vi återkommer till ${values.email} så snart vi kan.`}
        action={
          <Button
            variant="outline"
            onClick={() => {
              setValues(EMPTY);
              setSent(false);
            }}
          >
            Skicka ett till
          </Button>
        }
      />
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      noValidate
      className="space-y-5 rounded-lg border border-riva-cream/10 bg-riva-card p-6 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Namn</Label>
          <Input
            id="contact-name"
            value={values.name}
            error={Boolean(errors.name)}
            aria-invalid={Boolean(errors.name)}
            onChange={(e) => update("name", e.target.value)}
            className="mt-1.5"
          />
          {errors.name && <p className="mt-1.5 text-xs text-riva-error">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="contact-email">E-post</Label>
          <Input
            id="contact-email"
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-phone">Telefonnummer</Label>
          <Input
            id="contact-phone"
            type="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="contact-subject">Ämne</Label>
          <Input
            id="contact-subject"
            value={values.subject}
            onChange={(e) => update("subject", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="contact-message">Meddelande</Label>
        <Textarea
          id="contact-message"
          value={values.message}
          error={Boolean(errors.message)}
          aria-invalid={Boolean(errors.message)}
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
      <Button type="submit" variant="gold" loading={submitting} className="w-full sm:w-auto">
        Skicka meddelande
      </Button>
    </form>
  );
}
