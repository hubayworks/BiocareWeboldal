import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, ClipboardList, Mail, Star } from "lucide-react";

export const Route = createFileRoute("/kerdoivek")({
  head: () => ({ meta: [{ title: "Kérdőívek | BioCare Kozmetika" }] }),
  component: QuestionnairesPage,
});

const recipient = "biocarekozm@gmail.com";
const areas = ["Hónalj", "Lábszár", "Teljes láb", "Bikinivonal", "Kar", "Arc", "Más terület"];
const infoTopics = ["Hogyan működik", "Várható eredmények", "Kezelések gyakorisága", "Árak", "Előkészületek és utóápolás"];
const cardClass = "rounded-[1.5rem] border border-primary/10 bg-white/80 p-5 sm:p-7";
const optionClass = "flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-secondary/60 px-3 text-sm";

function QuestionnairesPage() {
  const [active, setActive] = useState<"laser" | "salon" | null>(null);

  return (
    <main className="min-h-screen bg-background px-5 py-8 pb-28 text-foreground sm:px-8 sm:py-12 md:pb-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} aria-hidden="true" /> Vissza a BioCare-hoz</Link>
        <header className="mt-8 rounded-[1.75rem] bg-primary/[0.07] p-6 sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-primary"><ClipboardList size={15} aria-hidden="true" /> BioCare · vendégkérdőívek</span>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight sm:text-5xl">Mondd el, mire vagy kíváncsi</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Válaszd ki a neked megfelelő kérdőívet. A válaszaid külön e-mail-tervezetbe kerülnek, amelyet a saját leveleződben tudsz elküldeni.</p>
        </header>

        {!active ? (
          <section className="mt-6 grid gap-4" aria-label="Kérdőív kiválasztása">
            <button type="button" onClick={() => setActive("laser")} className="group rounded-[1.5rem] border border-primary/15 bg-white/85 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-7">
              <span className="eyebrow">Érdeklődési kérdőív</span>
              <h2 className="mt-2 font-display text-2xl font-medium">Lézeres szőrtelenítés</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Milyen területek és információk érdekelnek? Pár válasszal segíthetsz a BioCare-nek felmérni az igényeket.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Kérdőív megnyitása <ArrowUpRight size={16} aria-hidden="true" /></span>
            </button>
            <button type="button" onClick={() => setActive("salon")} className="group rounded-[1.5rem] border border-primary/15 bg-white/85 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-7">
              <span className="eyebrow">Vendég-visszajelzés</span>
              <h2 className="mt-2 font-display text-2xl font-medium">Vélemény a szalonról</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Oszd meg, milyen volt a szolgáltatás, a szalon hangulata és az árak megítélése.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Kérdőív megnyitása <ArrowUpRight size={16} aria-hidden="true" /></span>
            </button>
          </section>
        ) : (
          <>
            <button type="button" onClick={() => setActive(null)} className="mt-6 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={15} aria-hidden="true" /> Vissza a kérdőívekhez</button>
            {active === "laser" ? <LaserSurvey /> : <SalonSurvey />}
          </>
        )}
      </div>
    </main>
  );
}

function EmailResult({ subject, body, title, description, onEdit }: { subject: string; body: string; title: string; description: string; onEdit: () => void }) {
  const href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return (
    <section className="mt-4 rounded-[1.75rem] border border-primary/15 bg-white/80 p-6 shadow-lg shadow-primary/5 sm:p-8" aria-live="polite">
      <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary"><Check size={22} aria-hidden="true" /></span>
      <p className="eyebrow mt-5">Köszönjük a válaszaidat</p>
      <h2 className="mt-2 font-display text-3xl font-medium">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      <a href={href} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"><Mail size={17} aria-hidden="true" /> Válaszok elküldése e-mailben <ArrowUpRight size={16} aria-hidden="true" /></a>
      <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">A leveleződ egy előre kitöltött üzenetet nyit meg a BioCare címére; a küldést ott kell megerősítened.</p>
      <button type="button" onClick={onEdit} className="mt-4 min-h-10 w-full text-sm font-semibold text-primary underline underline-offset-4">Válaszaim módosítása</button>
    </section>
  );
}

