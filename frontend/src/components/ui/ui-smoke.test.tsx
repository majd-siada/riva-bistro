import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageBreadcrumbs } from "@/components/seo/page-breadcrumbs";
import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";

describe("UI smoke", () => {
  it("renders primary and outline buttons as accessible controls", () => {
    render(
      <>
        <Button>Boka bord</Button>
        <Button variant="outline">Meny</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Boka bord" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Meny" })).toBeInTheDocument();
  });

  it("shows loading and error state messages with roles", () => {
    const { rerender } = render(
      <StateMessage variant="loading" title="Hämtar…" description="Vänta" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Hämtar…");

    rerender(
      <StateMessage variant="error" title="Fel" description="API nere" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Fel");
  });

  it("renders breadcrumb trail with current page", () => {
    render(
      <PageBreadcrumbs
        items={[
          { name: "Hem", path: "/" },
          { name: "Boka", path: "/boka" },
        ]}
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Brödsmulor" });
    expect(within(nav).getByRole("link", { name: "Hem" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(nav).getByText("Boka")).toHaveAttribute("aria-current", "page");
  });
});
