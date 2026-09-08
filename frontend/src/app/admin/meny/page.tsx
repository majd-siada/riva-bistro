"use client";

import { Suspense } from "react";

import AdminMenuManager from "./menu-manager";

export default function AdminMenuPage() {
  return (
    <Suspense fallback={<p className="text-riva-muted">Laddar…</p>}>
      <AdminMenuManager />
    </Suspense>
  );
}
