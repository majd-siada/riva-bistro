"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StateMessage } from "@/components/ui/state-message";
import { adminOverview, type AdminOverview } from "@/lib/admin-api";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminOverview()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-riva-muted">Laddar…</p>;
  if (error || !data)
    return <StateMessage variant="error" title="Kunde inte ladda översikten" />;

  const kpis = [
    { label: "Bokningar idag", value: data.today_count },
    { label: "Gäster idag", value: data.today_guests },
    { label: "Kommande bokningar", value: data.upcoming_count },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-riva-cream">Översikt</h1>
        <p className="mt-1 text-riva-muted">Dagens läge och kommande bokningar.</p>
      </div>

      {!data.production_ready && (
        <div className="flex items-start gap-3 rounded-lg border border-riva-gold/40 bg-riva-gold/10 p-4 text-sm text-riva-cream">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-riva-gold" aria-hidden="true" />
          <p>
            Onlinebokning är <strong className="font-medium">avstängd</strong> tills
            ni anger verklig kapacitet under{" "}
            <Link href="/admin/installningar" className="underline">
              Inställningar
            </Link>{" "}
            och aktiverar produktionsläge. Gäster kan inte boka online under tiden.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-sans font-semibold uppercase tracking-wide text-riva-muted">
                {k.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl tabular-nums text-riva-cream">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-riva-cream">Dagens bokningar</h2>
          <Link href="/admin/bokningar" className="text-sm text-riva-gold hover:underline">
            Alla bokningar →
          </Link>
        </div>
        {data.todays_reservations.length === 0 ? (
          <StateMessage
            variant="empty"
            title="Inga bokningar idag"
            description="Det finns inga bokningar för dagens datum."
            className="mt-4"
          />
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-riva-cream/10">
            <table className="w-full text-sm">
              <thead className="bg-riva-surface text-left text-riva-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Tid</th>
                  <th className="px-4 py-3 font-medium">Namn</th>
                  <th className="px-4 py-3 font-medium">Gäster</th>
                  <th className="px-4 py-3 font-medium">Referens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-riva-cream/10">
                {data.todays_reservations.map((r) => (
                  <tr key={r.id} className="bg-riva-card">
                    <td className="px-4 py-3 tabular-nums">{r.time.slice(0, 5)}</td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3 tabular-nums">{r.party_size}</td>
                    <td className="px-4 py-3 font-mono text-xs text-riva-muted">{r.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