function LaserSurvey() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [method, setMethod] = useState("");
  const [motivation, setMotivation] = useState("");
  const [timeline, setTimeline] = useState("");
  const [selectedInfo, setSelectedInfo] = useState<string[]>([]);
  const [otherThoughts, setOtherThoughts] = useState("");
  const [result, setResult] = useState(false);
  const [error, setError] = useState("");
  const toggle = (value: string, current: string[], setValues: (next: string[]) => void) => setValues(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const points = selectedAreas.length + (timeline === "soon" ? 2 : timeline === "later" ? 1 : 0);
  const level = points >= 5 ? "Erős érdeklődés" : points >= 3 ? "Érdemi érdeklődés" : "Tájékozódó érdeklődés";
  const summary = [
    "Lézeres szőrtelenítés – érdeklődési kérdőív", `Érdeklődési szint: ${level}`,
    `Érdekelt területek: ${selectedAreas.join(", ")}`, `Jelenlegi módszer: ${method}`,
    `Fő motiváció: ${motivation}`, `Tervezett időzítés: ${timeline === "soon" ? "1–3 hónapon belül" : timeline === "later" ? "Később, néhány hónapon belül" : "Egyelőre csak tájékozódom"}`,
    `Amiről szívesen olvasna: ${selectedInfo.join(", ") || "Nem jelölt meg témát"}`, `Egyéb megjegyzés: ${otherThoughts.trim() || "Nincs"}`,
  ].join("\n");

  if (result) return <EmailResult subject="Lézeres szőrtelenítés – kérdőív" body={`Szia Dominika!\n\nKitöltöttem a lézeres szőrtelenítés iránti érdeklődési kérdőívet.\n\n${summary}\n\nKöszönöm!`} title={level} description="Ez az összesítés kizárólag az érdeklődést mutatja, nem egészségügyi vagy kezelési alkalmassági értékelés. A lézeres kezelés lehetőségéről és biztonságáról személyes konzultáción, képzett szakemberrel érdemes egyeztetni." onEdit={() => setResult(false)} />;

  return (
    <form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!selectedAreas.length) { setError("Válassz legalább egy területet, ami érdekel."); return; } setError(""); setResult(true); }} className="mt-4 space-y-5">
      <fieldset className={cardClass}><legend className="px-1 font-display text-2xl">1. Mely területek érdekelnek?</legend><p className="mb-4 mt-1 text-sm text-muted-foreground">Jelölj meg egyet vagy többet.</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{areas.map((area) => <label key={area} className={optionClass}><input type="checkbox" checked={selectedAreas.includes(area)} onChange={() => toggle(area, selectedAreas, setSelectedAreas)} className="size-4 accent-primary" />{area}</label>)}</div></fieldset>
      <RadioGroup title="2. Most hogyan távolítod el a szőrt?" name="method" value={method} onChange={setMethod} options={["Borotválás", "Gyantázás vagy epilálás", "Krém", "Változó módszer", "Jelenleg nem távolítom el"]} />
      <RadioGroup title="3. Miért fontolgatod?" name="motivation" value={motivation} onChange={setMotivation} options={["Tartósabb megoldást keresek", "Kevesebb mindennapi teendőt szeretnék", "Bőrirritáció vagy benőtt szőrszálak miatt érdekel", "Csak kíváncsi vagyok a lehetőségekre"]} />
      <fieldset className={cardClass}><legend className="px-1 font-display text-2xl">4. Mikor vágnál bele, ha számodra megfelelő lenne?</legend><div className="mt-3 grid gap-2">{[{ value: "soon", label: "1–3 hónapon belül" }, { value: "later", label: "Néhány hónap múlva" }, { value: "explore", label: "Egyelőre csak tájékozódom" }].map((item) => <label key={item.value} className={optionClass}><input required type="radio" name="timeline" value={item.value} checked={timeline === item.value} onChange={() => setTimeline(item.value)} className="size-4 accent-primary" />{item.label}</label>)}</div></fieldset>
      <fieldset className={cardClass}><legend className="px-1 font-display text-2xl">5. Milyen információ segítene dönteni?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{infoTopics.map((topic) => <label key={topic} className={optionClass}><input type="checkbox" checked={selectedInfo.includes(topic)} onChange={() => toggle(topic, selectedInfo, setSelectedInfo)} className="size-4 accent-primary" />{topic}</label>)}</div></fieldset>
      <label className={`grid gap-2 ${cardClass} text-sm font-semibold`}>Van még ötleted vagy kérdésed? <span className="font-normal text-muted-foreground">Ne írj egészségügyi vagy más érzékeny adatot.</span><textarea value={otherThoughts} onChange={(event) => setOtherThoughts(event.target.value)} maxLength={500} rows={3} className="resize-y rounded-2xl border border-primary/15 bg-background px-4 py-3 font-normal leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Opcionális megjegyzés" /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">Kérdőív kiértékelése <ArrowUpRight size={16} aria-hidden="true" /></button>
      <p className="text-center text-xs leading-5 text-muted-foreground">A kérdőív érdeklődést mér fel, nem diagnózis és nem állapít meg kezelési alkalmasságot.</p>
    </form>
  );
}

