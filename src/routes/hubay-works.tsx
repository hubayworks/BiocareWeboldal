import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AudioLines, Sparkles } from "lucide-react";
import hubayWorksLogo from "@/assets/hubay-works-logo.png";

export const Route = createFileRoute("/hubay-works")({
  head: () => ({
    meta: [
      { title: "A készítőtől | Hubay Works" },
      {
        name: "description",
        content: "Így készült a BioCare Kozmetika weboldala: hangalapú szerkesztéssel és AI közreműködésével.",
      },
    ],
  }),
  component: HubayWorksPage,
});

function HubayWorksPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary px-5 py-12 text-foreground md:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 size-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 size-[28rem] rounded-full bg-white/80 blur-3xl" />

      <article className="relative w-full max-w-2xl rounded-[2rem] border border-white/80 bg-background/80 px-7 py-10 shadow-[0_30px_90px_rgb(46_69_45/0.10)] backdrop-blur-sm sm:px-12 sm:py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-70">
          <ArrowLeft size={15} aria-hidden="true" /> Vissza a BioCare oldalára
        </Link>

        <div className="mt-11 flex items-center gap-5">
          <img src={hubayWorksLogo} alt="Hubay Works" className="size-[4.5rem] shrink-0 rounded-2xl border border-primary/10 bg-white p-2 object-contain" />
          <div>
            <p className="eyebrow">Hubay Works</p>
            <p className="mt-1 text-sm text-muted-foreground">Egy szó a készítőtől</p>
          </div>
        </div>

        <h1 className="mt-8 font-display text-4xl font-medium leading-tight sm:text-5xl">Hogyan készült <em>ez a weboldal?</em></h1>
        <p className="mt-6 text-base leading-8 text-muted-foreground">
          A BioCare Kozmetika weboldala hangalapú szerkesztéssel és mesterséges intelligencia közreműködésével készült. Az elképzelések beszélgetésben formálódtak: a készítő és az AI együtt alakította ki az oldal szövegét, megjelenését és működését.
        </p>

        <div className="mt-8 flex flex-wrap gap-3" aria-label="A weboldal készítésének módja">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-2 text-xs font-medium text-primary"><AudioLines size={15} aria-hidden="true" /> Hangalapú szerkesztés</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-2 text-xs font-medium text-primary"><Sparkles size={15} aria-hidden="true" /> AI közreműködés</span>
        </div>

        <div className="mt-10 border-t border-primary/10 pt-6 text-sm text-muted-foreground">
          Készült a <span className="font-semibold text-foreground">Hubay Works</span> közreműködésével.
        </div>
      </article>
    </main>
  );
}
