"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateMessage } from "@/components/ui/state-message";
import { adminGetSettings, adminUpdateSettings, type AdminSettings } from "@/lib/admin-api";

const NUMERIC_FIELDS: { key: keyof AdminSettings; label: string; help: string }[] = [
  { key: "max_guests_per_slot", label: "Max antal gäster per tidslucka", help: "Total kapacitet per bokningstid." },
  { key: "slot_interval_minutes", label: "Intervall mellan tider (min)", help: "T.ex. 30 för halvtimmesluckor." },
  { key: "last_seating_buffer_minutes", label: "Sista bokning före stängning (min)", help: "Hur långt före stängning sista bokningen tillåts." },
  { key: "max_party_size", label: "Max sällskap online", help: "Största sällskap som kan bokas online." },
  { key: "booking_lead_minutes", label: "Framförhållning (min)", help: "Minsta tid mellan bokning och besök." },
  { key: "booking_horizon_days", label: "Bokningshorisont (dagar)", help: "Hur långt fram i tiden det går att boka." },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetSettings().then(setSettings).catch(() => setError(true));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await adminUpdateSettings(settings);
      setSettings(updated);
      toast.success("Inställningar sparade.");
    } catch {
      toast.error("Kunde inte spara inställningar.");
    } finally {
      setSaving(false);
    }
  };

  if (error) return <StateMessage variant="error" title="Kunde inte ladda inställningar" />;
  if (!settings) return <p className="text-riva-muted">Laddar…</p>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-riva-cream">Bokningsinställningar</h1>
        <p className="mt-1 text-riva-muted">Kapacitet och regler för onlinebokning.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {NUMERIC_FIELDS.map((f) => (
          <div key={f.key}>
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              type="number"
              min={0}
              value={String(settings[f.key] as number)}
              onChange={(e) =>
                setSettings({ ...settings, [f.key]: Number(e.target.value) })
              }
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-riva-muted">{f.help}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-riva-gold/40 bg-riva-gold/[0.07] p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-riva-gold" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium text-riva-cream">Onlinebokning</p>
            <p className="mt-1 text-sm text-riva-muted">
              Denna växel är den enda grinden för onlinebokning — även om DEBUG
              råkar vara på. Aktivera först när kapaciteten ovan speglar
              restaurangens verkliga förmåga. När växeln är av kan gäster inte
              boka online.
            </p>
            <p className="mt-2 text-sm text-riva-cream">
              Status:{" "}
              <strong className="font-medium">
                {settings.production_ready ? "Live" : "Avstängd"}
              </strong>
            </p>
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-riva-cream">
              <input
                type="checkbox"
                checked={settings.production_ready}
                onChange={(e) =>
                  setSettings({ ...settings, production_ready: e.target.checked })
                }
                className="h-5 w-5 accent-riva-gold"
              />
              Aktivera onlinebokning
            </label>
          </div>
        </div>
      </div>

      <Button variant="gold" loading={saving} onClick={() => void save()}>
        Spara inställningar
      </Button>
    </div>
  );
}
