import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminShell } from "@/components/features/admin/admin-shell";

const replace = vi.fn();
const adminMe = vi.fn();
const adminLogout = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/bokningar",
  useRouter: () => ({ replace }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/admin-api", () => ({
  adminMe: (...args: unknown[]) => adminMe(...args),
  adminLogout: (...args: unknown[]) => adminLogout(...args),
}));

describe("AdminShell QA smoke", () => {
  beforeEach(() => {
    replace.mockReset();
    adminMe.mockReset();
    adminLogout.mockReset();
  });

  it("redirects unauthenticated users to login", async () => {
    adminMe.mockResolvedValue({ authenticated: false });
    render(
      <AdminShell>
        <p>Hemligt</p>
      </AdminShell>,
    );
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/admin/login");
    });
  });

  it("renders admin navigation landmarks when authenticated", async () => {
    adminMe.mockResolvedValue({
      authenticated: true,
      username: "chef",
    });
    render(
      <AdminShell>
        <p>Översikt innehåll</p>
      </AdminShell>,
    );
    expect(
      await screen.findByRole("navigation", { name: "Adminnavigering" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bokningar" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Meny" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Galleri" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Öppettider" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Inställningar" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Innehåll")).toBeInTheDocument();
    expect(screen.getByText("Drift")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Startsida" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Restaurang" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Nyheter" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Erbjudanden" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Lunch" })).not.toBeInTheDocument();
    expect(screen.getByText("Översikt innehåll")).toBeInTheDocument();
  });
});
