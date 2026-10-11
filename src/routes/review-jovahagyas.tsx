import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Archive, Check, Heart, Star, Trash2 } from "lucide-react";

type Action = "approve" | "archive" | "delete";
type ReviewPreview = { author: string; rating: number; text: string };

const actionCopy: Record<Action, { title: string; button: string; success: string; Icon: typeof Check }> = {
  approve: { title: "Vélemény közzététele", button: "Jóváhagyom és közzéteszem", success: "A vélemény megjelent a BioCare weboldalán.", Icon: Check },
  archive: { title: "Vélemény archiválása", button: "Archiválom", success: "A véleményt archiváltuk; nem jelenik meg nyilvánosan.", Icon: Archive },
  delete: { title: "Vélemény végleges törlése", button: "Véglegesen törlöm", success: "A véleményt véglegesen töröltük.", Icon: Trash2 },
};

export const Route = createFileRoute("/review-jovahagyas")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
    action: search.action === "archive" || search.action === "delete" ? search.action : "approve",
  }),
  head: () => ({ meta: [{ title: "Vélemény kezelése | BioCare Kozmetika" }] }),
  component: ReviewApprovalPage,
});

function ReviewApprovalPage() {
  const { token, action } = Route.useSearch() as { token: string; action: Action };
  const [review, setReview] = useState<ReviewPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const config = actionCopy[action];

  useEffect(() => {
    let active = true;
    if (!token) {
      setError("A hivatkozás hiányos.");
      setLoading(false);
      return;
    }
    fetch(`/api/reviews/approval?token=${encodeURIComponent(token)}`, { headers: { Accept: "application/json" } })
      .then(async (response) => {
        const data = await response.json().catch(() => ({})) as ReviewPreview & { statusMessage?: string; message?: string };
        if (!response.ok) throw new Error(data.statusMessage || data.message || "A hivatkozás érvénytelen vagy lejárt.");
        if (active) setReview(data);
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "A vélemény most nem tölthető be."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const confirmAction = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/reviews/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token, action }),
      });
      const data = await response.json().catch(() => ({})) as { statusMessage?: string; message?: string };
      if (!response.ok) throw new Error(data.statusMessage || data.message || "A művelet nem sikerült.");
      setDone(true);
      setReview(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "A művelet nem sikerült.");
    } finally {
      setBusy(false);
    }
  };

  const Icon = config.Icon;
  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} aria-hidden="true" /> Vissza a BioCare-hoz</Link>
        <section className="mt-8 rounded-[1.75rem] border border-primary/10 bg-white/85 p-5 shadow-lg shadow-primary/5 sm:p-8">
          <p className="eyebrow">Dominika kezelőfelülete</p>
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight">{done ? "Művelet kész" : config.title}</h1>
          {loading ? <p className="mt-5 text-sm text-muted-foreground">A vélemény betöltése…</p> : null}
          {error && !review && !done ? <p role="alert" className="mt-5 rounded-2xl bg-destructive/10 p-4 text-sm leading-6 text-destructive">{error}</p> : null}
          {done ? (
            <div role="status" className="mt-6 rounded-2xl border border-primary/15 bg-primary/[0.055] p-5">
              <Heart size={22} className="text-primary" aria-hidden="true" />
              <p className="mt-3 text-sm leading-6">{config.success}</p>
            </div>
          ) : review ? (
            <>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Ellenőrizd az értékelést. A művelet csak az alábbi gomb megnyomása után történik meg.</p>
              <article className="mt-6 rounded-2xl border border-primary/10 bg-secondary/45 p-5">
                <div className="flex items-center justify-between gap-3">
                  <strong>{review.author}</strong>
                  <span className="flex items-center gap-1 text-primary" aria-label={`${review.rating} az 5 csillagból`}>
                    {Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < review.rating ? "currentColor" : "none"} aria-hidden="true" />)}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-6">{review.text}</p>
              </article>
              {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
              <button type="button" onClick={confirmAction} disabled={busy} className={`mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition disabled:opacity-55 ${action === "delete" ? "bg-red-700 hover:bg-red-800" : "bg-primary hover:bg-primary/90"}`}>
                <Icon size={17} aria-hidden="true" /> {busy ? "Feldolgozás…" : config.button}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Az e-mailes hivatkozás egyszer használható, és 48 óráig érvényes.</p>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
