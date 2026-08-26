import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StateMessage } from "@/components/ui/state-message";
import { fetchAdminOverview } from "@/lib/api";

export const metadata = { title: "Admin — Översikt" };

export default async function AdminOverviewPage() {
  let overview;
  try {
    overview = await fetchAdminOverview();
  } catch {
    return (
      <StateMessage
        variant="error"
        title="Kunde inte ladda dashboard"
        description="Kontrollera att backend-tjänsten körs."
      />
    );
  }

  const kpis = [
    { label: "Ordrar idag", value: overview.orders_today },
    { label: "Total intäkt", value: `${overview.revenue_total} kr` },
    { label: "Snittnota", value: `${overview.avg_ticket} kr` },
    { label: "Lågt lager", value: overview.low_stock_count },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-riva-ivory">Översikt</h1>
      <p className="mt-2 text-riva-mist">Dagens nyckeltal och driftstatus.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-riva-ivory/10 hover:translate-y-0 hover:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-sans font-semibold uppercase tracking-wide text-riva-mist">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl text-riva-ivory tabular-nums">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {overview.pending_orders > 0 && (
        <div className="mt-8 rounded-md border border-riva-gold/30 bg-riva-gold/5 p-4 text-sm text-riva-gold">
          {overview.pending_orders} order(s) väntar på bekräftelse.
        </div>
      )}
    </div>
  );
}
