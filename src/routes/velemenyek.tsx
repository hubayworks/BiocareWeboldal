import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";
import { ReviewsSection } from "@/components/reviews-section";

export const Route = createFileRoute("/velemenyek")({
  head: () => ({ meta: [{ title: "Vendégvélemények | BioCare Kozmetika" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  return (
    <main className="min-h-screen bg-secondary/55 px-5 py-8 text-foreground sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} aria-hidden="true" /> Vissza a BioCare-hoz</Link><Link to="/fiok" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 bg-background px-4 text-sm font-semibold text-primary"><UserRound size={16} aria-hidden="true" /> Saját vendégfiók</Link></div>
        <div className="mt-2 overflow-hidden rounded-[1.75rem] border border-primary/10 bg-background shadow-lg shadow-primary/5">
          <ReviewsSection standalone />
        </div>
      </div>
    </main>
  );
}
