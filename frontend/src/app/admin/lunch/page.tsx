"use client";

import { Suspense } from "react";

import AdminMenuManager from "../meny/menu-manager";

export default function AdminLunchPage() {
  return (
    <Suspense fallback={<p className="text-riva-muted">Laddar…</p>}>
      <AdminMenuManager
        lockedSection="dagens-lunch"
        title="Lunch"
        description="Hantera Dagens lunch — samma data som Meny → Dagens lunch."
      />
    </Suspense>
  );
}
