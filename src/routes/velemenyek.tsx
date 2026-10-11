import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Heart, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/velemenyek")({
  head: () => ({ meta: [{ title: "Vendégvélemények | BioCare Kozmetika" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <main className="min-h-screen bg-secondary/55 px-5 py-8 text-foreground sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} aria-hidden="true" /> Vissza a BioCare-hoz</Link>
        <section className="mt-8 rounded-[1.75rem] border border-primary/10 bg-background p-6 shadow-lg shadow-primary/5 sm:p-10">
          <p className="eyebrow">Vendégeink mondták</p>
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight sm:text-5xl">Vélemények</h1>
          <div className="mt-7 rounded-2xl bg-primary/[0.055] p-5 sm:p-7">
            <MessageCircle size={24} className="text-primary" aria-hidden="true" />
            <p className="mt-3 font-display text-2xl font-medium">A vendégvélemények hamarosan itt olvashatók.</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Csak valódi, a vendég által jóváhagyott visszajelzés kerül erre az oldalra.</p>
            <Link to="/velemeny-irasa" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">Írok egy véleményt <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
          <p className="mt-7 flex items-center gap-2 text-xs text-muted-foreground"><Heart size={14} className="text-primary" aria-hidden="true" /> Köszönjük a bizalmat és a kedves szavakat.</p>
        </section>
      </div>
    </main>
  );
}
