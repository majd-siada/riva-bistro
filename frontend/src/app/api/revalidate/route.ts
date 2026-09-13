import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand ISR revalidation for Hostinger/Next.
 * Auth: Authorization: Bearer <FRONTEND_REVALIDATE_SECRET>
 *   — checked locally when FRONTEND_REVALIDATE_SECRET is set on Hostinger
 *   — otherwise delegated to API /api/v1/revalidate-auth/ (VPS holds the secret)
 * Body: { "paths": ["/", "/meny", ...] }
 */

async function authorizeBearer(token: string): Promise<boolean> {
  const secret = (process.env.FRONTEND_REVALIDATE_SECRET || "").trim();
  if (secret) {
    return token === secret;
  }
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!apiBase || !token) {
    return false;
  }
  try {
    const res = await fetch(`${apiBase}/api/v1/revalidate-auth/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || !(await authorizeBearer(token))) {
    const localConfigured = Boolean(
      (process.env.FRONTEND_REVALIDATE_SECRET || "").trim(),
    );
    if (!localConfigured && !(process.env.NEXT_PUBLIC_API_URL || "").trim()) {
      return NextResponse.json(
        { detail: "FRONTEND_REVALIDATE_SECRET is not configured." },
        { status: 503 },
      );
    }
    return NextResponse.json({ detail: "Unauthorized." }, { status: 401 });
  }

  let paths: string[] = ["/", "/meny", "/galleri", "/kontakt"];
  try {
    const body = (await request.json()) as { paths?: string[] };
    if (Array.isArray(body.paths) && body.paths.length > 0) {
      paths = body.paths.filter((p) => typeof p === "string" && p.startsWith("/"));
    }
  } catch {
    /* use defaults */
  }

  for (const path of paths) {
    revalidatePath(path, "layout");
  }
  return NextResponse.json({ revalidated: true, paths });
}
