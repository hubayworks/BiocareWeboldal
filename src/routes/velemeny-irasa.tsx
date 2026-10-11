import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Heart, Star, UserRound } from "lucide-react";
import { site } from "@/lib/site-data";

export const Route = createFileRoute("/velemeny-irasa")({
  head: () => ({ meta: [{ title: "Vélemény írása | BioCare Kozmetika" }] }),
  component: ReviewFormPage,
});

function ReviewFormPage() {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [permission, setPermission] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const sendReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const website = String(new FormData(event.currentTarget).get("website") || "");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, rating, review, consent: permission, website }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "A beküldés most nem sikerült. Próbáld újra később.");
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "A beküldés most nem sikerült. Próbáld újra később.");
    }
  };

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 sm:py-12">
      <div className="mx-auto max-w-xl">
        <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} aria-hidden="true" /> Vissza a BioCare-hoz</Link><Link to="/fiok" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 px-4 text-sm font-semibold text-primary"><UserRound size={16} aria-hidden="true" /> Saját véleményeim</Link></div>
        <div className="mt-8 rounded-[1.75rem] border border-primary/10 bg-white/80 p-5 shadow-lg shadow-primary/5 sm:p-8">
          <p className="eyebrow">Vendégvélemény</p>
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight sm:text-5xl">Meséld el, milyen volt.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">A visszajelzésed segít másoknak is megismerni a BioCare-t. Nyilvánosan csak Dominika jóváhagyása után jelenik meg.</p>
          {submitted ? (
            <div role="status" className="mt-7 rounded-2xl border border-primary/15 bg-primary/[0.055] p-5 sm:p-7">
              <Heart size={24} className="text-primary" aria-hidden="true" />
              <p className="mt-3 font-display text-2xl font-medium">Köszönjük a véleményed!</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Elküldtük Dominikának jóváhagyásra. Közzététel után jelenik meg a Vélemények oldalon.</p>
            </div>
          ) : (
          <form onSubmit={sendReview} className="mt-7 space-y-5">
            <label className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">Weboldal<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <fieldset>
              <legend className="text-sm font-semibold">Hány csillagot adnál?</legend>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="cursor-pointer rounded-full text-primary focus-within:outline focus-within:outline-2 focus-within:outline-ring">
                    <input className="peer sr-only" required type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} aria-label={`${value} csillag`} />
                    <span className="grid size-11 place-items-center rounded-full transition-colors peer-checked:bg-primary/10 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ring active:bg-primary/10">
                      <Star size={23} fill={value <= rating ? "currentColor" : "none"} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-2 text-sm font-semibold">Hogyan jelenjen meg a neved?
              <input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Például: Anna" className="min-h-12 rounded-2xl border border-primary/15 bg-background px-4 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">A véleményed
              <textarea required minLength={10} rows={5} value={review} onChange={(event) => setReview(event.target.value)} placeholder="Mi tetszett a kezelésben vagy a szalonban?" className="resize-y rounded-2xl border border-primary/15 bg-background px-4 py-3 font-normal leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </label>
            <label className="flex items-start gap-3 rounded-2xl bg-secondary/70 p-4 text-sm leading-6 text-foreground/85">
              <input required type="checkbox" checked={permission} onChange={(event) => setPermission(event.target.checked)} className="mt-1 size-4 shrink-0 accent-primary" />
              <span>Hozzájárulok, hogy a megadott nevem és véleményem jóváhagyás után megjelenjen a BioCare weboldalán.</span>
            </label>
            <button type="submit" disabled={!rating} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45">Vélemény elküldése <ArrowUpRight size={16} aria-hidden="true" /></button>
            {error && <p role="alert" className="text-sm leading-6 text-destructive">{error}</p>}
            <p className="text-xs leading-5 text-muted-foreground">A vélemény adatbázisba kerül, és csak Dominika jóváhagyása után válik nyilvánossá.</p>
          </form>
          )}
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Heart size={14} className="text-primary" aria-hidden="true" /> Köszönjük, hogy megosztod a tapasztalatod.</p>
      </div>
    </main>
  );
}
