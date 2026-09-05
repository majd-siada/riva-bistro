import { describe, expect, it } from "vitest";

import {
  isValidEmail,
  validateContact,
  validateReservation,
  type ContactFormValues,
  type ReservationFormValues,
} from "@/lib/validation";

const validReservation: ReservationFormValues = {
  date: "2026-02-20",
  time: "19:00",
  partySize: "2",
  name: "Anna Svensson",
  email: "anna@example.com",
  phone: "0701234567",
  notes: "",
};

const today = new Date("2026-02-15T12:00:00Z");

describe("isValidEmail", () => {
  it("accepts a well-formed address", () => {
    expect(isValidEmail("anna@example.com")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("anna@")).toBe(false);
    expect(isValidEmail("anna.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("validateReservation", () => {
  it("returns no errors for valid input", () => {
    expect(validateReservation(validReservation, today)).toEqual({});
  });

  it("flags a missing date, time, name, email and phone", () => {
    const errors = validateReservation(
      { date: "", time: "", partySize: "2", name: "", email: "", phone: "", notes: "" },
      today,
    );
    expect(errors.date).toBeDefined();
    expect(errors.time).toBeDefined();
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
  });

  it("rejects a date in the past", () => {
    const errors = validateReservation(
      { ...validReservation, date: "2026-02-10" },
      today,
    );
    expect(errors.date).toBeDefined();
  });

  it("accepts today's date", () => {
    const errors = validateReservation(
      { ...validReservation, date: "2026-02-15" },
      today,
    );
    expect(errors.date).toBeUndefined();
  });

  it("rejects an invalid email", () => {
    const errors = validateReservation(
      { ...validReservation, email: "not-an-email" },
      today,
    );
    expect(errors.email).toBeDefined();
  });

  it("rejects a phone number with too few digits", () => {
    const errors = validateReservation(
      { ...validReservation, phone: "123" },
      today,
    );
    expect(errors.phone).toBeDefined();
  });
});

describe("validateContact", () => {
  const valid: ContactFormValues = {
    name: "Anna",
    email: "anna@example.com",
    phone: "",
    subject: "",
    message: "Jag skulle vilja fråga om er meny.",
  };

  it("returns no errors for valid input", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("requires a name, email and message", () => {
    const errors = validateContact({ name: "", email: "", phone: "", subject: "", message: "" });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.message).toBeDefined();
  });

  it("rejects a too-short message", () => {
    const errors = validateContact({ ...valid, message: "Hej" });
    expect(errors.message).toBeDefined();
  });

  it("rejects an invalid email", () => {
    const errors = validateContact({ ...valid, email: "bad" });
    expect(errors.email).toBeDefined();
  });
});
