export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface ReservationFormValues {
  date: string;
  time: string;
  partySize: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export type ReservationErrors = Partial<Record<keyof ReservationFormValues, string>>;

export function validateReservation(
  values: ReservationFormValues,
  today: Date = new Date(),
): ReservationErrors {
  const errors: ReservationErrors = {};

  if (!values.date) {
    errors.date = "Välj ett datum";
  } else if (values.date < toDateString(today)) {
    errors.date = "Välj ett datum idag eller senare";
  }

  if (!values.time) errors.time = "Välj en tid";
  if (!values.partySize) errors.partySize = "Ange antal gäster";
  if (!values.name.trim()) errors.name = "Ange ditt namn";

  if (!values.email.trim()) {
    errors.email = "Ange din e-post";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Ogiltig e-postadress";
  }

  if (!values.phone.trim()) errors.phone = "Ange ett telefonnummer";

  return errors;
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactFormValues, string>>;

export function validateContact(values: ContactFormValues): ContactErrors {
  const errors: ContactErrors = {};

  if (!values.name.trim()) errors.name = "Ange ditt namn";

  if (!values.email.trim()) {
    errors.email = "Ange din e-post";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Ogiltig e-postadress";
  }

  if (!values.message.trim()) {
    errors.message = "Skriv ett meddelande";
  } else if (values.message.trim().length < 10) {
    errors.message = "Meddelandet är för kort (minst 10 tecken)";
  }

  return errors;
}