function RadioGroup({ title, name, value, onChange, options }: { title: string; name: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <fieldset className={cardClass}><legend className="px-1 font-display text-2xl">{title}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{options.map((option) => <label key={option} className={optionClass}><input required type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} className="size-4 accent-primary" />{option}</label>)}</div></fieldset>;
}

function SalonSurvey() {
  const [service, setService] = useState("");
  const [serviceRating, setServiceRating] = useState("");
  const [atmosphere, setAtmosphere] = useState("");
  const [priceValue, setPriceValue] = useState("");
  const [recommend, setRecommend] = useState("");
  const [comment, setComment] = useState("");
  const [result, setResult] = useState(false);

  const summary = [
    "BioCare szalon – általános vendégkérdőív",
    `Igénybe vett szolgáltatás: ${service}`,
    `Szolgáltatással való elégedettség: ${serviceRating}/5`,
    `Szalon hangulata: ${atmosphere}`,
    `Árak megítélése: ${priceValue}`,
    `Ajánlaná-e a szalont: ${recommend}`,
    `További megjegyzés: ${comment.trim() || "Nem adott meg megjegyzést"}`,
  ].join("\n");

  if (result) return <EmailResult subject="BioCare – általános vendég-visszajelzés" body={`Szia Dominika!\n\nKitöltöttem a BioCare szalon általános kérdőívét.\n\n${summary}\n\nKöszönöm!`} title="Köszönjük, hogy megosztottad!" description="Az összesítés külön e-mail-tervezetben nyílik meg, hogy elküldhesd a BioCare-nek." onEdit={() => setResult(false)} />;

  return (
    <form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setResult(true); }} className="mt-4 space-y-5">
      <fieldset className={cardClass}><legend className="px-1 font-display text-2xl">Melyik szolgáltatást vetted igénybe?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{["Arckezelés", "Gépi bőrápolás", "Szemöldök vagy szempilla", "Egyéb szolgáltatás"].map((option) => <label key={option} className={optionClass}><input required type="radio" name="salon-service" value={option} checked={service === option} onChange={() => setService(option)} className="size-4 accent-primary" />{option}</label>)}</div></fieldset>
      <fieldset className={cardClass}><legend className="px-1 font-display text-2xl">Mennyire voltál elégedett a szolgáltatással?</legend><div className="mt-4 flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map((rating) => <label key={rating} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm ${serviceRating === String(rating) ? "bg-primary text-primary-foreground" : "bg-secondary/60"}`}><input required className="sr-only" type="radio" name="service-rating" value={rating} checked={serviceRating === String(rating)} onChange={() => setServiceRating(String(rating))} /><Star size={15} aria-hidden="true" />{rating}</label>)}</div><p className="mt-2 text-xs text-muted-foreground">1 = egyáltalán nem, 5 = nagyon elégedett</p></fieldset>
      <RadioGroup title="Milyennek találtad a szalon hangulatát?" name="atmosphere" value={atmosphere} onChange={setAtmosphere} options={["Nagyon kellemes", "Kellemes", "Semleges", "Lehetne jobb"]} />
      <RadioGroup title="Hogyan ítéled meg az árakat?" name="price-value" value={priceValue} onChange={setPriceValue} options={["Kifejezetten kedvezőek", "Megfelelőek a szolgáltatáshoz", "Kicsit magasak", "Magasnak érzem őket"]} />
      <RadioGroup title="Ajánlanád a BioCare-t másnak?" name="recommend" value={recommend} onChange={setRecommend} options={["Igen, biztosan", "Valószínűleg igen", "Még nem tudom", "Valószínűleg nem"]} />
      <label className={`grid gap-2 ${cardClass} text-sm font-semibold`}>Mit szerettél a legjobban, vagy min változtatnál? <span className="font-normal text-muted-foreground">Ne írj egészségügyi vagy más érzékeny adatot.</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} rows={4} className="resize-y rounded-2xl border border-primary/15 bg-background px-4 py-3 font-normal leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Opcionális megjegyzés" /></label>
      <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">Válaszok összesítése <ArrowUpRight size={16} aria-hidden="true" /></button>
    </form>
  );
}
