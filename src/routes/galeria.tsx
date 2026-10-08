import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { galleryPhotos } from "@/lib/gallery-assets";

const photos = galleryPhotos;

export const Route = createFileRoute("/galeria")({
  head: () => ({ meta: [{ title: "Galéria | BioCare Kozmetika Pécs" }] }),
  component: GalleryPage,
});

function GalleryPage() {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);

  useEffect(() => {
    if (activePhoto === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePhoto(null);
      if (event.key === "ArrowRight") setActivePhoto((value) => value === null ? 0 : (value + 1) % photos.length);
      if (event.key === "ArrowLeft") setActivePhoto((value) => value === null ? 0 : (value - 1 + photos.length) % photos.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [activePhoto]);

  return <main className="min-h-screen bg-secondary px-6 py-12 text-foreground md:px-10 md:py-20 lg:px-16">
    <div className="mx-auto max-w-[1312px]">
      <Link to="/" className="inline-flex items-center gap-2 border-b border-primary pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary"><ArrowLeft size={15}/> Vissza a főoldalra</Link>
      <div className="mt-16 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">Galéria</p><h1 className="section-title mt-5">A szépség<br/><em>valódi pillanatai.</em></h1></div><p className="max-w-sm text-sm leading-7 text-muted-foreground">A BioCare Kozmetika tere, hangulata és mindennapjai Pécsen.</p></div>
      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">{photos.map((photo, index) => <Button key={photo.src} variant="ghost" onClick={() => setActivePhoto(index)} aria-label={`${index + 1}. galériafotó megnyitása`} className="group relative block h-auto w-full overflow-hidden rounded-none p-0 hover:bg-transparent"><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"/><span className="absolute bottom-3 right-3 flex size-8 items-center justify-center bg-background/85 text-primary"><span className="text-lg">↗</span></span></Button>)}</div>
    </div>
    {activePhoto !== null && <div role="dialog" aria-modal="true" aria-label="Teljes képgaléria" className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 md:p-12" onClick={() => setActivePhoto(null)}><Button variant="ghost" size="icon" aria-label="Bezárás" onClick={() => setActivePhoto(null)} className="absolute right-5 top-5 z-10 text-hero-foreground"><X/></Button><Button variant="ghost" size="icon" aria-label="Előző kép" onClick={(event) => { event.stopPropagation(); setActivePhoto((activePhoto - 1 + photos.length) % photos.length); }} className="absolute left-3 z-10 text-hero-foreground md:left-8"><ChevronLeft/></Button><img onClick={(event) => event.stopPropagation()} src={photos[activePhoto]?.src} alt={photos[activePhoto]?.alt} className="max-h-[85vh] max-w-[88vw] object-contain"/><Button variant="ghost" size="icon" aria-label="Következő kép" onClick={(event) => { event.stopPropagation(); setActivePhoto((activePhoto + 1) % photos.length); }} className="absolute right-3 z-10 text-hero-foreground md:right-8"><ChevronRight/></Button><span className="absolute bottom-4 text-xs text-hero-foreground">{activePhoto + 1} / {photos.length}</span></div>}
  </main>;
}
