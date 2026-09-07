import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    fetchAvailability: vi.fn(),
    createReservation: vi.fn(),
  };
});

import { ReservationForm } from "@/components/features/booking/reservation-form";
import {
  ApiError,
  createReservation,
  fetchAvailability,
} from "@/lib/api";

const availabilityOk = {
  date: "2099-06-15",
  enabled: true,
  closed: false,
  max_party_size: 8,
  horizon_days: 90,
  slots: [
    { time: "18:00:00", available: true, remaining: 8 },
    { time: "19:00:00", available: true, remaining: 4 },
  ],
};

async function chooseDateAndSlot(user: ReturnType<typeof userEvent.setup>) {
  const date = screen.getByLabelText(/datum/i);
  fireEvent.change(date, { target: { value: "2099-06-15" } });
  const group = await screen.findByRole("group", { name: /lediga tider/i });
  await user.click(screen.getByRole("button", { name: "18:00" }));
  return group;
}

describe("ReservationForm", () => {
  beforeEach(() => {
    vi.mocked(fetchAvailability).mockReset();
    vi.mocked(createReservation).mockReset();
  });

  it("shows availability fetch errors to the user", async () => {
    vi.mocked(fetchAvailability).mockRejectedValue(new Error("network"));
    render(<ReservationForm />);
    fireEvent.change(screen.getByLabelText(/datum/i), {
      target: { value: "2099-06-15" },
    });
    expect(
      await screen.findByText(/kunde inte hämta lediga tider/i),
    ).toBeInTheDocument();
  });

  it("validates contact fields before submitting", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchAvailability).mockResolvedValue(availabilityOk);
    render(<ReservationForm />);
    await chooseDateAndSlot(user);
    await user.click(screen.getByRole("button", { name: "Bekräfta bokning" }));
    expect(await screen.findByText(/ange ditt namn/i)).toBeInTheDocument();
    expect(createReservation).not.toHaveBeenCalled();
  });

  it("completes a valid booking and shows confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchAvailability).mockResolvedValue(availabilityOk);
    vi.mocked(createReservation).mockResolvedValue({
      id: 1,
      ref: "RIVA-TEST",
      name: "Anna",
      email: "anna@example.com",
      phone: "+46701234567",
      party_size: 2,
      date: "2099-06-15",
      time: "18:00:00",
      status: "confirmed",
      email_sent: true,
    } as never);

    render(<ReservationForm />);
    await chooseDateAndSlot(user);
    await user.type(screen.getByLabelText(/^namn$/i), "Anna");
    await user.type(screen.getByLabelText(/^telefon$/i), "0701234567");
    await user.type(screen.getByLabelText(/^e-post$/i), "anna@example.com");
    await user.click(screen.getByRole("button", { name: "Bekräfta bokning" }));

    await waitFor(() => expect(createReservation).toHaveBeenCalled());
    expect(
      await screen.findByText(/bokningen är bekräftad/i),
    ).toBeInTheDocument();
  });

  it("shows API errors safely on failed create", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchAvailability).mockResolvedValue(availabilityOk);
    vi.mocked(createReservation).mockRejectedValue(
      new ApiError("Något gick fel. Försök igen.", 500, "error"),
    );

    render(<ReservationForm />);
    await chooseDateAndSlot(user);
    await user.type(screen.getByLabelText(/^namn$/i), "Anna");
    await user.type(screen.getByLabelText(/^telefon$/i), "0701234567");
    await user.type(screen.getByLabelText(/^e-post$/i), "anna@example.com");
    await user.click(screen.getByRole("button", { name: "Bekräfta bokning" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/något gick fel/i);
    expect(alert.textContent).not.toMatch(/Error:|at Object/);
  });
});
