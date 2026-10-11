import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Download,
  Facebook,
  Flower2,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Music2,
  Phone,
  RotateCw,
  X,
} from "lucide-react";
import logo from "@/assets/biocare-logo-cropped.png";
import salonPhoto from "@/assets/biocare-reference-salon.jpg";
import productPhoto from "@/assets/biocare-reference-products.jpg";
import giftCardPreview from "@/assets/biocare-gift-card-preview.jpg";
import giftCardBackPreview from "@/assets/biocare-gift-card-back.svg";
import passPreview from "@/assets/biocare-pass-preview.jpg";
import passBackPreview from "@/assets/biocare-pass-back.svg";
import ownerPhoto from "@/assets/bioker-portrait.jpg";
import priceListPdf from "@/assets/kozmetikai-arlista-uj-arak.pdf";
import {
  featuredPrices,
  gifts,
  ownerIntroduction,
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

function ScrollReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function BookingLink({ children, className }: { children: ReactNode; className: string }) {
  return <a href={site.phoneHref} className={className}>{children}</a>;
}

function NewOfferingsSection() {
  const [selectedCard, setSelectedCard] = useState<"gift" | "pass" | null>(null);
  const [flippedCard, setFlippedCard] = useState<"gift" | "pass" | null>(null);
  const cardDesigns = [
    { id: "gift" as const, image: giftCardPreview, backImage: giftCardBackPreview, title: "Ajándékkártya", alt: "BioCare ajándékkártya", position: "left-[5%] top-[18%] rotate-[-8deg]" },
    { id: "pass" as const, image: passPreview, backImage: passBackPreview, title: "Arckezelési bérlet", alt: "BioCare arckezelési bérlet", position: "right-[5%] top-[11%] rotate-[7deg]" },
  ];

  return (
    <section id="uj-kinalat" className="scroll-mt-32 overflow-hidden bg-primary/[0.045] px-5 pb-14 pt-7 md:px-8 md:pb-16 md:pt-9">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Egy kis figyelmesség</p>
          <h2 className="mt-2 font-display text-3xl font-medium sm:text-4xl">Ajándékozz egy kis énidőt.</h2>
          <div className="relative mx-auto mt-5 aspect-[1.5/1] w-full max-w-[620px]" aria-label="Ajándékkártya és arckezelési bérlet" role="group">
            {cardDesigns.map((card) => {
              const isSelected = selectedCard === card.id;
              const isFlipped = flippedCard === card.id;
              return (
                <div key={card.id} className={`absolute ${card.position} w-[52%] overflow-visible rounded-md transition-all duration-500 ease-out ${isSelected ? "z-30 scale-[1.22] opacity-95 shadow-2xl shadow-foreground/25" : "z-0 opacity-75 shadow-xl shadow-foreground/15 hover:opacity-100"}`}>
                  <button type="button" onClick={() => { setSelectedCard(card.id); setFlippedCard(null); }} aria-pressed={isSelected} aria-label={`${card.title} kiemelése`} className="block w-full overflow-hidden rounded-md bg-[#f3f0e8] p-1.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary md:p-2">
                    <img src={isFlipped ? card.backImage : card.image} alt={card.alt} loading="lazy" className="aspect-[1.45/1] w-full object-cover" />
                  </button>
                  {isSelected && (
                    <button type="button" onClick={() => setFlippedCard(isFlipped ? null : card.id)} aria-label={isFlipped ? `${card.title} előoldalának megjelenítése` : `${card.title} megfordítása`} className="absolute -bottom-3 -right-3 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-background/90 px-3 py-2 text-xs font-semibold text-primary shadow-md backdrop-blur-sm transition hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                      <RotateCw size={14} aria-hidden="true" /> Megfordítom
                    </button>
                  )}
                </div>
              );
            })}
            <a href={site.instagram} target="_blank" rel="noreferrer" className="absolute bottom-[5%] left-1/2 z-10 flex w-max max-w-[88%] -translate-x-1/2 items-center gap-2.5 rounded-full border border-white/75 bg-[#f8f6ed]/80 px-4 py-3 text-left shadow-xl shadow-foreground/15 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-[#f8f6ed]/95 sm:gap-3 sm:px-6 sm:py-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Instagram size={17} aria-hidden="true" /></span>
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/75 sm:text-[11px]">Friss hírek és ajánlatok</span>
                <span className="mt-0.5 block font-display text-base font-medium leading-tight text-foreground sm:text-lg">Kövessétek a promóciókat!</span>
              </span>
              <ArrowUpRight size={16} className="ml-1 shrink-0 text-primary" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Koppints az ajándékkártyára vagy a bérletre a nagyításhoz, majd a kis nyíl mutatja a hátoldalát.</p>
          <p className="mx-auto mt-3 max-w-xl font-display text-lg leading-7 text-foreground/80 sm:text-xl">Ajándékkártyák, kezelési bérletek és BIOLA kedvencek — egy apró meglepetés, sok-sok törődéssel.</p>
          <a href="#ajandekozas" className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-primary underline decoration-primary/35 underline-offset-4 transition hover:decoration-primary">Megnézem a lehetőségeket <ArrowUpRight size={15} aria-hidden="true" /></a>
        </ScrollReveal>
      </div>
    </section>
  );
}

function SiteHeader({ hideDuringPortrait }: { hideDuringPortrait: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
    <aside aria-label="Aktuális ajánlat" className="fixed inset-x-0 top-0 z-50 flex h-9 items-center justify-center bg-primary px-4 text-center text-xs font-semibold tracking-wide text-primary-foreground sm:text-sm">
      Új vendégeinknek 15% kedvezmény
    </aside>
    <header className={`fixed inset-x-0 top-11 z-40 px-5 transition-[opacity,transform] duration-500 ease-out md:px-8 ${hideDuringPortrait ? "pointer-events-none -translate-y-8 opacity-0" : "translate-y-0 opacity-100"}`} inert={hideDuringPortrait}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/55 px-4 text-foreground shadow-lg shadow-foreground/10 backdrop-blur-md md:h-[72px] md:rounded-full md:px-7">
        <a href="#top" aria-label="BioCare Kozmetika – főoldal" className="shrink-0">
          <img src={logo} alt="BioCare Kozmetika" className="h-12 w-32 object-contain md:h-14 md:w-40" />
        </a>
        <nav className="hidden flex-1 items-center justify-center gap-4 md:flex lg:gap-7" aria-label="Fő navigáció">
          {navigation.map((item) => <a key={item.href} href={item.href} className="text-sm font-semibold text-foreground transition-colors hover:text-primary">{item.label}</a>)}
        </nav>
        <BookingLink className="hidden min-h-11 items-center gap-2 rounded-full bg-[#A8B98A] px-4 py-2 text-xs font-semibold text-[#26351C] transition-colors hover:bg-[#9EAF80] md:inline-flex md:text-sm">
          Időpontot egyeztetek <ArrowUpRight size={15} aria-hidden="true" />
        </BookingLink>
        <button
          type="button"
          aria-label={menuOpen ? "Menü bezárása" : "Menü megnyitása"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex size-11 items-center justify-center rounded-full border border-primary/25 text-primary md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" className="mt-2 rounded-2xl border border-white/70 bg-white/95 px-5 py-4 text-primary shadow-lg backdrop-blur-md md:hidden" aria-label="Mobil navigáció">
          <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-1">
            {navigation.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded px-3 py-3 text-sm font-medium hover:bg-secondary">{item.label}</a>)}
            <BookingLink className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#A8B98A] px-4 py-2 text-sm font-semibold text-[#26351C] hover:bg-[#9EAF80]">
              Időpontot egyeztetek <ArrowUpRight size={16} aria-hidden="true" />
            </BookingLink>
          </div>
        </nav>
      )}
    </header>
    </>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[66svh] scroll-mt-36 overflow-hidden bg-foreground md:min-h-[68svh]"
    >
      <img
        src={salonPhoto}
        alt="A BioCare Kozmetika bejárata a pécsi Jókai utcában"
        width={1536}
        height={2048}
        fetchPriority="high"
        className="absolute inset-x-0 -top-[12%] h-[112%] w-full origin-top scale-x-[1.1] scale-y-[1.2] object-cover object-[center_30%] brightness-120"
      />
      <div className="bg-hero-shade absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[66svh] max-w-7xl items-center px-5 py-16 md:min-h-[68svh] md:px-8 md:py-20">
        <div className="relative z-10 max-w-2xl -translate-y-12 md:-translate-y-20">
          <h1 className="font-display text-5xl font-medium leading-[0.98] text-hero-foreground drop-shadow-md sm:text-6xl lg:text-7xl">
            Természetes bőrápolás.
            <br />
            <em className="font-normal text-accent">Egy kis idő önmagadra.</em>
          </h1>
          <div className="mt-9 flex translate-x-5 translate-y-[calc(0.6875rem+9svh)] flex-wrap items-center gap-2 md:ml-[11.625rem] md:translate-y-[calc(1.6875rem+10.75svh)] md:gap-3 lg:ml-[12.625rem]">
            <a href="#arlista" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#F4EBDD]/25 bg-[#E8D8B8]/55 px-4 py-2 text-xs font-semibold text-[#405039] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-[#E8D8B8]/70 sm:gap-2 sm:px-5 sm:py-2 md:text-sm">
              Árlista <ArrowDownRight size={15} aria-hidden="true" />
            </a>
            <a
              href="#szolgaltatasok"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-hero-foreground/45 px-3 py-2 text-xs font-semibold text-hero-foreground transition-colors hover:bg-hero-foreground/10 sm:px-3 sm:py-2 md:text-sm"
            >
              Szolgáltatások <ArrowDownRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceSection() {
  const cardTones = ["bg-[#F1F4EC]", "bg-[#E7EEDF]", "bg-[#EEF2E7]", "bg-[#DFE8D5]"];

  return (
    <section id="szolgaltatasok" className="scroll-mt-36 bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-8 max-w-3xl">
          <p className="eyebrow">Szolgáltatások Dominikától</p>
        </ScrollReveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {serviceGroups.map((service, index) => (
            <ScrollReveal key={service.number} delay={index * 70}>
            <article className={`flex h-full flex-col rounded-2xl border border-primary/10 ${cardTones[index % cardTones.length]} p-6 shadow-sm shadow-primary/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10`}>
              <div className="flex items-start justify-between gap-5"><span className="flex size-10 items-center justify-center rounded-full bg-accent/55 font-display text-xl text-primary">{service.number}</span><Flower2 className="mt-1 text-primary/60" size={21} strokeWidth={1.5} aria-hidden="true" /></div>
              <h3 className="mt-4 font-display text-[1.8rem] font-medium leading-[1.08] tracking-[-0.02em]">{service.title}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-primary/90">{service.description}</p>
              <details className="group mt-4 border-t border-primary/15 pt-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-primary marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span>Bővebben</span>
                  <ChevronDown size={16} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-3 pb-1 pt-3 text-sm leading-6 text-muted-foreground">
                  <p>{service.details}</p>
                  <p className="border-l-2 border-accent pl-3 text-foreground/80">{service.services}</p>
                </div>
              </details>
              <a href={`#${service.priceSectionId}`} className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
                Megnézem az árakat <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OwnerIntroductionSection({ compactMenuEnabled }: { compactMenuEnabled: boolean }) {
  return (
    <section id="bemutatkozas" className="scroll-mt-36 bg-secondary/45 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <ScrollReveal className="mx-auto w-full max-w-md">
          <div id="bemutatkozas-foto" className="group/photo relative overflow-hidden rounded-md">
            <img
              src={ownerPhoto}
              alt={`${site.practitioner}, a BioCare Kozmetika kozmetikusa`}
              width={912}
              height={1152}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
            <div className={`pointer-events-none absolute inset-x-4 bottom-4 translate-y-3 opacity-0 transition-all duration-500 ease-out ${compactMenuEnabled ? "group-hover/photo:pointer-events-auto group-hover/photo:translate-y-0 group-hover/photo:opacity-100 group-focus-within/photo:pointer-events-auto group-focus-within/photo:translate-y-0 group-focus-within/photo:opacity-100" : ""}`}>
              <div className="rounded-2xl border border-white/65 bg-white/85 p-4 shadow-xl shadow-foreground/15 backdrop-blur-md sm:p-5">
                <img src={logo} alt="BioCare Kozmetika" className="h-12 w-36 object-contain" />
                <nav className="mt-3 flex flex-wrap gap-2" aria-label="Gyors navigáció">
                  <a href="#szolgaltatasok" className="inline-flex min-h-10 items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Szolgáltatások</a>
                  <a href="#arlista" className="inline-flex min-h-10 items-center rounded-full border border-primary/25 bg-background/80 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-background">Árlista</a>
                </nav>
              </div>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal className="max-w-xl">
          <p className="eyebrow">{ownerIntroduction.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight sm:text-5xl">
            {ownerIntroduction.title}
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
            {ownerIntroduction.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {ownerIntroduction.signature && (
            <p className="mt-6 font-display text-2xl italic text-primary">
              {ownerIntroduction.signature}
            </p>
          )}
          <p className="mt-1 text-sm font-medium text-foreground">{site.practitioner}</p>
          <nav className="mt-7 flex flex-wrap items-center gap-3" aria-label="Közösségi oldalak">
            <a href={site.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">
              <Facebook size={17} aria-hidden="true" /> Facebook
            </a>
            <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">
              <Instagram size={17} aria-hidden="true" /> Instagram
            </a>
            <a href={site.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10">
              <Music2 size={17} aria-hidden="true" /> TikTok
            </a>
          </nav>
          <ScrollReveal className="relative z-20 mt-7 mb-[-3.75rem] max-w-xl md:mb-[-4rem]">
            <div className="rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-lg shadow-primary/10 backdrop-blur-sm before:absolute before:-top-2 before:left-8 before:size-4 before:rotate-45 before:border-l before:border-t before:border-primary/20 before:bg-card/95 sm:p-5">
            <p className="font-display text-xl font-medium text-foreground">Szia, Dominika vagyok!</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Jelenleg személyesen én fogadlak, és ezekkel a kezelésekkel tudok segíteni. Hosszabb távon szeretném a BioCare-t csapattal is bővíteni.
            </p>
            </div>
          </ScrollReveal>
        </ScrollReveal>
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
    <section id="arlista" className="scroll-mt-36 bg-secondary/70 px-5 pb-20 pt-12 md:px-8 md:pb-28 md:pt-16">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Árlista</p>
            <h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Áraink.</h2>
          </div>
        </ScrollReveal>
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          {featuredPrices.map((price, index) => (
            <ScrollReveal key={price.id} delay={index * 80}>
            <article className="rounded-md border border-primary/15 bg-background p-5 sm:p-6">
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
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal>
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
                    className="scroll-mt-36 border-t border-primary/25 pt-5"
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
        </ScrollReveal>
      </div>
    </section>
  );
}

type GiftRequest = (typeof gifts)[number];

function GiftRequestWizard({ gift, onClose }: { gift: GiftRequest; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    name: "",
    replyEmail: "",
    phone: "",
    occasions: "",
    amount: "",
    recipient: "",
    service: "",
    dedication: "",
    details: "",
  });
  const [error, setError] = useState("");
  const update = (key: string, value: string) => setAnswers((current) => ({ ...current, [key]: value }));
  const inputClass = "min-h-11 rounded-md border border-border bg-background px-3 font-normal";
  const steps = ["Az igény részletei", "Kapcsolattartás", "Ellenőrzés"];

  const continueToNextStep = () => {
    if (step === 0 && gift.id === "arckezelesi-berlet" && !answers.occasions) {
      setError("Válaszd ki, hány alkalmas bérletet szeretnél.");
      return;
    }
    if (step === 0 && gift.id === "ajandekkartya" && (!answers.amount.trim() || !answers.recipient.trim())) {
      setError("Add meg az ajándékkártya értékét és a címzett nevét.");
      return;
    }
    if (step === 0 && gift.id === "kezelesi-utalvany" && (!answers.service || !answers.recipient.trim() || !answers.dedication.trim())) {
      setError("Válaszd ki a kezelést, add meg a címzett nevét és írd meg az utalványra szánt üzenetet.");
      return;
    }
    if (step === 1) {
      if (!answers.name.trim()) {
        setError("Írd be a nevedet a folytatáshoz.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(answers.replyEmail.trim())) {
        setError("Adj meg egy érvényes e-mail-címet.");
        return;
      }
      if (answers.phone.replace(/\D/g, "").length < 8) {
        setError("Adj meg egy érvényes telefonszámot a folytatáshoz.");
        return;
      }
    }
    if (step === 2 && !answers.details.trim()) {
      setError("Írj egy rövid üzenetet vagy kérést a folytatáshoz.");
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, 2));
  };

  const openEmailDraft = () => {
    if (!answers.details.trim()) {
      setError("Írj egy rövid üzenetet vagy kérést, mielőtt megnyitod az e-mailt.");
      return;
    }
    setError("");
    const details: string[] = [];
    if (gift.id === "arckezelesi-berlet" && answers.occasions) details.push(`Bérlet: ${answers.occasions}`);
    if (gift.id === "ajandekkartya" && answers.amount.trim()) details.push(`Ajándékkártya értéke: ${answers.amount.trim()}`);
    if (answers.recipient.trim()) details.push(`Ajándék címzettje: ${answers.recipient.trim()}`);
    if (gift.id === "kezelesi-utalvany") details.push(`Kezelés: ${answers.service || "Még egyeztetni szeretném"}`);
    if (gift.id === "kezelesi-utalvany" && answers.dedication.trim()) details.push(`Rövid üzenet az utalványra: ${answers.dedication.trim()}`);
    if (answers.phone.trim()) details.push(`Telefonszám: ${answers.phone.trim()}`);
    if (answers.details.trim()) details.push(`További kérés: ${answers.details.trim()}`);

    const emailBody = [
      "Szia Dominika!",
      "",
      gift.requestPrompt,
      ...details,
      `Név: ${answers.name.trim()}`,
      `Válaszcím: ${answers.replyEmail.trim()}`,
      "",
      "Köszönöm!",
    ].join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(gift.subject)}&body=${encodeURIComponent(emailBody)}`;
  };

  return (
    <div id={`gift-request-${gift.id}`} className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.035] p-5">
      <div className="mb-5">
        <div className="flex items-center justify-between gap-4 text-xs font-semibold text-primary"><span>{steps[step]}</span><span>{step + 1} / 3</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      </div>

      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {gift.id === "arckezelesi-berlet" && <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Hány alkalmas bérletet szeretnél?<select required value={answers.occasions} onChange={(event) => update("occasions", event.target.value)} className={inputClass}><option value="">Válassz alkalomszámot</option><option value="1 alkalmas">1 alkalmas</option><option value="2 alkalmas">2 alkalmas</option><option value="3 alkalmas">3 alkalmas</option><option value="5 alkalmas">5 alkalmas</option></select></label>}
          {gift.id === "ajandekkartya" && <>
            <label className="grid gap-1.5 text-sm font-medium">Milyen értékű legyen?<input required value={answers.amount} onChange={(event) => update("amount", event.target.value)} placeholder="Például: 15 000 Ft" className={inputClass} /></label>
            <label className="grid gap-1.5 text-sm font-medium">Kinek szánod?<input required value={answers.recipient} onChange={(event) => update("recipient", event.target.value)} className={inputClass} /></label>
          </>}
          {gift.id === "kezelesi-utalvany" && <>
            <label className="grid gap-1.5 text-sm font-medium">Melyik kezelésre szóljon?<select required value={answers.service} onChange={(event) => update("service", event.target.value)} className={inputClass}><option value="">Válassz kezelést vagy segítséget</option><option value="Még egyeztetni szeretném">Még nem tudom, kérek segítséget</option>{serviceGroups.map((group) => <option key={group.number} value={group.title}>{group.title}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm font-medium">Kinek szánod?<input required value={answers.recipient} onChange={(event) => update("recipient", event.target.value)} className={inputClass} /></label>
            <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Rövid üzenet az utalványra<textarea required rows={2} value={answers.dedication} onChange={(event) => update("dedication", event.target.value)} className="rounded-md border border-border bg-background px-3 py-2 font-normal" /></label>
          </>}
        </div>
      )}

      {step === 1 && <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">Neved<input required autoComplete="name" value={answers.name} onChange={(event) => update("name", event.target.value)} className={inputClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium">E-mail-címed<input required type="email" autoComplete="email" value={answers.replyEmail} onChange={(event) => update("replyEmail", event.target.value)} className={inputClass} /></label>
        <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">Telefonszámod<input required type="tel" autoComplete="tel" value={answers.phone} onChange={(event) => update("phone", event.target.value)} className={inputClass} /></label>
      </div>}

      {step === 2 && <div className="space-y-4">
        <div className="rounded-lg bg-background p-4 text-sm leading-6">
          <p className="font-semibold text-foreground">Ezt fogjuk beleírni az e-mailbe:</p>
          <p className="mt-2">{gift.requestPrompt}</p>
          {gift.id === "arckezelesi-berlet" && answers.occasions && <p>Bérlet: {answers.occasions}</p>}
          {gift.id === "ajandekkartya" && answers.amount && <p>Érték: {answers.amount}</p>}
          {gift.id === "kezelesi-utalvany" && <p>Kezelés: {answers.service || "Még egyeztetni szeretném"}</p>}
          {answers.recipient && <p>Címzett: {answers.recipient}</p>}
          {gift.id === "kezelesi-utalvany" && answers.dedication && <p>Utalványra szánt üzenet: {answers.dedication}</p>}
          {answers.details && <p>További kérés: {answers.details}</p>}
          <p className="mt-2">Név: {answers.name} · E-mail: {answers.replyEmail}{answers.phone ? ` · Telefon: ${answers.phone}` : ""}</p>
        </div>
        <label className="grid gap-1.5 text-sm font-medium">Üzenet Dominikának<textarea required rows={3} value={answers.details} onChange={(event) => update("details", event.target.value)} className="rounded-md border border-border bg-background px-3 py-2 font-normal" /></label>
      </div>}

      {error && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{error}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {step > 0 && <button type="button" onClick={() => { setError(""); setStep((current) => current - 1); }} className="min-h-11 rounded-full border border-border px-4 text-sm font-semibold">Vissza</button>}
        {step < 2 ? <button type="button" onClick={continueToNextStep} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">Tovább <ArrowUpRight size={14} aria-hidden="true" /></button> : <button type="button" onClick={openEmailDraft} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"><Mail size={15} aria-hidden="true" /> E-mail küldése <ArrowUpRight size={14} aria-hidden="true" /></button>}
        <button type="button" onClick={onClose} className="min-h-11 px-2 text-sm text-muted-foreground underline underline-offset-4">Mégse</button>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Az utolsó lépés megnyitja az e-mailt a saját levelezőalkalmazásodban. Küldés előtt még ellenőrizheted.</p>
    </div>
  );
}

function GiftsSection() {
  const [activeGiftId, setActiveGiftId] = useState<string | null>(null);

  return (
    <section id="ajandekozas" className="scroll-mt-36 bg-background px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-11 max-w-2xl"><p className="eyebrow">Ajándékozás</p><h2 className="mt-3 font-display text-4xl font-medium sm:text-5xl">Egy kis figyelmesség, személyesen.</h2></ScrollReveal>
        <div className="grid items-start gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="divide-y divide-primary/15 border-y border-primary/15">
            {gifts.map((gift) => {
              const isFormOpen = activeGiftId === gift.id;
              return (
                <ScrollReveal key={gift.id} className="border-b border-primary/15 last:border-b-0">
                <article id={gift.id} className="py-6 first:pt-7 last:pb-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">{gift.eyebrow}</p>
                  <h3 className="mt-2 font-display text-3xl font-medium">{gift.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{gift.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <button type="button" aria-expanded={isFormOpen} aria-controls={`gift-request-${gift.id}`} onClick={() => setActiveGiftId(isFormOpen ? null : gift.id)} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">{gift.cta} <ArrowUpRight size={15} aria-hidden="true" /></button>
                  </div>
                  {isFormOpen && <GiftRequestWizard gift={gift} onClose={() => setActiveGiftId(null)} />}
                </article>
                </ScrollReveal>
              );
            })}
          </div>
          <ScrollReveal><figure className="relative">
            <img src={productPhoto} alt="BIOLA kozmetikum a BioCare szalonban" width={1200} height={1600} loading="lazy" className="aspect-[4/5] w-full rounded-md object-cover" />
          </figure></ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="kapcsolat" className="scroll-mt-36 bg-primary px-5 py-20 text-primary-foreground md:px-8 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <ScrollReveal>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/75">Kapcsolat</p>
          <h2 className="mt-4 flex flex-wrap items-center gap-3 font-display text-4xl font-medium leading-tight sm:text-5xl">Várlak szeretettel! <Heart size={25} className="shrink-0 text-primary-foreground/90" aria-hidden="true" /></h2>
          <p className="mt-4 text-sm leading-7 text-primary-foreground/85">{site.practitioner} · {site.appointmentNote}</p>
          <address className="mt-8 space-y-4 not-italic text-sm">
            <p className="flex items-center gap-3"><MapPin size={18} aria-hidden="true" /> {site.address}</p>
            <a className="flex w-fit items-center gap-3 underline underline-offset-4" href={site.phoneHref}><Phone size={18} aria-hidden="true" /> {site.phone}</a>
            <a className="flex w-fit items-center gap-3 underline underline-offset-4" href={`mailto:${site.email}`}><Mail size={18} aria-hidden="true" /> {site.email}</a>
          </address>
        </div>
        </ScrollReveal>
        <ScrollReveal>
        <div className="flex flex-col gap-4 border-t border-primary-foreground/30 pt-6 lg:items-end lg:border-l lg:border-t-0 lg:pt-0 lg:pl-10">
          <p className="max-w-lg text-sm leading-7 text-primary-foreground/85 lg:text-right">Időpont-egyeztetéshez és az ajándékozási lehetőségekkel kapcsolatos kérdéseidhez keress telefonon vagy e-mailben.</p>
          <div className="flex flex-wrap gap-3">
            <BookingLink className="inline-flex min-h-12 items-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-primary hover:bg-background/90"><Phone size={16} aria-hidden="true" /> Időpontot egyeztetek</BookingLink>
            <a href={`mailto:${site.email}`} className="inline-flex min-h-12 items-center gap-2 rounded-md border border-primary-foreground/55 px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"><Mail size={16} aria-hidden="true" /> E-mail írása</a>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function HomePage() {
  const [portraitInView, setPortraitInView] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);

  useEffect(() => {
    const portrait = document.querySelector("#bemutatkozas-foto");
    if (!portrait) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPortraitInView(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(portrait);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!portraitInView) {
      setScrollingDown(false);
      return;
    }

    let previousY = window.scrollY;
    let latestY = previousY;
    let animationFrame = 0;

    const updateDirection = () => {
      animationFrame = 0;
      const delta = latestY - previousY;
      if (Math.abs(delta) < 8) return;

      previousY = latestY;
      const nextDirection = delta > 0;
      setScrollingDown((currentDirection) => currentDirection === nextDirection ? currentDirection : nextDirection);
    };

    const handleScroll = () => {
      latestY = window.scrollY;
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateDirection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [portraitInView]);

  const compactMenuEnabled = portraitInView && scrollingDown;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader hideDuringPortrait={compactMenuEnabled} />
      <main><Hero /><NewOfferingsSection /><OwnerIntroductionSection compactMenuEnabled={compactMenuEnabled} /><ServiceSection /><PriceList /><GiftsSection /><ContactSection /></main>
      <footer className="bg-foreground px-5 py-7 text-background md:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 text-xs md:grid-cols-[1fr_auto_1fr] md:items-center">
          <p className="text-center md:text-left">Minden jog fenntartva © 2026 BioCare Kozmetika · {site.practitioner}</p>
          <p className="text-center text-background/75">Készítette: <span className="font-semibold text-background">Hubay Works</span></p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 md:justify-end" aria-label="Jogi információk">
            <Link to="/adatvedelem" className="underline underline-offset-4 hover:text-accent">Adatvédelem</Link>
            <Link to="/impresszum" className="underline underline-offset-4 hover:text-accent">Impresszum</Link>
            <a href="#top" className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-accent">Vissza a tetejére <ArrowUpRight size={13} aria-hidden="true" /></a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
