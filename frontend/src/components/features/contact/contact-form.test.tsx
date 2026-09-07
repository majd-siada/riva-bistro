import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    sendContactMessage: vi.fn(),
  };
});

import { ContactForm } from "@/components/features/contact/contact-form";
import { ApiError, sendContactMessage } from "@/lib/api";

async function fillMinimalContact(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^namn$/i), "Anna Andersson");
  await user.type(screen.getByLabelText(/^e-post$/i), "anna@example.com");
  await user.type(screen.getByLabelText(/^meddelande$/i), "Hej, bord för två.");
}

describe("ContactForm", () => {
  beforeEach(() => {
    vi.mocked(sendContactMessage).mockReset();
  });

  it("shows required-field errors without calling the API", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(
      screen.getByRole("button", { name: "Skicka meddelande" }),
    );
    expect(await screen.findByText(/ange ditt namn/i)).toBeInTheDocument();
    expect(sendContactMessage).not.toHaveBeenCalled();
  });

  it("submits valid values and shows success state", async () => {
    const user = userEvent.setup();
    vi.mocked(sendContactMessage).mockResolvedValue({ status: "ok" });
    render(<ContactForm />);
    await fillMinimalContact(user);
    await user.click(
      screen.getByRole("button", { name: "Skicka meddelande" }),
    );

    await waitFor(() => {
      expect(sendContactMessage).toHaveBeenCalled();
    });
    expect(
      await screen.findByText(/tack för ditt meddelande/i),
    ).toBeInTheDocument();
  });

  it("surfaces API failures as an alert without exposing stack traces", async () => {
    const user = userEvent.setup();
    vi.mocked(sendContactMessage).mockRejectedValue(
      new ApiError("Servern är upptagen.", 503, "unavailable"),
    );
    render(<ContactForm />);
    await fillMinimalContact(user);
    await user.click(
      screen.getByRole("button", { name: "Skicka meddelande" }),
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Servern är upptagen.");
    expect(alert.textContent).not.toMatch(/stack|ApiError/i);
  });
});
