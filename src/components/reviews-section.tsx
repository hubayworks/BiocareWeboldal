import { useEffect, useState } from "react";
import { ArrowUpRight, Heart, MessageCircle, Star } from "lucide-react";
import { reviewSources, type PublishedReview, type ReviewSource } from "@/lib/site-data";

const sourceLabels: Record<ReviewSource, string> = {
  website: "BioCare weboldal",
  google: "Google",
  facebook: "Facebook",
  other: "Vendégértékelés",
};

export function ReviewsSection({ standalone = false }: { standalone?: boolean }) {
  const [reviews, setReviews] = useState<PublishedReview[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/reviews", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Reviews unavailable");
        return response.json() as Promise<PublishedReview[]>;
      })
      .then((data) => { if (active) { setReviews(data); setLoadState("ready"); } })
      .catch(() => { if (active) setLoadState("unavailable"); });
    return () => { active = false; };
  }, []);

  return (
    <section id={standalone ? undefined : "velemenyek"} className={`bg-background px-5 text-foreground md:px-8 ${standalone ? "py-10 sm:py-14" : "scroll-mt-28 py-16 md:py-24"}`}>
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Vendégeink tapasztalatai</p>
          <h2 className="mt-2 font-display text-4xl font-medium leading-tight sm:text-5xl">Vélemények</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Ismerd meg mások tapasztalatait Dominika kezeléseiről és a BioCare-ben töltött időről.
          </p>
        </div>

        {loadState === "loading" ? (
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-primary/10 bg-secondary/35 p-6 text-center text-sm text-muted-foreground">A vélemények betöltése…</div>
        ) : loadState === "unavailable" ? (
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-primary/10 bg-secondary/35 p-6 text-center text-sm leading-6 text-muted-foreground">A vélemények listája most nem érhető el. Kérjük, próbáld meg később.</div>
        ) : reviews.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.id} className="flex h-full flex-col rounded-3xl border border-primary/10 bg-secondary/35 p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-primary" aria-label={`${review.rating} az 5 csillagból`}>
                    {Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} fill={index < review.rating ? "currentColor" : "none"} aria-hidden="true" />)}
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">{sourceLabels[review.source]}</span>
                </div>
                <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-6 text-foreground/85">“{review.text}”</p>
                <div className="mt-5 flex items-center justify-between border-t border-primary/10 pt-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{review.author}</span>
              <time dateTime={review.date}>{new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long" }).format(new Date(`${review.date}T12:00:00`))}</time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-primary/10 bg-secondary/35 p-6 text-center sm:p-9">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><MessageCircle size={22} aria-hidden="true" /></span>
            <h3 className="mt-4 font-display text-2xl font-medium sm:text-3xl">Hamarosan vendégvéleményekkel</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Itt a weboldalon beküldött, Dominika által jóváhagyott valódi visszajelzéseket olvashatod majd. Még nincs közzétett vélemény.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/velemeny-irasa" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Megosztom a tapasztalatom <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2" aria-label="Tervezett értékelési források">
          {reviewSources.filter((source) => source.status === "planned").map((source) => (
            <span key={source.id} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary/10 bg-background/75 px-3 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary/45" aria-hidden="true" />{source.label} · később hozzáadható
            </span>
          ))}
        </div>
        <div className="mt-5 text-center">
          <a href="/velemenyek" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-primary underline decoration-primary/35 underline-offset-4 hover:decoration-primary">
            Minden vélemény <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><Heart size={13} className="text-primary" aria-hidden="true" /> Csak valódi, jóváhagyott vendégvélemények jelennek meg.</p>
      </div>
    </section>
  );
}
