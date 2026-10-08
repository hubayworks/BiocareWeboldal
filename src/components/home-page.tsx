import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Download,
  Flower2,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from "lucide-react";
import logo from "@/assets/biocare-logo-cropped.png";
import salonPhoto from "@/assets/biocare-reference-salon.jpg";
import productPhoto from "@/assets/biocare-reference-products.jpg";
import priceListPdf from "@/assets/kozmetikai-arlista-uj-arak.pdf";
import {
  featuredPrices,
  gifts,
  prices,
  priceCategories,
  serviceGroups,
  site,
  type PriceEntry,
} from "@/lib/site-data";

const navigation = [
  { label: "Szolgáltatások", href: "#szolgaltatasok" },
  { label: "Árlista", href: "#arlista" },
  { label: "Ajándékozás", href: "#ajandekozas" },
  { label: "Kapcsolat", href: "#kapcsolat" },
];

function formatPrice(amount: number) {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft`;
}

function BookingLink({ children, className }: { children: ReactNode; className: string }) {
  return <a href={site.phoneHref} className={className}>{children}</a>;
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" aria-label="BioCare Kozmetika – főoldal">
          <img src={logo} alt="BioCare Kozmetika" className="h-16 w-44 object-contain brightness-110 contrast-110" />
        </a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Fő navigáció">
          {navigation.map((item) => <a key={item.href} href={item.href} className="text-sm font-medium text-hero-foreground/90 transition-colors hover:text-hero-foreground">{item.label}</a>)}
        </nav>
        <BookingLink className="hidden items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex">
          Időpontot egyeztetek <ArrowUpRight size={16} aria-hidden="true" />
        </BookingLink>
        <button
          type="button"
          aria-label={menuOpen ? "Menü bezárása" : "Menü megnyitása"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex size-11 items-center justify-center rounded-md border border-hero-foreground/35 text-hero-foreground md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" className="border-t border-primary/15 bg-background px-5 py-4 md:hidden" aria-label="Mobil navigáció">
          <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-1">
            {navigation.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded px-3 py-3 text-sm font-medium hover:bg-secondary">{item.label}</a>)}
            <BookingLink className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              Időpontot egyeztetek <ArrowUpRight size={16} aria-hidden="true" />
            </BookingLink>
          </div>
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-svh scroll-mt-20 overflow-hidden bg-foreground"
    >
      <img
        src={salonPhoto}
        alt="A BioCare Kozmetika bejárata a pécsi Jókai utcában"
        width={1536}
        height={2048}
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover object-[center_24%]"
      />
      <div className="bg-hero-shade absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-svh max-w-7xl items-center px-5 py-16 md:px-8 md:py-20">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-hero-foreground/90">
            <Flower2 size={16} strokeWidth={1.7} aria-hidden="true" /> BioCare Kozmetika · Pécs
          </p>
          <h1 className="font-display text-5xl font-medium leading-[0.98] text-hero-foreground sm:text-6xl lg:text-7xl">
            Természetes bőrápolás.
            <br />
            <em className="font-normal text-accent">Egy kis idő önmagadra.</em>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-hero-foreground/90 md:text-lg md:leading-8">
            Személyre szabott arckezelések, gépi bőrápolás és kényeztető szolgáltatások a belváros szívében.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <BookingLink className="inline-flex min-h-12 items-center gap-3 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 hover:bg-accent/90">
              Időpontot egyeztetek <ArrowUpRight size={17} aria-hidden="true" />
            </BookingLink>
            <a
              href="#szolgaltatasok"
              className="inline-flex min-h-12 items-center gap-2 rounded-md border border-hero-foreground/45 px-4 py-3 text-sm font-semibold text-hero-foreground transition-colors hover:bg-hero-foreground/10"
            >
              Szolgáltatások <ArrowDownRight size={17} aria-hidden="true" />
            </a>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-hero-foreground/85">
            <MapPin size={16} aria-hidden="true" /> {site.address}
          </p>
        </div>
      </div>
    </section>
  );
}

function ServiceSection() {
  return (
    <section id="szolgaltatasok" className="scroll-mt-24 bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl"><p className="eyebrow">Szolgáltatások</p><h2 className="mt-3 font-display text-4xl font-medium leading-tight sm:text-5xl">Ápolás, a saját igényeidre hangolva.</h2></div>
        <div className="grid gap-5 md:grid-cols-2">
          {serviceGroups.map((service) => (
            <article key={service.number} className="flex min-h-[330px] flex-col rounded-md border border-primary/15 bg-white/55 p-6 md:p-8">
              <div className="flex items-start justify-between gap-5"><span className="font-display text-3xl text-primary/55">{service.number}</span><Flower2 className="mt-1 text-primary/60" size={21} strokeWidth={1.5} aria-hidden="true" /></div>
              <h3 className="mt-5 max-w-lg font-display text-3xl font-medium leading-tight">{service.title}</h3>
              <p className="mt-2 text-sm font-semibold text-primary">{service.description}</p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{service.details}</p>
              <p className="mt-4 border-l-2 border-accent pl-3 text-sm leading-6 text-foreground/80">{service.services}</p>
              <a href={`#${service.priceSectionId}`} className="mt-auto inline-flex w-fit items-center gap-2 pt-7 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
                Megnézem az árakat <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PriceRow({ price }: { price: PriceEntry }) {
  const isEmbedded = price.kind === "embedded";
  const isSurcharge = price.kind === "surcharge";
  const displayPrice = price.newListPrice;

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-primary/10 py-3.5 last:border-b-0 sm:gap-x-5">
      <span className="min-w-0 text-sm leading-6 text-foreground">{price.name}</span>
      <div className="row-span-2 text-right">
        <p className="whitespace-nowrap text-sm font-bold text-primary sm:text-base">
          {isSurcharge ? "+" : ""}{formatPrice(displayPrice)}
        </p>
      </div>
      <span className="text-[11px] font-semibold text-muted-foreground">
        {isEmbedded ? (
          `Kezelésbe építve: ${price.includedPrice === null ? "—" : `+${formatPrice(price.includedPrice ?? 0)}`}`
        ) : isSurcharge ? (
          "Kiegészítő felár"
        ) : null}
      </span>
    </li>
  );
}

