import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand ISR revalidation for Hostinger/Next.
 * Auth: Authorization: Bearer <FRONTEND_REVALIDATE_SECRET>
 * Body: { "paths": ["/", "/meny", ...] }
 */
export async function POST(request: NextRequest) {
  const secret = (process.env.FRONTEND_REVALIDATE_SECRET || "").trim();
  if (!secret) {
    return NextResponse.json(
      { detail: "FRONTEND_REVALIDATE_SECRET is not configured." },
      { status: 503 },
    );
  }
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || token !== secret) {
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
    revalidatePath(path);
  }
  return NextResponse.json({ revalidated: true, paths });
}
