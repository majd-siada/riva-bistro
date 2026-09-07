import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { FAQ } from "@/components/brand/faq";
import { PageBreadcrumbs } from "@/components/seo/page-breadcrumbs";
import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";

describe("automated accessibility (axe)", () => {
  it("Button has no serious axe violations", async () => {
    const { container } = render(<Button>Boka bord</Button>);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("StateMessage error uses alert semantics without axe violations", async () => {
    const { container } = render(
      <StateMessage
        variant="error"
        title="Något gick fel"
        description="Kunde inte nå API:t. Försök igen."
      />,
    );
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("PageBreadcrumbs expose a navigation landmark", async () => {
    const { container, getByRole } = render(
      <PageBreadcrumbs
        items={[
          { name: "Hem", path: "/" },
          { name: "Meny", path: "/meny" },
        ]}
      />,
    );
    expect(getByRole("navigation", { name: "Brödsmulor" })).toBeInTheDocument();
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("FAQ accordion exposes controls without axe violations", async () => {
    const { container, getByRole } = render(
      <FAQ items={[{ question: "Öppettider?", answer: "Se /boka." }]} />,
    );
    const btn = getByRole("button", { name: /Öppettider/i });
    expect(btn).toHaveAttribute("aria-controls");
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
