import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FAQ } from "@/components/brand/faq";
import { AppShell } from "@/components/layout/app-shell";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/components/reveal-observer", () => ({
  RevealObserver: () => null,
}));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("keyboard navigation & focus management", () => {
  it("skip link targets #main-content and is keyboard-focusable", async () => {
    const user = userEvent.setup();
    render(
      <AppShell header={<div>Header</div>} footer={<div>Footer</div>}>
        <p>Innehåll</p>
      </AppShell>,
    );
    const skip = screen.getByRole("link", { name: "Hoppa till innehåll" });
    expect(skip).toHaveAttribute("href", "#main-content");
    expect(document.getElementById("main-content")).toBeTruthy();

    await user.tab();
    expect(skip).toHaveFocus();
  });

  it("FAQ toggles with keyboard and exposes aria-controls", async () => {
    const user = userEvent.setup();
    render(
      <FAQ
        items={[
          { question: "Fråga ett", answer: "Svar ett" },
          { question: "Fråga två", answer: "Svar två" },
        ]}
      />,
    );
    const first = screen.getByRole("button", { name: /Fråga ett/i });
    expect(first).toHaveAttribute("aria-expanded", "true");
    const panelId = first.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toHaveTextContent("Svar ett");

    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "false");

    const second = screen.getByRole("button", { name: /Fråga två/i });
    second.focus();
    expect(second).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("Dialog moves focus into content and restores on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button type="button">Öppna dialog</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialogtitel</DialogTitle>
          <button type="button">Inuti</button>
        </DialogContent>
      </Dialog>,
    );
    const trigger = screen.getByRole("button", { name: "Öppna dialog" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Dialogtitel")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("Sheet opens from trigger and closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button type="button" aria-label="Öppna meny">
            Meny
          </button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Mobilmeny</SheetTitle>
          <button type="button">Menylänk</button>
        </SheetContent>
      </Sheet>,
    );
    const trigger = screen.getByRole("button", { name: "Öppna meny" });
    await user.click(trigger);
    expect(await screen.findByText("Mobilmeny")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Mobilmeny")).not.toBeInTheDocument();
  });
});
