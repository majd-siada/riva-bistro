"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  adminBulkDeleteReservations,
  adminDeleteReservation,
  adminListReservations,
  adminResendReservationNotifications,
  adminUpdateReservationStatus,
  type AdminReservationWithNotify,
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
  const [rows, setRows] = useState<AdminReservationWithNotify[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<AdminReservationWithNotify | null>(null);
  const [resending, setResending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

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
      setSelectedIds(new Set());
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

  const allSelected = rows.length > 0 && selectedIds.size === rows.length;
  const someSelected = selectedIds.size > 0;

  const toggleOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(rows.map((r) => r.id)) : new Set());
  };

  const changeStatus = async (id: number, newStatus: string) => {
    try {
      const updated = await adminUpdateReservationStatus(id, newStatus);
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, ...updated } : prev));
      toast.success("Status uppdaterad.");
    } catch {
      toast.error("Kunde inte uppdatera status.");
    }
  };

  const resendNotifications = async (id: number) => {
    setResending(true);
    try {
      const updated = await adminResendReservationNotifications(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, ...updated } : prev));
      toast.success("Notiser skickades om (best-effort).");
    } catch {
      toast.error("Kunde inte skicka om notiser.");
    } finally {
      setResending(false);
    }
  };

  const deleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const ok = window.confirm(
      ids.length === 1
        ? "Radera den valda bokningen permanent?"
        : `Radera ${ids.length} bokningar permanent?`,
    );
    if (!ok) return;
    setDeleting(true);
    try {
      const result = await adminBulkDeleteReservations(ids);
      toast.success(
        result.deleted === 1 ? "Bokning raderad." : `${result.deleted} bokningar raderade.`,
      );
      setSelected((prev) => (prev && ids.includes(prev.id) ? null : prev));
      await load();
    } catch {
      toast.error("Kunde inte radera bokningar.");
    } finally {
      setDeleting(false);
    }
  };

  const deleteOne = async (id: number) => {
    const ok = window.confirm("Radera bokningen permanent?");
    if (!ok) return;
    setDeleting(true);
    try {
      await adminDeleteReservation(id);
      toast.success("Bokning raderad.");
      setSelected(null);
      await load();
    } catch {
      toast.error("Kunde inte radera bokningen.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-riva-cream">Bokningar</h1>
        <p className="mt-1 text-riva-muted">Hantera och följ upp bokningar.</p>
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

      {someSelected ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-riva-cream/10 bg-riva-surface/40 px-4 py-3">
          <p className="text-sm text-riva-cream">{selectedIds.size} valda</p>
          <Button
            variant="destructive"
            size="sm"
            loading={deleting}
            onClick={() => void deleteSelected()}
          >
            Radera valda
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Avmarkera
          </Button>
        </div>
      ) : null}

      {loading ? (
        <p className="text-riva-muted">Laddar…</p>
      ) : error ? (
        <StateMessage variant="error" title="Kunde inte ladda bokningar" />
      ) : rows.length === 0 ? (
        <StateMessage
          variant="empty"
          title="Inga bokningar"
          description="Det finns inga bokningar för det valda filtret."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-riva-cream/10">
          <table className="w-full text-sm">
            <thead className="bg-riva-surface text-left text-riva-muted">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    aria-label="Markera alla"
                    onCheckedChange={(v) => toggleAll(v === true)}
                  />
                </th>
                <th className="px-4 py-3 font-medium">Datum</th>
                <th className="px-4 py-3 font-medium">Tid</th>
                <th className="px-4 py-3 font-medium">Namn</th>
                <th className="px-4 py-3 font-medium">Gäster</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Notiser</th>
                <th className="px-4 py-3 font-medium">Referens</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-riva-cream/10">
              {rows.map((r) => {
                const notifyOk =
                  r.telegram_notified !== false && r.staff_email_notified !== false;
                const notifyPartial =
                  r.telegram_notified === true || r.staff_email_notified === true;
                const isChecked = selectedIds.has(r.id);
                return (
                  <tr key={r.id} className="bg-riva-card">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={isChecked}
                        aria-label={`Markera ${r.ref}`}
                        onCheckedChange={(v) => toggleOne(r.id, v === true)}
                      />
                    </td>
                    <td className="px-4 py-3 tabular-nums">{r.date}</td>
                    <td className="px-4 py-3 tabular-nums">{r.time.slice(0, 5)}</td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3 tabular-nums">{r.party_size}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(r.status)}>{r.status_label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {notifyOk ? (
                        <span className="text-riva-muted">Skickad</span>
                      ) : notifyPartial ? (
                        <span className="text-riva-gold">Delvis</span>
                      ) : (
                        <span className="text-riva-gold">Ej skickad</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-riva-muted">{r.ref}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>
                        Visa
                      </Button>
                    </td>
                  </tr>
                );
              })}
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
              {selected.special_request ? (
                <div className="rounded-md bg-riva-surface p-3 text-sm">
                  <p className="riva-label">Särskilda önskemål</p>
                  <p className="mt-1 text-riva-muted">{selected.special_request}</p>
                </div>
              ) : null}

              <div className="rounded-md border border-riva-cream/10 bg-riva-surface/40 p-3 text-sm">
                <p className="riva-label">Personalnotiser</p>
                <ul className="mt-2 space-y-1 text-riva-muted">
                  <li>Telegram: {selected.telegram_notified ? "skickad" : "ej skickad"}</li>
                  <li>
                    Personal-e-post: {selected.staff_email_notified ? "skickad" : "ej skickad"}
                  </li>
                </ul>
                <Button
                  className="mt-3"
                  variant="outline"
                  size="sm"
                  loading={resending}
                  onClick={() => void resendNotifications(selected.id)}
                >
                  Skicka om notiser
                </Button>
              </div>

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

              <Button
                variant="destructive"
                size="sm"
                loading={deleting}
                onClick={() => void deleteOne(selected.id)}
              >
                Radera bokning
              </Button>
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
      <dt className="text-xs uppercase tracking-wide text-riva-muted">{label}</dt>
      <dd className="mt-0.5 text-riva-cream">{value}</dd>
    </div>
  );
}
