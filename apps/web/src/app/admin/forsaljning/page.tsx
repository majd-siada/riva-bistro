import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StateMessage } from "@/components/ui/state-message";
import { fetchAdminSales } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Admin — Försäljning" };

export default async function AdminSalesPage() {
  let sales;
  try {
    sales = await fetchAdminSales();
  } catch {
    return <StateMessage variant="error" title="Kunde inte ladda försäljningsdata" />;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-riva-ivory">Försäljning</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card className="hover:translate-y-0 hover:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-sans uppercase tracking-wide text-riva-mist">
              Totalt antal ordrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl tabular-nums">{sales.total_orders}</p>
          </CardContent>
        </Card>
        <Card className="hover:translate-y-0 hover:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-sans uppercase tracking-wide text-riva-mist">
              Total intäkt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl tabular-nums">{formatPrice(sales.total_revenue)}</p>
          </CardContent>
        </Card>
        <Card className="hover:translate-y-0 hover:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-sans uppercase tracking-wide text-riva-mist">
              Total moms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl tabular-nums">{formatPrice(sales.total_vat)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
