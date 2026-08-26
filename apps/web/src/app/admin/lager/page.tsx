import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StateMessage } from "@/components/ui/state-message";
import { fetchAdminInventory } from "@/lib/api";

export const metadata = { title: "Admin — Lager" };

export default async function AdminInventoryPage() {
  let items;
  try {
    items = await fetchAdminInventory();
  } catch {
    return <StateMessage variant="error" title="Kunde inte ladda lager" />;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-riva-ivory">Lager</h1>
      <div className="mt-8 overflow-hidden rounded-md border border-riva-ivory/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produkt</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Antal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category__name}</TableCell>
                <TableCell className="tabular-nums">
                  <span className={item.inventory_count < 10 ? "text-riva-error" : ""}>
                    {item.inventory_count}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={item.is_available ? "available" : "soldOut"}>
                    {item.is_available ? "Aktiv" : "Inaktiv"}
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
