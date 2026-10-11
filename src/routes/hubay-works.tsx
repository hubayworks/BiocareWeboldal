import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowDownRight, Check } from "lucide-react";
import hubayWorksLogo from "@/assets/hubay-works-logo.png";

export const Route = createFileRoute("/hubay-works")({
  head: () => ({
    meta: [
      { title: "Hubay Works | Weboldalak ötlettől a megjelenésig" },
      {
        name: "description",
        content: "Ismerd meg a Hubay Works weboldalkészítési folyamatát a kezdeti ötlettől a közzétételig.",
      },
    ],
  }),
  component: HubayWorksPage,
});

const steps = [
  {
    number: "01",
    title: "Először megismerjük az ötletet",
    description:
      "Átbeszéljük, kinek szól a weboldal, mit kell elmondania, és milyen érzést szeretnél kelteni a látogatókban.",
  },
  {
    number: "02",
    title: "Közösen kialakítjuk a megjelenést",
    description:
      "A márkádhoz illő színekkel, képekkel és átlátható felépítéssel tervezzük meg az oldalt, mobilra és nagyobb képernyőre is.",
  },
  {
    number: "03",
    title: "Elkészítjük, majd finomítjuk",
    description:
      "A működő változatot végig tudod nézni, és a visszajelzéseid alapján együtt csiszoljuk a részleteket.",
  },
  {
    number: "04",
    title: "Segítünk elindítani",
    description:
      "Amikor elégedett vagy az eredménnyel, a weboldal felkerül a kiválasztott tárhelyre, és megoszthatóvá válik az ügyfeleiddel.",
  },
];

function HubayWorksPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-secondary text-foreground">
      <section className="relative px-6 pb-20 pt-8 md:px-10 md:pb-28 md:pt-12 lg:px-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 size-[30rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <Link to="/" className="inline-flex items-center gap-2 border-b border-primary/50 pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:border-primary">
            <ArrowLeft size={15} aria-hidden="true" /> Vissza a BioCare oldalára
          </Link>

          <div className="mt-16 grid items-center gap-12 md:mt-20 md:grid-cols-[1fr_0.75fr] md:gap-16">
            <div>
              <p className="eyebrow">Hubay Works · Weboldalkészítés</p>
              <h1 className="section-title mt-5 max-w-3xl">Egy jó weboldal <em>veled kezdődik.</em></h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                A Hubay Works az első elképzeléstől a kész, közzétett weboldalig kíséri a projektet. A cél egy olyan online megjelenés, ami rólad szól, könnyen használható, és minden képernyőn jól működik.
              </p>
              <a href="#folyamat" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">
                Így dolgozunk <ArrowDownRight size={16} aria-hidden="true" />
              </a>
            </div>

            <div className="relative mx-auto grid aspect-square w-full max-w-[340px] place-items-center rounded-[2rem] border border-white/80 bg-gradient-to-br from-white/90 via-white/65 to-primary/10 p-10 shadow-[0_30px_90px_rgb(46_69_45/0.12)]">
              <div aria-hidden="true" className="absolute inset-3 rounded-[1.5rem] border border-primary/15" />
              <img src={hubayWorksLogo} alt="Hubay Works logó" className="relative w-full max-w-[255px] object-contain drop-shadow-sm" />
              <span className="absolute -bottom-4 right-5 rounded-full border border-primary/15 bg-secondary px-4 py-2 text-xs font-medium tracking-wide text-primary">Ötlettől a megjelenésig</span>
            </div>
          </div>
        </div>
      </section>

      <section id="folyamat" className="scroll-mt-10 bg-background px-6 py-20 md:px-10 md:py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eyebrow">Átlátható közös munka</p>
            <h2 className="mt-4 font-display text-4xl font-medium leading-tight sm:text-5xl">Lépésről lépésre, <em>érthetően.</em></h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground md:text-base">Nem kell kész tervvel érkezned. Elég, ha elmondod, mire van szükséged; a folyamatot közösen alakítjuk ki.</p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step.number} className={`relative min-h-[250px] rounded-2xl border border-primary/10 p-6 ${index % 2 === 0 ? "bg-primary/[0.07]" : "bg-secondary"}`}>
                <span className="font-display text-sm italic text-primary/70">{step.number}</span>
                <h3 className="mt-8 font-display text-2xl font-medium leading-snug">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{step.description}</p>
                <Check size={17} className="absolute right-6 top-6 text-primary/55" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-3xl border border-white/80 bg-gradient-to-r from-primary/[0.09] via-background to-secondary p-8 md:flex-row md:items-center md:p-12">
          <div className="flex items-center gap-5">
            <img src={hubayWorksLogo} alt="Hubay Works" className="size-16 shrink-0 rounded-xl bg-white/80 p-1.5 object-contain" />
            <div>
              <p className="eyebrow">Egy példa a gyakorlatból</p>
              <h2 className="mt-2 font-display text-2xl font-medium sm:text-3xl">A BioCare Kozmetika weboldala</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">A jelenlegi oldal is egy közösen formált projekt: a tartalom, a megjelenés és a működés együtt állt össze.</p>
            </div>
          </div>
          <Link to="/" className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-primary/30 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">Megnézem a weboldalt</Link>
        </div>
      </section>

      <footer className="border-t border-primary/10 px-6 py-7 text-center text-xs text-muted-foreground md:px-10">
        <Link to="/" className="underline decoration-primary/30 underline-offset-4 hover:text-primary">Vissza a BioCare Kozmetikához</Link>
      </footer>
    </main>
  );
}
