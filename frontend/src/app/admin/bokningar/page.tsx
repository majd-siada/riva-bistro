"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StateMessage } from "@/components/ui/state-message";
import {
  adminListReservations,
  adminUpdateReservationStatus,
  type AdminReservation,
} from "@/lib/admin-api";

const STATUSES = [
  { value: "confirmed", label: "Bekräftad" },
  { value: "seated", label: "Anländ" },
  { value: "cancelled", label: "Avbokad" },
  { value: "no_show", label: "Uteblev" },
];

function statusVariant(status: string) {
  if (status === "cancelled" || status === "no_show") return "soldOut" as const;
  if (status === "seated") return "teal" as const;
  return "available" as const;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminBookingsPage() {
  const [date, setDate] = useState(todayIso());
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<AdminReservation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await adminListReservations({
        date: date || undefined,
        status: status || undefined,
        q: q || undefined,
      });
      setRows(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [date, status, q]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 250);
    return () => clearTimeout(t);
  }, [load]);

  const changeStatus = async (id: number, newStatus: string) => {
    try {
      const updated = await adminUpdateReservationStatus(id, newStatus);
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setSelected((prev) => (prev && prev.id === id ? updated : prev));
      toast.success("Status uppdaterad.");
    } catch {
      toast.error("Kunde inte uppdatera status.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-riva-ink">Bokningar</h1>
        <p className="mt-1 text-riva-taupe">Hantera och följ upp bokningar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1.5fr] sm:items-end">
        <div>
          <Label htmlFor="f-date">Datum</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="f-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Button variant="outline" onClick={() => setDate("")}>
              Alla
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="f-status">Status</Label>
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
            <SelectTrigger id="f-status" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla statusar</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="f-q">Sök</Label>
          <Input
            id="f-q"
            placeholder="Namn, e-post, telefon eller referens"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-riva-taupe">Laddar…</p>
      ) : error ? (
        <StateMessage variant="error" title="Kunde inte ladda bokningar" />
      ) : rows.length === 0 ? (
        <StateMessage
          variant="empty"
          title="Inga bokningar"
          description="Det finns inga bokningar för det valda filtret."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-riva-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-riva-cream-2 text-left text-riva-taupe">
              <tr>
                <th className="px-4 py-3 font-medium">Datum</th>
                <th className="px-4 py-3 font-medium">Tid</th>
                <th className="px-4 py-3 font-medium">Namn</th>
                <th className="px-4 py-3 font-medium">Gäster</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Referens</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-riva-ink/10">
              {rows.map((r) => (
                <tr key={r.id} className="bg-riva-ivory">
                  <td className="px-4 py-3 tabular-nums">{r.date}</td>
                  <td className="px-4 py-3 tabular-nums">{r.time.slice(0, 5)}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 tabular-nums">{r.party_size}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(r.status)}>{r.status_label}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-riva-taupe">{r.ref}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>
                      Visa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Datum" value={selected.date} />
                <Detail label="Tid" value={selected.time.slice(0, 5)} />
                <Detail label="Gäster" value={String(selected.party_size)} />
                <Detail label="Referens" value={selected.ref} />
                <Detail label="Telefon" value={selected.phone} />
                <Detail label="E-post" value={selected.email} />
              </dl>
              {selected.special_request && (
                <div className="rounded-md bg-riva-cream-2 p-3 text-sm">
                  <p className="riva-label">Särskilda önskemål</p>
                  <p className="mt-1 text-riva-ink-soft">{selected.special_request}</p>
                </div>
              )}
              <div>
                <Label htmlFor="status-change">Ändra status</Label>
                <Select
                  value={selected.status}
                  onValueChange={(v) => void changeStatus(selected.id, v)}
                >
                  <SelectTrigger id="status-change" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-riva-taupe">{label}</dt>
      <dd className="mt-0.5 text-riva-ink">{value}</dd>
    </div>
  );
}
