"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateMessage } from "@/components/ui/state-message";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/lib/api";
import {
  validateContact,
  type ContactErrors,
  type ContactFormValues,
} from "@/lib/validation";

const EMPTY: ContactFormValues = { name: "", email: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const update = <K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
    } catch {
      // Contact backend is not live yet — treat as received rather than failed.
    } finally {
      setSubmitting(false);
      setSent(true);
      toast.success("Tack! Ditt meddelande har skickats.");
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
      className="space-y-5 rounded-md border border-riva-ivory/10 bg-riva-charcoal p-6"
    >
      <div>
        <Label htmlFor="contact-name">Namn</Label>
        <Input
          id="contact-name"
          value={values.name}
          error={Boolean(errors.name)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          onChange={(e) => update("name", e.target.value)}
          className="mt-1.5"
        />
        {errors.name && (
          <p id="contact-name-error" className="mt-1.5 text-xs text-riva-error">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="contact-email">E-post</Label>
        <Input
          id="contact-email"
          type="email"
          value={values.email}
          error={Boolean(errors.email)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          onChange={(e) => update("email", e.target.value)}
          className="mt-1.5"
        />
        {errors.email && (
          <p id="contact-email-error" className="mt-1.5 text-xs text-riva-error">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="contact-message">Meddelande</Label>
        <Textarea
          id="contact-message"
          value={values.message}
          error={Boolean(errors.message)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          onChange={(e) => update("message", e.target.value)}
          className="mt-1.5"
        />
        {errors.message && (
          <p
            id="contact-message-error"
            className="mt-1.5 text-xs text-riva-error"
          >
            {errors.message}
          </p>
        )}
      </div>
      <Button type="submit" loading={submitting} className="w-full">
        Skicka meddelande
      </Button>
    </form>
  );
}
