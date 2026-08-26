import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StateMessage } from "@/components/ui/state-message";
import { fetchAdminProducts } from "@/lib/api";

export const metadata = { title: "Admin — Produkter" };

export default async function AdminProductsPage() {
  let products;
  try {
    products = await fetchAdminProducts();
  } catch {
    return <StateMessage variant="error" title="Kunde inte ladda produkter" />;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-riva-ivory">Produkter</h1>
      <div className="mt-8 overflow-hidden rounded-md border border-riva-ivory/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Pris exkl.</TableHead>
              <TableHead>Lager</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category_name}</TableCell>
                <TableCell className="tabular-nums">{p.pricing.price_ex_vat} kr</TableCell>
                <TableCell className="tabular-nums">{p.inventory_count ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={p.is_available ? "available" : "soldOut"}>
                    {p.is_available ? "Tillgänglig" : "Slut"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
