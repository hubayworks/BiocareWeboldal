import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Instagram, Facebook, Music2, Leaf, Menu, X, Sparkles, Check, Mail, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site-data";
import logo from "@/assets/biocare-logo-cropped.png";
import heroVideo from "@/assets/Kozmetika_Dominika_2025_Final_2.mp4";
import priceList from "@/assets/BioCare Kozmetika Pécs - Árlista.pdf";
import portrait from "@/assets/Kozmetika Fotók /AA527B39-11B9-418B-85E3-DEC22885424D.jpg";
import { galleryPhotos } from "@/lib/gallery-assets";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "BioCare Kozmetika | Személyre szabott szépségápolás Pécsen" },
    { name: "description", content: "BioCare Kozmetika Pécsen: személyre szabott arckezelések, természetes szépségápolás és énidő Szidónikával. Fedezd fel a kezeléseket!" },
    { property: "og:title", content: "BioCare Kozmetika | Személyre szabott szépségápolás Pécsen" },
    { property: "og:description", content: "A bőröd megérdemli a figyelmet. Természetes szépségápolás és feltöltődés Pécsen." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Home,
});

const nav = [
  { label: "Kezelések", id: "kezelesek" }, { label: "Árak", id: "arak" },
  { label: "Rólam", id: "rolam" }, { label: "Galéria", id: "galeria" },
  { label: "Vélemények", id: "velemenyek" },
];
const gallery = galleryPhotos;

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [priceListOpen, setPriceListOpen] = useState(false);
  const [promotionRulesOpen, setPromotionRulesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [featuredStart, setFeaturedStart] = useState(0);
  const [formStatus, setFormStatus] = useState("");
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroDurationRef = useRef(0);
  const heroScrollProgressRef = useRef(0);
  useEffect(() => {
    if (activePhoto === null && !priceListOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setActivePhoto(null); setPriceListOpen(false); }
      if (activePhoto !== null && e.key === "ArrowRight") setActivePhoto((v) => v === null ? 0 : (v + 1) % gallery.length);
      if (activePhoto !== null && e.key === "ArrowLeft") setActivePhoto((v) => v === null ? 0 : (v - 1 + gallery.length) % gallery.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [activePhoto, priceListOpen]);
  useEffect(() => {
    const timer = window.setInterval(() => setActiveReview((v) => (v + 1) % site.testimonials.length), 6500);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setFeaturedStart((current) => (current + 4) % galleryPhotos.length), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const featuredGallery = Array.from({ length: Math.min(4, galleryPhotos.length) }, (_, index) => galleryPhotos[(featuredStart + index) % galleryPhotos.length]);
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    const updateDuration = () => { heroDurationRef.current = video.duration; };
    const updateVideoFromScroll = () => {
      const heroSection = video.closest(".hero");
      if (!heroSection || !heroDurationRef.current) return;
      const scrollDistance = Math.max(1, heroSection.clientHeight - window.innerHeight);
      heroScrollProgressRef.current = Math.min(1, Math.max(0, -heroSection.getBoundingClientRect().top / scrollDistance));
      video.currentTime = heroScrollProgressRef.current * heroDurationRef.current;
    };
    video.addEventListener("loadedmetadata", updateDuration);
    window.addEventListener("scroll", updateVideoFromScroll, { passive: true });
    window.addEventListener("resize", updateVideoFromScroll);
    updateVideoFromScroll();
    return () => {
      video.removeEventListener("loadedmetadata", updateDuration);
      window.removeEventListener("scroll", updateVideoFromScroll);
      window.removeEventListener("resize", updateVideoFromScroll);
    };
  }, []);
  async function submitRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const message = `Időpontkérés – ${site.name}\nNév: ${data.get("name")}\nE-mail: ${data.get("email")}\nTelefon: ${data.get("phone") || "Nincs megadva"}\nÉrdeklődés: ${data.get("service")}\nÜzenet: ${data.get("message") || "Nincs megadva"}`;
    if (site.email) {
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent("Időpontkérés – BioCare Kozmetika")}&body=${encodeURIComponent(message)}`;
      setFormStatus("Megnyitottuk a leveleződet. Az üzenet elküldéséhez ott kell jóváhagynod a küldést.");
    } else {
      try { await navigator.clipboard.writeText(message); setFormStatus("Az időpontkérés szövegét kimásoltuk. A foglalási elérhetőség még nincs megadva, ezért az üzenet nem lett elküldve."); }
      catch { setFormStatus("A foglalási elérhetőség még nincs megadva, ezért az üzenet nem lett elküldve."); }
    }
  }
  return <div className="overflow-x-hidden bg-background text-foreground">
    <header className="absolute inset-x-0 top-0 z-30 border-b border-hero-foreground/20 bg-transparent text-hero-foreground">
      <div className="relative mx-auto flex h-20 max-w-[1440px] items-center justify-center gap-6 px-6 md:px-10 lg:px-16">
        <nav className="hidden items-center gap-2 text-[12px] font-semibold lg:flex" aria-label="Fő navigáció">{nav.map(item => <a key={item.id} href={`#${item.id}`} className="px-3 py-2 transition-colors hover:bg-hero-foreground/15 hover:text-hero-foreground">{item.label}</a>)}</nav>
        <a href="#kapcsolat" className="absolute right-6 hidden items-center gap-2 border border-hero-foreground bg-hero-foreground px-4 py-2 text-[12px] font-semibold text-primary transition-colors hover:bg-hero-foreground/85 md:inline-flex lg:right-16">Időpontot szeretnék <ArrowUpRight size={15}/></a>
        <Button variant="ghost" size="icon" className="absolute right-6 text-hero-foreground hover:bg-hero-foreground/15 hover:text-hero-foreground md:right-10 lg:hidden" aria-label={menuOpen ? "Menü bezárása" : "Menü megnyitása"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</Button>
      </div>
      {menuOpen && <nav className="absolute left-0 right-0 top-20 flex flex-col gap-1 border-t border-hero-foreground/20 bg-transparent px-6 py-5 text-hero-foreground shadow-xl lg:hidden" aria-label="Mobil navigáció">{[...nav, {label:"Kapcsolat",id:"kapcsolat"}].map(item => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)} className="py-2 text-sm">{item.label}</a>)}</nav>}
    </header>

    <main id="top">
      <section className="hero relative h-[115vh] overflow-hidden text-hero-foreground md:h-[125vh]" aria-label="BioCare Kozmetika">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <video ref={heroVideoRef} src={heroVideo} muted playsInline loop={false} preload="auto" aria-label="BioCare Kozmetika hangulatvideó" className="absolute inset-0 h-full w-full object-cover object-center"/>
          <div className="absolute inset-0 bg-hero-shade"/>
          <div className="relative mx-auto w-full max-w-[1440px] px-6 pb-16 pt-32 md:px-10 lg:px-16">
            <div className="max-w-[650px] animate-appear"><div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.25em]"><span className="h-px w-8 bg-hero-foreground/80"/> BioCare Kozmetika · Pécs</div>
              <h1 className="hero-title text-[clamp(3.8rem,7vw,7.4rem)] leading-[0.9]">A bőröd<br/>megérdemli<br/><em className="font-normal">a figyelmet.</em></h1>
              <p className="mt-7 max-w-[435px] text-base leading-7 text-hero-foreground/90 md:text-lg">Személyre szabott szépségápolás Pécsen, ahol a ragyogó bőr és a feltöltődés találkozik.</p>
              <div className="mt-9 flex flex-wrap items-center gap-5"><Button asChild size="lg" className="h-12 rounded-none bg-primary-foreground px-7 text-xs font-semibold uppercase tracking-[0.11em] text-primary hover:bg-primary-foreground/85"><a href="#kapcsolat">Időpontfoglalás <ArrowUpRight/></a></Button><a href="#kezelesek" className="inline-flex items-center gap-2 border-b border-hero-foreground pb-1 text-xs font-semibold uppercase tracking-[0.11em]">Kezelések megtekintése <ArrowRight size={16}/></a></div>
            </div>
          </div>
          <a href="#kezelesek" className="absolute bottom-7 left-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] md:left-10 lg:left-16">Fedezd fel <ArrowDown size={15}/></a>
          <div className="absolute bottom-7 right-6 hidden items-center gap-2 text-[11px] uppercase tracking-[0.15em] md:flex lg:right-16"><span className="size-1.5 rounded-full bg-hero-foreground"/> Természetes szépség, személyesen</div>
        </div>
      </section>

      <section className="border-b border-border bg-background px-6 py-12 md:px-10 lg:px-16"><div className="mx-auto grid max-w-[1312px] gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center md:gap-7"><p className="text-center font-display text-2xl md:text-left">Figyelem. Nyugalom. Te.</p><span className="hidden h-10 w-px bg-border md:block"/><p className="text-center text-sm leading-6 text-muted-foreground">Minden bőr egyedi. A gondoskodás is legyen az.</p><span className="hidden h-10 w-px bg-border md:block"/><div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] md:justify-end"><MapPin size={18} strokeWidth={1.5}/> {site.address ?? "Pécs, Magyarország"}</div></div></section>

      <section id="arak" className="scroll-mt-10 bg-secondary px-6 py-14 md:px-10 md:py-20 lg:px-16"><div className="mx-auto max-w-[1312px]"><div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="eyebrow">02 / Árak</p><h2 className="section-title mt-4">Kiemelt<br/><em>kezelések.</em></h2></div><div className="relative max-w-sm" onMouseEnter={() => setPromotionRulesOpen(true)} onMouseLeave={() => setPromotionRulesOpen(false)}><button type="button" onClick={() => setPromotionRulesOpen(value => !value)} onFocus={() => setPromotionRulesOpen(true)} className="bg-primary/10 px-2 py-1 text-left text-sm font-bold uppercase tracking-[0.12em] text-primary underline decoration-primary/35 underline-offset-4 transition-colors hover:bg-primary/15">Promóciós árak szabályzata</button>{promotionRulesOpen && <div role="dialog" aria-label="Promóciós árak szabályzata" className="absolute right-0 top-10 z-40 w-[min(90vw,480px)] border border-primary/20 bg-background p-5 text-left shadow-2xl md:p-6" onMouseEnter={() => setPromotionRulesOpen(true)}><div className="mb-4 flex items-start justify-between gap-4"><h3 className="font-display text-xl text-foreground">Promóciós árak szabályzata</h3><Button type="button" variant="ghost" size="icon" aria-label="Szabályzat bezárása" onClick={() => setPromotionRulesOpen(false)}><X/></Button></div><div className="space-y-3 text-sm leading-6 text-muted-foreground">{site.promotionRules.map(rule => <p key={rule}>{rule}</p>)}</div></div>}</div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{site.prices.map((item, index) => <article key={item.title} className={`relative flex min-h-[285px] flex-col justify-between border p-6 ${index === 0 ? "border-primary bg-primary text-primary-foreground" : "border-primary/20 bg-background/55"}`}>{item.badge && <span className="absolute right-5 top-5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground/70">{item.badge}</span>}<div><span className={`font-display text-2xl ${index === 0 ? "text-primary-foreground/50" : "text-primary/45"}`}>0{index + 1}</span>{item.detail && <p className={`mt-8 text-[10px] font-bold uppercase tracking-[0.16em] ${index === 0 ? "text-primary-foreground/65" : "text-muted-foreground"}`}>{item.detail}</p>}<h3 className="mt-3 font-display text-2xl leading-tight">{item.title}</h3><p className={`mt-4 text-sm leading-6 ${index === 0 ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{item.description}</p></div><div className="mt-6 flex flex-col items-start gap-1">{item.previousPrice ? <><span className="font-display text-3xl font-semibold">{item.price}</span><span className={`text-xs font-semibold uppercase tracking-[0.08em] ${index === 0 ? "text-primary-foreground/75" : "text-primary/75"}`}>{item.priceLabel ?? "Első alkalommal"}</span><span className={`mt-2 text-sm ${index === 0 ? "text-primary-foreground/65" : "text-muted-foreground"}`}>Teljes ár: {item.previousPrice}</span></> : <><span className="font-display text-3xl font-semibold">{item.price}</span>{item.priceLabel && <span className="text-xs font-semibold uppercase tracking-[0.08em] text-primary/75">{item.priceLabel}</span>}{item.priceOptions && <div className="mt-2 space-y-1 text-xs text-muted-foreground">{item.priceOptions.map(option => <p key={option}>{option}</p>)}</div>}</>}</div></article>)}</div><div className="mt-8 flex flex-col items-center"><div className="mb-3 flex items-center justify-center gap-3 text-primary/45" aria-hidden="true"><span className="h-px w-16 bg-primary/25"/><Sparkles size={15} strokeWidth={1.2}/><span className="h-px w-16 bg-primary/25"/></div><Button type="button" onClick={() => setPriceListOpen(true)} className="h-12 rounded-none bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">Árlista megtekintése <ArrowRight size={17}/></Button></div></div></section>

      <section id="rolam" className="scroll-mt-10 bg-background px-6 py-24 md:px-10 md:py-32 lg:px-16"><div className="mx-auto grid max-w-[1312px] items-center gap-14 lg:grid-cols-2 lg:gap-28"><div className="relative max-w-[570px]"><img src={portrait} alt="A BioCare Kozmetika szakembere természetes hangulatú szalonban" loading="lazy" width={912} height={1152} className="aspect-[4/5] w-full object-cover"/><div className="absolute -bottom-5 -right-3 bg-primary px-6 py-5 text-primary-foreground shadow-lg md:-right-7"><Leaf size={25} strokeWidth={1.2}/></div><p className="mt-8 text-xs text-muted-foreground">BioCare Kozmetika · Pécs</p></div><div><p className="eyebrow">03 / Rólam</p><h2 className="section-title mt-5">Szia,<br/><em>Dominika vagyok.</em></h2><div className="mt-8 h-px w-16 bg-primary/40"/>{aboutOpen && <div id="about-description" className="mt-8"><p className="max-w-[520px] font-hero-display text-base leading-8 text-muted-foreground">Várlak sok szeretettel Pécsett, a Jókai úti BioCare biokozmetikában.</p><p className="mt-5 max-w-[520px] font-hero-display text-base leading-8 text-muted-foreground">A BIOLA kozmetika termékei természetes alapanyagokból készülnek, hiszen mindenki számára fontos az arc és a test szépsége és egészsége, ezért használom én is előszeretettel a munkám során. Számomra nagyon fontos a külső megjelenés, amelyhez egy kiegyensúlyozott belső is társul. Ezt is biztosítani tudom számodra a kezelések során. Otthonos, csendes környezetben várlak a belváros szívében!</p></div>}<p className="mt-9 font-display text-3xl italic text-primary">Dominika</p><div className="mt-7 flex items-center gap-2"><a href={site.instagram ?? undefined} aria-label="Instagram" title="Instagram" className="flex size-10 items-center justify-center border border-primary/25 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"><Instagram size={18}/></a><a href={site.facebook ?? undefined} aria-label="Facebook" title="Facebook" className="flex size-10 items-center justify-center border border-primary/25 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"><Facebook size={18}/></a><a href={site.tiktok ?? undefined} aria-label="TikTok" title="TikTok" className="flex size-10 items-center justify-center border border-primary/25 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"><Music2 size={18}/></a></div><button type="button" aria-expanded={aboutOpen} aria-controls="about-description" onClick={() => setAboutOpen(value => !value)} className="mt-8 inline-flex items-center gap-2 border-b border-primary pb-1 text-xs font-semibold uppercase tracking-[0.1em]">{aboutOpen ? "Bezárás" : "Ismerjük meg egymást"} <ArrowUpRight size={16}/></button></div></div></section>

      <section id="galeria" className="scroll-mt-10 bg-secondary px-6 py-14 md:px-10 md:py-20 lg:px-16"><div className="mx-auto max-w-[1312px]"><div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="eyebrow">04 / Inspiráció</p><h2 className="section-title mt-5">A szépség<br/><em>apró pillanatai.</em></h2></div><p className="max-w-[335px] text-sm leading-7 text-muted-foreground">Négy pillanat a BioCare Kozmetika világából. A képek 30 másodpercenként frissülnek.</p></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{featuredGallery.map((photo) => <Button key={photo.src} variant="ghost" onClick={() => setActivePhoto(galleryPhotos.indexOf(photo))} aria-label={`${photo.alt} megnyitása`} className="group relative block h-auto w-full overflow-hidden rounded-none p-0 hover:bg-transparent"><img src={photo.src} alt={photo.alt} loading="lazy" width={photo.width} height={photo.height} className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-105"/><span className="absolute bottom-3 right-3 flex size-8 items-center justify-center bg-background/85 text-primary backdrop-blur-md"><ArrowUpRight size={15}/></span></Button>)}</div><div className="mt-6 flex justify-center"><Link to="/galeria" className="inline-flex items-center gap-2 border-b border-primary pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary">Galéria megtekintése <ArrowUpRight size={15}/></Link></div><p className="mt-5 text-center text-xs text-muted-foreground">A teljes fotógaléria megtekintéséhez nyisd meg a galériát.</p></div></section>

      <section id="velemenyek" className="scroll-mt-10 bg-background px-6 py-24 md:px-10 md:py-32 lg:px-16"><div className="mx-auto grid max-w-[1312px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24"><div><p className="eyebrow">05 / Visszajelzések</p><h2 className="section-title mt-5">Szavak, amik<br/><em>megmaradnak.</em></h2><p className="mt-6 text-sm text-muted-foreground">Az idézetek bemutató szövegek; valódi vendégvéleményekre várnak.</p></div><div className="flex min-h-[270px] flex-col justify-between border-l border-primary/30 pl-7 md:pl-12" aria-live="polite"><div key={activeReview} className="animate-appear"><span className="font-display text-6xl leading-none text-primary/40">“</span><blockquote className="-mt-2 font-display text-2xl leading-snug md:text-4xl">{site.testimonials[activeReview]?.quote}</blockquote><p className="mt-7 text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">{site.testimonials[activeReview]?.name}</p></div><div className="mt-10 flex items-center justify-between"><div className="flex gap-2">{site.testimonials.map((_, i) => <Button key={i} size="icon" variant="ghost" aria-label={`${i + 1}. vélemény`} onClick={() => setActiveReview(i)} className="size-7 rounded-none p-2 hover:bg-transparent"><span className={`block h-1 w-full ${i === activeReview ? "bg-primary" : "bg-border"}`}/></Button>)}</div><div className="flex gap-2"><Button size="icon" variant="outline" className="size-10 rounded-full" aria-label="Előző vélemény" onClick={() => setActiveReview((activeReview - 1 + site.testimonials.length) % site.testimonials.length)}><ChevronLeft size={18}/></Button><Button size="icon" variant="outline" className="size-10 rounded-full" aria-label="Következő vélemény" onClick={() => setActiveReview((activeReview + 1) % site.testimonials.length)}><ChevronRight size={18}/></Button></div></div></div></div></section>

      <section id="kapcsolat" className="scroll-mt-10 bg-primary px-6 py-24 text-primary-foreground md:px-10 md:py-32 lg:px-16"><div className="mx-auto grid max-w-[1312px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24"><div><p className="text-[11px] font-semibold uppercase tracking-[0.23em] text-primary-foreground/65">06 / Kapcsolat</p><h2 className="section-title mt-6">Készen állsz<br/>egy kis <em>énidőre?</em></h2><p className="mt-7 max-w-[425px] text-base leading-8 text-primary-foreground/75">Írj néhány sort, és kezdődjön a személyre szabott gondoskodás. Az aktuális lehetőségekről és árakról egyeztetünk.</p><div className="mt-12 space-y-5 text-sm">{site.address ? <p className="flex items-center gap-3"><MapPin size={18}/>{site.address}</p> : <p className="flex items-center gap-3"><MapPin size={18}/>Pécs, Magyarország</p>}{site.email && <a className="flex items-center gap-3" href={`mailto:${site.email}`}><Mail size={18}/>{site.email}</a>}{site.phone && <a className="flex items-center gap-3" href={`tel:${site.phone}`}><span>☎</span>{site.phone}</a>}</div></div><form onSubmit={submitRequest} className="grid gap-x-5 gap-y-6 border border-primary-foreground/25 bg-primary-foreground/5 p-6 backdrop-blur-md md:grid-cols-2 md:p-10"><label className="form-label">Neved *<input name="name" required autoComplete="name" placeholder="Hogy szólíthatlak?" className="form-input"/></label><label className="form-label">E-mail címed *<input name="email" required type="email" autoComplete="email" placeholder="pelda@email.hu" className="form-input"/></label><label className="form-label">Telefonszámod<input name="phone" type="tel" autoComplete="tel" placeholder="+36 ..." className="form-input"/></label><label className="form-label">Mi érdekel?<select name="service" className="form-input"><option value="Általános érdeklődés">Válassz kezelést</option>{site.services.map(service => <option key={service.number} value={service.title}>{service.title}</option>)}</select></label><label className="form-label md:col-span-2">Üzeneted<textarea name="message" rows={3} placeholder="Mesélj egy kicsit, miben segíthetek..." className="form-input resize-y"/></label><div className="md:col-span-2"><Button type="submit" size="lg" className="h-12 w-full rounded-none bg-primary-foreground text-xs font-bold uppercase tracking-[0.1em] text-primary hover:bg-primary-foreground/85 md:w-auto md:px-9">Időpontot szeretnék <ArrowUpRight/></Button><p className="mt-4 text-xs leading-5 text-primary-foreground/65">Az üzenet az e-mail alkalmazásodon keresztül küldhető el. Amíg nincs megadva fogadói cím, csak másolható.</p>{formStatus && <p role="status" className="mt-3 flex items-start gap-2 text-sm text-primary-foreground"><Check size={16} className="mt-0.5 shrink-0"/>{formStatus}</p>}</div></form></div></section>
    </main>
    <footer className="bg-footer px-6 py-16 text-footer-foreground md:px-10 lg:px-16"><div className="mx-auto max-w-[1312px]"><div className="grid gap-12 border-b border-footer-foreground/20 pb-14 md:grid-cols-[1.4fr_1fr_1fr]"><div><div className="flex items-center gap-3"><img src={logo} alt="BioCare Kozmetika" className="h-[76px] w-[172px] object-contain" /></div><p className="mt-6 max-w-[270px] text-sm leading-7 text-footer-foreground/65">Személyre szabott szépségápolás és egy kis énidő Pécsen.</p></div><div><p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em]">Fedezd fel</p><div className="flex flex-col items-start gap-3 text-sm text-footer-foreground/70">{nav.map(item => <a key={item.id} href={`#${item.id}`} className="hover:text-footer-foreground">{item.label}</a>)}</div></div><div><p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em]">Kapcsolat</p><p className="text-sm text-footer-foreground/70">{site.address}</p>{site.email && <a href={`mailto:${site.email}`} className="mt-3 block text-sm">{site.email}</a>}{site.phone && <a href={`tel:${site.phone}`} className="mt-3 block text-sm">{site.phone}</a>}{site.website && <a href={site.website} target="_blank" rel="noreferrer" className="mt-3 block text-sm">{site.website.replace(/^https?:\/\//, "")}</a>}<div className="mt-6 flex gap-4">{site.instagram && <a href={site.instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={19}/></a>}{site.facebook && <a href={site.facebook} aria-label="Facebook" target="_blank" rel="noreferrer"><Facebook size={19}/></a>}</div></div></div><div className="flex flex-col justify-between gap-5 pt-6 text-xs text-footer-foreground/55 md:flex-row"><p>© {new Date().getFullYear()} BioCare Kozmetika. Minden jog fenntartva.</p><div className="flex gap-6"><Link to="/adatvedelem" className="hover:text-footer-foreground">Adatvédelem</Link><Link to="/impresszum" className="hover:text-footer-foreground">Impresszum</Link><a href="#top" className="flex items-center gap-1 hover:text-footer-foreground">Vissza a tetejére <ArrowUpRight size={13}/></a></div></div></div></footer>
    {priceListOpen && <div role="dialog" aria-modal="true" aria-label="BioCare árlista előnézete" className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 md:p-8" onClick={() => setPriceListOpen(false)}><div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden bg-background shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3 md:px-6"><h2 className="font-display text-lg md:text-xl">BioCare árlista</h2><div className="flex items-center gap-2"><Button asChild variant="outline" className="rounded-none"><a href={priceList} download="BioCare-Kozmetika-Arlista.pdf"><Download size={16}/> Letöltés</a></Button><Button type="button" variant="ghost" size="icon" aria-label="Árlista előnézet bezárása" onClick={() => setPriceListOpen(false)}><X/></Button></div></div><iframe src={`${priceList}#zoom=page-width`} title="BioCare Kozmetika árlista" className="min-h-0 w-full flex-1 bg-white"/></div></div>}
    {activePhoto !== null && <div role="dialog" aria-modal="true" aria-label="Képgaléria" className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 md:p-12" onClick={() => setActivePhoto(null)}><Button variant="ghost" size="icon" aria-label="Bezárás" onClick={() => setActivePhoto(null)} className="absolute right-5 top-5 z-10 text-hero-foreground hover:bg-hero-foreground/20 hover:text-hero-foreground"><X/></Button><Button variant="ghost" size="icon" aria-label="Előző kép" onClick={e => {e.stopPropagation();setActivePhoto((activePhoto - 1 + gallery.length) % gallery.length);}} className="absolute left-3 z-10 text-hero-foreground hover:bg-hero-foreground/20 hover:text-hero-foreground md:left-8"><ChevronLeft/></Button><img onClick={e => e.stopPropagation()} src={gallery[activePhoto]?.src} alt={gallery[activePhoto]?.alt} className="max-h-[85vh] max-w-[82vw] object-contain"/><Button variant="ghost" size="icon" aria-label="Következő kép" onClick={e => {e.stopPropagation();setActivePhoto((activePhoto + 1) % gallery.length);}} className="absolute right-3 z-10 text-hero-foreground hover:bg-hero-foreground/20 hover:text-hero-foreground md:right-8"><ChevronRight/></Button><span className="absolute bottom-4 text-xs text-hero-foreground">{activePhoto + 1} / {gallery.length}</span></div>}
  </div>;
}
