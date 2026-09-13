"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { StateMessage } from "@/components/ui/state-message";
import {
  adminBulkDeleteInquiries,
  adminListContactMessages,
  adminListEventInquiries,
  type AdminContactMessage,
  type AdminEventInquiry,
} from "@/lib/admin-api";

export default function AdminInquiriesPage() {
  const [contacts, setContacts] = useState<AdminContactMessage[] | null>(null);
  const [events, setEvents] = useState<AdminEventInquiry[] | null>(null);
  const [error, setError] = useState(false);
  const [contactIds, setContactIds] = useState<Set<number>>(new Set());
  const [eventIds, setEventIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, e] = await Promise.all([
        adminListContactMessages(),
        adminListEventInquiries(),
      ]);
      setContacts(c);
      setEvents(e);
      setContactIds(new Set());
      setEventIds(new Set());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = (
    setIds: Dispatch<SetStateAction<Set<number>>>,
    id: number,
    checked: boolean,
  ) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const deleteSelected = async (kind: "contact" | "event") => {
    const ids = Array.from(kind === "contact" ? contactIds : eventIds);
    if (ids.length === 0) return;
    const label = kind === "contact" ? "meddelanden" : "eventförfrågningar";
    const ok = window.confirm(
      ids.length === 1
        ? `Radera det valda ${kind === "contact" ? "meddelandet" : "eventet"} permanent?`
        : `Radera ${ids.length} ${label} permanent?`,
    );
    if (!ok) return;
    setDeleting(true);
    try {
      const result = await adminBulkDeleteInquiries(kind, ids);
      toast.success(
        result.deleted === 1 ? "Raderad." : `${result.deleted} raderade.`,
      );
      await load();
    } catch {
      toast.error("Kunde inte radera.");
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <StateMessage variant="error" title="Kunde inte ladda förfrågningar" />;
  if (!contacts || !events) return <p className="text-riva-muted">Laddar…</p>;

  const allContactsSelected =
    contacts.length > 0 && contactIds.size === contacts.length;
  const allEventsSelected = events.length > 0 && eventIds.size === events.length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-riva-cream">Förfrågningar</h1>
        <p className="mt-1 text-riva-muted">
          Kontakt och privata event — sparade även om e-post misslyckas.
        </p>
      </div>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-riva-cream">Kontakt</h2>
          <div className="flex flex-wrap items-center gap-3">
            {contacts.length > 0 ? (
              <label className="flex items-center gap-2 text-sm text-riva-muted">
                <Checkbox
                  checked={allContactsSelected}
                  onCheckedChange={(v) =>
                    setContactIds(v === true ? new Set(contacts.map((c) => c.id)) : new Set())
                  }
                />
                Markera alla
              </label>
            ) : null}
            {contactIds.size > 0 ? (
              <Button
                variant="destructive"
                size="sm"
                loading={deleting}
                onClick={() => void deleteSelected("contact")}
              >
                Radera valda ({contactIds.size})
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {contacts.length === 0 && (
            <p className="text-sm text-riva-muted">Inga meddelanden ännu.</p>
          )}
          {contacts.map((row) => (
            <Card key={row.id}>
              <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
                <Checkbox
                  className="mt-1"
                  checked={contactIds.has(row.id)}
                  aria-label={`Markera meddelande från ${row.name}`}
                  onCheckedChange={(v) => toggle(setContactIds, row.id, v === true)}
                />
                <CardTitle className="text-base">
                  {row.name} · {row.email}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pl-11 text-sm text-riva-muted">
                <p>{row.subject || "Utan ämne"}</p>
                <p className="whitespace-pre-line text-riva-cream">{row.message}</p>
                <p className="text-xs">
                  {new Date(row.created_at).toLocaleString("sv-SE")} ·{" "}
                  {row.email_sent ? "E-post skickad" : "E-post ej skickad"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-riva-cream">Privata event</h2>
          <div className="flex flex-wrap items-center gap-3">
            {events.length > 0 ? (
              <label className="flex items-center gap-2 text-sm text-riva-muted">
                <Checkbox
                  checked={allEventsSelected}
                  onCheckedChange={(v) =>
                    setEventIds(v === true ? new Set(events.map((e) => e.id)) : new Set())
                  }
                />
                Markera alla
              </label>
            ) : null}
            {eventIds.size > 0 ? (
              <Button
                variant="destructive"
                size="sm"
                loading={deleting}
                onClick={() => void deleteSelected("event")}
              >
                Radera valda ({eventIds.size})
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {events.length === 0 && (
            <p className="text-sm text-riva-muted">Inga eventförfrågningar ännu.</p>
          )}
          {events.map((row) => (
            <Card key={row.id}>
              <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
                <Checkbox
                  className="mt-1"
                  checked={eventIds.has(row.id)}
                  aria-label={`Markera event från ${row.name}`}
                  onCheckedChange={(v) => toggle(setEventIds, row.id, v === true)}
                />
                <CardTitle className="text-base">
                  {row.name} · {row.event_type || "Event"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pl-11 text-sm text-riva-muted">
                <p>
                  {row.email} {row.phone ? `· ${row.phone}` : ""} · {row.guests || "?"} gäster ·{" "}
                  {row.date || "datum saknas"}
                </p>
                <p className="whitespace-pre-line text-riva-cream">{row.message}</p>
                <p className="text-xs">
                  {new Date(row.created_at).toLocaleString("sv-SE")} ·{" "}
                  {row.email_sent ? "E-post skickad" : "E-post ej skickad"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
