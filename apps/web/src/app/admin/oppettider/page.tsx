"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateMessage } from "@/components/ui/state-message";
import {
  adminCreateClosure,
  adminDeleteClosure,
  adminGetHours,
  adminListClosures,
  adminSaveHours,
  type AdminClosure,
  type AdminOpeningHour,
} from "@/lib/admin-api";

function trim(t: string | null | undefined): string {
  return t ? t.slice(0, 5) : "";
}

export default function AdminHoursPage() {
  const [hours, setHours] = useState<AdminOpeningHour[]>([]);
  const [closures, setClosures] = useState<AdminClosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newClosure, setNewClosure] = useState({ date: "", reason: "" });

  useEffect(() => {
    Promise.all([adminGetHours(), adminListClosures()])
      .then(([h, c]) => {
        setHours(h.map((row) => ({ ...row, opens_at: trim(row.opens_at), closes_at: trim(row.closes_at) })));
        setClosures(c);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const updateRow = (weekday: number, patch: Partial<AdminOpeningHour>) => {
    setHours((prev) => prev.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = hours.map((r) => ({
        ...r,
        opens_at: r.is_closed || !r.opens_at ? null : r.opens_at,
        closes_at: r.is_closed || !r.closes_at ? null : r.closes_at,
      }));
      const updated = await adminSaveHours(payload);
      setHours(updated.map((row) => ({ ...row, opens_at: trim(row.opens_at), closes_at: trim(row.closes_at) })));
      toast.success("Öppettider sparade.");
    } catch {
      toast.error("Kunde inte spara öppettider.");
    } finally {
      setSaving(false);
    }
  };

  const addClosure = async () => {
    if (!newClosure.date) return;
    try {
      const created = await adminCreateClosure(newClosure.date, newClosure.reason);
      setClosures((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
      setNewClosure({ date: "", reason: "" });
      toast.success("Stängning tillagd.");
    } catch {
      toast.error("Kunde inte lägga till stängning.");
    }
  };

  const removeClosure = async (id: number) => {
    try {
      await adminDeleteClosure(id);
      setClosures((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Kunde inte ta bort stängning.");
    }
  };

  if (loading) return <p className="text-riva-taupe">Laddar…</p>;
  if (error) return <StateMessage variant="error" title="Kunde inte ladda öppettider" />;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-riva-ink">Öppettider</h1>
        <p className="mt-1 text-riva-taupe">Styr vilka tider som går att boka.</p>
      </div>

      <div className="max-w-2xl overflow-hidden rounded-lg border border-riva-ink/10">
        <table className="w-full text-sm">
          <thead className="bg-riva-cream-2 text-left text-riva-taupe">
            <tr>
              <th className="px-4 py-3 font-medium">Dag</th>
              <th className="px-4 py-3 font-medium">Öppnar</th>
              <th className="px-4 py-3 font-medium">Stänger</th>
              <th className="px-4 py-3 font-medium">Stängt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-riva-ink/10">
            {hours.map((row) => (
              <tr key={row.weekday} className="bg-riva-ivory">
                <td className="px-4 py-3">{row.weekday_label}</td>
                <td className="px-4 py-2">
                  <Input
                    type="time"
                    value={row.opens_at ?? ""}
                    disabled={row.is_closed}
                    onChange={(e) => updateRow(row.weekday, { opens_at: e.target.value })}
                    className="h-9 w-32"
                    aria-label={`${row.weekday_label} öppnar`}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="time"
                    value={row.closes_at ?? ""}
                    disabled={row.is_closed}
                    onChange={(e) => updateRow(row.weekday, { closes_at: e.target.value })}
                    className="h-9 w-32"
                    aria-label={`${row.weekday_label} stänger`}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={row.is_closed}
                    onChange={(e) => updateRow(row.weekday, { is_closed: e.target.checked })}
                    className="h-5 w-5 accent-riva-teal"
                    aria-label={`${row.weekday_label} stängt`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="gold" loading={saving} onClick={() => void save()}>
        Spara öppettider
      </Button>

      <div className="max-w-2xl border-t border-riva-ink/10 pt-10">
        <h2 className="font-display text-2xl text-riva-ink">Specialstängningar</h2>
        <p className="mt-1 text-riva-taupe">Enskilda dagar då restaurangen håller stängt.</p>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="cl-date">Datum</Label>
            <Input
              id="cl-date"
              type="date"
              value={newClosure.date}
              onChange={(e) => setNewClosure({ ...newClosure, date: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="cl-reason">Anledning (valfritt)</Label>
            <Input
              id="cl-reason"
              value={newClosure.reason}
              onChange={(e) => setNewClosure({ ...newClosure, reason: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <Button variant="outline" onClick={() => void addClosure()}>
            Lägg till
          </Button>
        </div>

        {closures.length > 0 && (
          <ul className="mt-4 divide-y divide-riva-ink/10 rounded-lg border border-riva-ink/10">
            {closures.map((c) => (
              <li key={c.id} className="flex items-center justify-between bg-riva-ivory px-4 py-3 text-sm">
                <span>
                  <span className="tabular-nums text-riva-ink">{c.date}</span>
                  {c.reason && <span className="text-riva-taupe"> — {c.reason}</span>}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Ta bort"
                  onClick={() => void removeClosure(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
