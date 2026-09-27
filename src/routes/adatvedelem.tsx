import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/adatvedelem")({
  head: () => ({ meta: [
    { title: "Adatvédelem | BioCare Kozmetika" },
    { name: "description", content: "Tájékoztatás a BioCare Kozmetika weboldalán megadott adatok kezeléséről." },
    { property: "og:title", content: "Adatvédelem | BioCare Kozmetika" },
    { property: "og:description", content: "Tájékoztatás a BioCare Kozmetika weboldalán megadott adatok kezeléséről." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Adatvedelem,
});

function Adatvedelem() {
  return <main className="min-h-screen bg-background px-6 py-12 text-foreground"><div className="mx-auto max-w-3xl">
    <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft size={16}/> Vissza a főoldalra</Link>
    <p className="mt-20 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">BioCare Kozmetika</p>
    <h1 className="mt-4 font-display text-5xl">Adatvédelem</h1>
    <div className="mt-12 space-y-6 border-t border-border pt-8 leading-relaxed text-muted-foreground">
      <p>Az oldalon kitöltött kapcsolatfelvételi űrlap adatait a weboldal jelenleg nem menti el és nem továbbítja szerverre. Elérhetőség megadása nélkül a kitöltött szöveg csak a saját eszközöd vágólapjára másolható.</p>
      <p>Az oldal nem használ saját elemző vagy marketing célú sütiket. A megjelenítéshez szükséges betűtípusok a Google Fonts szolgáltatásából töltődnek be.</p>
      <p>A teljes adatkezelési tájékoztatóhoz az adatkezelő azonosító és kapcsolattartási adatai még hiányoznak. Az oldal éles használata előtt jogi ellenőrzés és kiegészítés szükséges.</p>
    </div>
  </div></main>;
}