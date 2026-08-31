import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders accessible label text", () => {
    render(<Button>Boka bord</Button>);
    expect(screen.getByRole("button", { name: "Boka bord" })).toBeInTheDocument();
  });
});
