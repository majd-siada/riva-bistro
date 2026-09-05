import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PRODUCTION_API_ORIGIN,
  resolvePublicApiOrigin,
} from "@/config/api";

describe("resolvePublicApiOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("maps production hostnames when env is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(resolvePublicApiOrigin("rivabistro.se")).toBe(PRODUCTION_API_ORIGIN);
    expect(resolvePublicApiOrigin("www.rivabistro.se")).toBe(
      PRODUCTION_API_ORIGIN,
    );
  });

  it("ignores a baked localhost NEXT_PUBLIC_API_URL on production hosts", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000");
    vi.stubEnv("NODE_ENV", "production");
    expect(resolvePublicApiOrigin("rivabistro.se")).toBe(PRODUCTION_API_ORIGIN);
  });

  it("falls back to the production API origin in production without hostname", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(resolvePublicApiOrigin()).toBe(PRODUCTION_API_ORIGIN);
  });

  it("keeps localhost for local development when env is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(resolvePublicApiOrigin("localhost")).toBe("http://localhost:8000");
  });

  it("honours a non-local NEXT_PUBLIC_API_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com/");
    vi.stubEnv("NODE_ENV", "development");
    expect(resolvePublicApiOrigin("localhost")).toBe("https://api.example.com");
  });
});