function PriceList() {
  return (
    <section id="arlista" className="scroll-mt-24 bg-secondary/70 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Árlista</p>
            <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Áraink.</h2>
          </div>
        </div>
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          {featuredPrices.map((price) => (
            <article key={price.id} className="rounded-md border border-primary/15 bg-background p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">
                Kiemelt szolgáltatás
              </p>
              <h3 className="mt-3 min-h-12 font-display text-2xl font-medium leading-tight">
                {price.name}
              </h3>
              <p className="mt-5 text-2xl font-semibold text-primary">
                {formatPrice(price.newListPrice)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Kezelés ára</p>
            </article>
          ))}
        </div>
        <details id="teljes-arlista" className="group">
          <summary
            className="mx-auto flex min-h-12 w-fit cursor-pointer list-none items-center justify-center gap-3 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 [&::-webkit-details-marker]:hidden"
          >
            Teljes árlista megtekintése
            <ChevronDown className="transition-transform group-open:rotate-180" size={18} aria-hidden="true" />
          </summary>
          <div className="mt-6">
            <a
              href={priceListPdf}
              download="BioCare_kozmetikai_arlista.pdf"
              className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/25 bg-background px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              <Download size={16} aria-hidden="true" /> Árlista letöltése PDF-ben
            </a>
            <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
              {priceCategories.map((category) => {
                const categoryPrices = prices.filter((price) => price.categoryId === category.id);
                return (
                  <section
                    key={category.id}
                    id={`prices-${category.id}`}
                    className="scroll-mt-28 border-t border-primary/25 pt-5"
                    aria-labelledby={`heading-${category.id}`}
                  >
                    <h3 id={`heading-${category.id}`} className="font-display text-2xl font-semibold">
                      {category.title}
                    </h3>
                    <ul className="mt-3">
                      {categoryPrices.map((price) => (
                        <PriceRow key={price.id} price={price} />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}

function GiftsSection() {
  const pdfs = {
    "arckezelesi-berlet": { label: "Arckezelési bérlet nyomtatási PDF", href: "/BioCare_berlet_nyomdai.pdf" },
    ajandekkartya: { label: "Ajándékkártya nyomtatási PDF", href: "/BioCare_ajandekkartya_nyomdai.pdf" },
    "kezelesi-utalvany": { label: "Kezelési utalvány nyomtatási PDF", href: "/BioCare_utalvany_nyomdai.pdf" },
  };

  return (
    <section id="ajandekozas" className="scroll-mt-24 bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-11 max-w-2xl"><p className="eyebrow">Ajándékozás</p><h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Egy kis figyelmesség, személyesen.</h2></div>
        <div className="grid items-start gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="divide-y divide-primary/15 border-y border-primary/15">
            {gifts.map((gift) => {
              const pdf = pdfs[gift.id as keyof typeof pdfs];
              return (
                <article key={gift.id} id={gift.id} className="py-6 first:pt-7 last:pb-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">{gift.eyebrow}</p>
                  <h3 className="mt-2 font-display text-3xl font-medium">{gift.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{gift.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <a href={`mailto:${site.email}?subject=${encodeURIComponent(gift.subject)}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">{gift.cta} <ArrowUpRight size={15} aria-hidden="true" /></a>
                    <a href={pdf.href} download className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-foreground/75 underline decoration-foreground/30 underline-offset-4 hover:text-primary">{pdf.label} <ArrowUpRight size={14} aria-hidden="true" /></a>
                  </div>
                </article>
              );
            })}
          </div>
          <figure className="relative">
            <img src={productPhoto} alt="BIOLA kozmetikum a BioCare szalonban" width={1200} height={1600} loading="lazy" className="aspect-[4/5] w-full rounded-md object-cover" />
            <figcaption className="mt-3 text-xs text-muted-foreground">BIOLA kozmetikum a BioCare szalonban</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="kapcsolat" className="scroll-mt-20 bg-primary px-5 py-20 text-primary-foreground md:px-8 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/75">Kapcsolat</p>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight sm:text-5xl">Várlak szeretettel!</h2>
          <p className="mt-4 text-sm leading-7 text-primary-foreground/85">{site.practitioner} · {site.appointmentNote}</p>
          <address className="mt-8 space-y-4 not-italic text-sm">
            <p className="flex items-center gap-3"><MapPin size={18} aria-hidden="true" /> {site.address}</p>
            <a className="flex w-fit items-center gap-3 underline underline-offset-4" href={site.phoneHref}><Phone size={18} aria-hidden="true" /> {site.phone}</a>
            <a className="flex w-fit items-center gap-3 underline underline-offset-4" href={`mailto:${site.email}`}><Mail size={18} aria-hidden="true" /> {site.email}</a>
          </address>
        </div>
        <div className="flex flex-col gap-4 border-t border-primary-foreground/30 pt-6 lg:items-end lg:border-l lg:border-t-0 lg:pt-0 lg:pl-10">
          <p className="max-w-lg text-sm leading-7 text-primary-foreground/85 lg:text-right">Időpont-egyeztetéshez és az ajándékozási lehetőségekkel kapcsolatos kérdéseidhez keress telefonon vagy e-mailben.</p>
          <div className="flex flex-wrap gap-3">
            <BookingLink className="inline-flex min-h-12 items-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-primary hover:bg-background/90"><Phone size={16} aria-hidden="true" /> Időpontot egyeztetek</BookingLink>
            <a href={`mailto:${site.email}`} className="inline-flex min-h-12 items-center gap-2 rounded-md border border-primary-foreground/55 px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"><Mail size={16} aria-hidden="true" /> E-mail írása</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <main><Hero /><ServiceSection /><PriceList /><GiftsSection /><ContactSection /></main>
      <footer className="bg-foreground px-5 py-7 text-background md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BioCare Kozmetika · {site.practitioner}</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Jogi információk">
            <Link to="/adatvedelem" className="underline underline-offset-4 hover:text-accent">Adatvédelem</Link>
            <Link to="/impresszum" className="underline underline-offset-4 hover:text-accent">Impresszum</Link>
            <a href="#top" className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-accent">Vissza a tetejére <ArrowUpRight size={13} aria-hidden="true" /></a>
          </nav>
        </div>
      </footer>
    </div>
  );
}