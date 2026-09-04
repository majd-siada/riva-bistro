"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StateMessage } from "@/components/ui/state-message";
import {
  adminListContactMessages,
  adminListEventInquiries,
  type AdminContactMessage,
  type AdminEventInquiry,
} from "@/lib/admin-api";

export default function AdminInquiriesPage() {
  const [contacts, setContacts] = useState<AdminContactMessage[] | null>(null);
  const [events, setEvents] = useState<AdminEventInquiry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([adminListContactMessages(), adminListEventInquiries()])
      .then(([c, e]) => {
        setContacts(c);
        setEvents(e);
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <StateMessage variant="error" title="Kunde inte ladda förfrågningar" />;
  if (!contacts || !events) return <p className="text-riva-muted">Laddar…</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl text-riva-cream">Förfrågningar</h1>
        <p className="mt-1 text-riva-muted">Kontakt och privata event — sparade även om e-post misslyckas.</p>
      </div>
      <section>
        <h2 className="font-display text-2xl text-riva-cream">Kontakt</h2>
        <div className="mt-4 space-y-3">
          {contacts.length === 0 && <p className="text-sm text-riva-muted">Inga meddelanden ännu.</p>}
          {contacts.map((row) => (
            <Card key={row.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {row.name} · {row.email}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-riva-muted">
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
        <h2 className="font-display text-2xl text-riva-cream">Privata event</h2>
        <div className="mt-4 space-y-3">
          {events.length === 0 && <p className="text-sm text-riva-muted">Inga eventförfrågningar ännu.</p>}
          {events.map((row) => (
            <Card key={row.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {row.name} · {row.event_type || "Event"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-riva-muted">
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
