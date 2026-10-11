import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, ClipboardList, Mail } from "lucide-react";
import { site } from "@/lib/site-data";

export const Route = createFileRoute("/kerdoivek")({
  head: () => ({ meta: [{ title: "Kérdőívek | BioCare Kozmetika" }] }),
  component: QuestionnairesPage,
});

const areas = ["Hónalj", "Lábszár", "Teljes láb", "Bikinivonal", "Kar", "Arc", "Más terület"];
const infoTopics = ["Hogyan működik", "Várható eredmények", "Kezelések gyakorisága", "Árak", "Előkészületek és utóápolás"];

function QuestionnairesPage() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [method, setMethod] = useState("");
  const [motivation, setMotivation] = useState("");
  const [timeline, setTimeline] = useState("");
  const [selectedInfo, setSelectedInfo] = useState<string[]>([]);
  const [otherThoughts, setOtherThoughts] = useState("");
  const [result, setResult] = useState(false);
  const [error, setError] = useState("");

  const toggle = (value: string, current: string[], setValues: (next: string[]) => void) => {
    setValues(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAreas.length) {
      setError("Válassz legalább egy területet, ami érdekel.");
      return;
    }
    setError("");
    setResult(true);
  };

  const points = selectedAreas.length + (timeline === "soon" ? 2 : timeline === "later" ? 1 : 0);
  const level = points >= 5 ? "Erős érdeklődés" : points >= 3 ? "Érdemi érdeklődés" : "Tájékozódó érdeklődés";
  const summary = [
    "Lézeres szőrtelenítés – érdeklődési kérdőív",
    `Érdeklődési szint: ${level}`,
    `Érdekelt területek: ${selectedAreas.join(", ")}`,
    `Jelenlegi módszer: ${method}`,
    `Fő motiváció: ${motivation}`,
    `Tervezett időzítés: ${timeline === "soon" ? "1–3 hónapon belül" : timeline === "later" ? "Később, néhány hónapon belül" : "Egyelőre csak tájékozódom"}`,
    `Amiről szívesen olvasna: ${selectedInfo.join(", ") || "Nem jelölt meg témát"}`,
    `Egyéb megjegyzés: ${otherThoughts.trim() || "Nincs"}`,
  ].join("\n");
  const emailHref = `mailto:${site.email}?subject=${encodeURIComponent("Lézeres szőrtelenítés – kérdőív")}&body=${encodeURIComponent(`Szia Dominika!\n\nKitöltöttem a lézeres szőrtelenítés iránti érdeklődési kérdőívet.\n\n${summary}\n\nKöszönöm!`)}`;

  return (
    <main className="min-h-screen bg-background px-5 py-8 pb-28 text-foreground sm:px-8 sm:py-12 md:pb-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} aria-hidden="true" /> Vissza a BioCare-hoz</Link>
        <header className="mt-8 rounded-[1.75rem] bg-primary/[0.07] p-6 sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary"><ClipboardList size={15} aria-hidden="true" /> BioCare · vendégkérdőív</span>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight sm:text-5xl">Érdekelne a lézeres szőrtelenítés?</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Pár válasszal segíthetsz felmérni, milyen területek és információk érdeklik leginkább a vendégeket. A kitöltés után összefoglalót kapsz, amit e-mailben elküldhetsz a BioCare-nek.</p>
        </header>

        {result ? (
          <section className="mt-6 rounded-[1.75rem] border border-primary/15 bg-white/80 p-6 shadow-lg shadow-primary/5 sm:p-8" aria-live="polite">
            <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary"><Check size={22} aria-hidden="true" /></span>
            <p className="eyebrow mt-5">Köszönjük a válaszaidat</p>
            <h2 className="mt-2 font-display text-3xl font-medium">{level}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Ez az összesítés kizárólag az érdeklődésedet mutatja, nem egészségügyi vagy kezelési alkalmassági értékelés. A lézeres kezelés lehetőségéről és biztonságáról személyes konzultáción, képzett szakemberrel érdemes egyeztetni.</p>
            <div className="mt-5 rounded-2xl bg-secondary/70 p-4 text-sm leading-6">
              <p><strong>Érdekelt területek:</strong> {selectedAreas.join(", ")}</p>
              <p className="mt-1"><strong>Elsősorban ez érdekel:</strong> {selectedInfo.join(", ") || "általános tájékoztatás"}</p>
            </div>
            <a href={emailHref} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"><Mail size={17} aria-hidden="true" /> Válaszok megosztása e-mailben <ArrowUpRight size={16} aria-hidden="true" /></a>
            <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Az e-mail a saját leveleződben nyílik meg; a küldést te erősíted meg.</p>
            <button type="button" onClick={() => setResult(false)} className="mt-4 min-h-10 w-full text-sm font-semibold text-primary underline underline-offset-4">Válaszaim módosítása</button>
          </section>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-5">
            <fieldset className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 sm:p-7">
              <legend className="px-1 font-display text-2xl">1. Mely területek érdekelnek?</legend>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">Jelölj meg egyet vagy többet.</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {areas.map((area) => <label key={area} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-secondary/60 px-3 text-sm"><input type="checkbox" checked={selectedAreas.includes(area)} onChange={() => toggle(area, selectedAreas, setSelectedAreas)} className="size-4 accent-primary" />{area}</label>)}
              </div>
            </fieldset>

            <fieldset className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 sm:p-7">
              <legend className="px-1 font-display text-2xl">2. Most hogyan távolítod el a szőrt?</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {["Borotválás", "Gyantázás vagy epilálás", "Krém", "Változó módszer", "Jelenleg nem távolítom el"].map((item) => <label key={item} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-secondary/60 px-3 text-sm"><input required type="radio" name="method" value={item} checked={method === item} onChange={() => setMethod(item)} className="size-4 accent-primary" />{item}</label>)}
              </div>
            </fieldset>

            <fieldset className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 sm:p-7">
              <legend className="px-1 font-display text-2xl">3. Miért fontolgatod?</legend>
              <div className="mt-3 grid gap-2">
                {["Tartósabb megoldást keresek", "Kevesebb mindennapi teendőt szeretnék", "Bőrirritáció vagy benőtt szőrszálak miatt érdekel", "Csak kíváncsi vagyok a lehetőségekre"].map((item) => <label key={item} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-secondary/60 px-3 text-sm"><input required type="radio" name="motivation" value={item} checked={motivation === item} onChange={() => setMotivation(item)} className="size-4 accent-primary" />{item}</label>)}
              </div>
            </fieldset>

            <fieldset className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 sm:p-7">
              <legend className="px-1 font-display text-2xl">4. Mikor vágnál bele, ha számodra megfelelő lenne?</legend>
              <div className="mt-3 grid gap-2">
                {[{ value: "soon", label: "1–3 hónapon belül" }, { value: "later", label: "Néhány hónap múlva" }, { value: "explore", label: "Egyelőre csak tájékozódom" }].map((item) => <label key={item.value} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-secondary/60 px-3 text-sm"><input required type="radio" name="timeline" value={item.value} checked={timeline === item.value} onChange={() => setTimeline(item.value)} className="size-4 accent-primary" />{item.label}</label>)}
              </div>
            </fieldset>

            <fieldset className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 sm:p-7">
              <legend className="px-1 font-display text-2xl">5. Milyen információ segítene dönteni?</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {infoTopics.map((topic) => <label key={topic} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-secondary/60 px-3 text-sm"><input type="checkbox" checked={selectedInfo.includes(topic)} onChange={() => toggle(topic, selectedInfo, setSelectedInfo)} className="size-4 accent-primary" />{topic}</label>)}
              </div>
            </fieldset>

            <label className="grid gap-2 rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 text-sm font-semibold sm:p-7">Van még ötleted vagy kérdésed? <span className="font-normal text-muted-foreground">Ne írj egészségügyi vagy más érzékeny adatot.</span>
              <textarea value={otherThoughts} onChange={(event) => setOtherThoughts(event.target.value)} maxLength={500} rows={3} className="resize-y rounded-2xl border border-primary/15 bg-background px-4 py-3 font-normal leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Opcionális megjegyzés" />
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">Kérdőív kiértékelése <ArrowUpRight size={16} aria-hidden="true" /></button>
          </form>
        )}
        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">A kérdőív érdeklődést mér fel, nem diagnózis és nem állapít meg kezelési alkalmasságot.</p>
      </div>
    </main>
  );
}
