import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Admin — Inställningar" };

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-riva-ivory">Inställningar</h1>
      <p className="mt-2 text-riva-mist">Restauranginställningar och moms.</p>

      <form className="mt-8 max-w-lg space-y-5 rounded-md border border-riva-ivory/10 bg-riva-charcoal p-6">
        <div>
          <Label htmlFor="restaurant-name">Restaurangnamn</Label>
          <Input id="restaurant-name" defaultValue="Riva Bistro" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="vat-rate">Moms (%)</Label>
          <Input id="vat-rate" defaultValue="25" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="currency">Valuta</Label>
          <Input id="currency" defaultValue="SEK" className="mt-1.5" />
        </div>
        <Button type="submit">Spara inställningar</Button>
      </form>
    </div>
  );
}
