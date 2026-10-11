import { useEffect, useState } from "react";
import { Check, Download, Share, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function MobileInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

    if ((!isIosDevice && !isAndroid) || !isMobileViewport || isStandalone) return;
    setIos(isIosDevice);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    const timer = window.setTimeout(() => setVisible(true), 650);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) {
      setShowInstructions(true);
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === "accepted") dismiss();
    else setShowInstructions(true);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/35 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-[3px] sm:items-center" role="presentation">
      <section aria-labelledby="install-prompt-title" aria-modal="true" role="dialog" className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/70 bg-background/95 p-5 text-foreground shadow-2xl shadow-foreground/20 backdrop-blur-xl sm:p-6">
        <button type="button" onClick={dismiss} aria-label="Bezárás" className="absolute right-3 top-3 grid size-10 place-items-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-foreground">
          <X size={18} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-4 pr-7">
          <img src="/biocare-app-icon-192.png" alt="BioCare alkalmazás ikon" className="size-[4.25rem] rounded-[1.2rem] shadow-md shadow-primary/15" />
          <div>
            <p className="eyebrow">BioCare Kozmetika</p>
            <h2 id="install-prompt-title" className="mt-1 font-display text-[1.65rem] font-medium leading-tight">Tedd ki a telefonodra</h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Nyisd meg a BioCare-t alkalmazásként: gyorsan eléred a szolgáltatásokat, az árlistát és az újdonságokat.
        </p>
        {showInstructions && (
          <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/[0.055] p-4 text-sm leading-6">
            {ios ? (
              <div>
                <p className="font-semibold text-foreground">Hozzáadás iPhone-on</p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-foreground">
                  <li>Nyisd meg ezt az oldalt a <strong>Safari</strong> böngészőben.</li>
                  <li>Koppints a <strong>Megosztás</strong> ikonra — a négyzetből felfelé mutató nyílra. Ha nem látod, nyisd meg a további menüt.</li>
                  <li>Görgess le, és válaszd a <strong>Hozzáadás a Főképernyőhöz</strong> lehetőséget.</li>
                  <li>Kapcsold be a <strong>Megnyitás webappként</strong> opciót, majd koppints a <strong>Hozzáadás</strong> gombra.</li>
                </ol>
              </div>
            ) : (
              <div>
                <p className="flex gap-2"><Download size={17} className="mt-1 shrink-0 text-primary" aria-hidden="true" /> A böngésző menüjében válaszd az <strong>Alkalmazás telepítése</strong> vagy a <strong>Hozzáadás a kezdőképernyőhöz</strong> lehetőséget.</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={install} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/15 transition hover:bg-primary/90">
            {installEvent ? <><Download size={17} aria-hidden="true" /> Telepítés</> : <><Share size={17} aria-hidden="true" /> {ios ? "Lépések megmutatása" : "Telepítési súgó"}</>}
          </button>
          <button type="button" onClick={dismiss} className="inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground">Később</button>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><Check size={13} className="text-primary" aria-hidden="true" /> Ingyenes, és nem kell letölteni az áruházból.</p>
      </section>
    </div>
  );
}
