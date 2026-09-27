import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { site } from "@/lib/site-data";

export const Route = createFileRoute("/impresszum")({
  head: () => ({ meta: [
    { title: "Impresszum | BioCare Kozmetika" },
    { name: "description", content: "A BioCare Kozmetika impresszuma és kapcsolattartási adatai." },
    { property: "og:title", content: "Impresszum | BioCare Kozmetika" },
    { property: "og:description", content: "A BioCare Kozmetika impresszuma és kapcsolattartási adatai." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Impresszum,
});

function Impresszum() {
  return <main className="min-h-screen bg-background px-6 py-12 text-foreground"><div className="mx-auto max-w-3xl">
    <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft size={16}/> Vissza a főoldalra</Link>
    <p className="mt-20 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">BioCare Kozmetika</p>
    <h1 className="mt-4 font-display text-5xl">Impresszum</h1>
    <div className="mt-12 space-y-6 border-t border-border pt-8 text-muted-foreground">
      <p>Szolgáltató: {site.name}</p><p>Kapcsolattartó: {site.practitioner}</p><p>Város: {site.city}</p>
      <p>A szolgáltató teljes címe, adószáma, nyilvántartási adatai és elérhetősége jelenleg nincsenek megadva. Az oldal közzététele előtt ezeket pótolni kell.</p>
    </div>
  </div></main>;
}