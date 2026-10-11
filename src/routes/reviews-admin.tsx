import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Archive, Check, Download, ExternalLink, Gift, LockKeyhole, LogOut, Mail, RotateCcw, Star, Trash2, Users } from "lucide-react";

type Status = "published" | "archived" | "deleted";
type Review = { id: string; author: string; rating: number; text: string; date: string; status: Status; deletedAt: string | null };
type Integrations = { googleUrl: string; facebookUrl: string; instagramUrl: string };
type AdminDashboard = { users: Array<{ id: string; name: string; email: string; phone: string; createdAt: string; reviewCount: number; giftRequestCount: number }>; giftRequests: Array<{ id: string; kind: string; details: string; status: "requested" | "contacted" | "completed" | "cancelled"; createdAt: string; customerName: string; customerEmail: string; customerPhone: string }>; counts: { users: number; reviews: number; pendingReviews: number; publishedReviews: number; giftRequests: number } };
const emptyIntegrations: Integrations = { googleUrl: "", facebookUrl: "", instagramUrl: "" };
const tabs: Array<{ id: Status; label: string }> = [
  { id: "published", label: "Jóváhagyott" },
  { id: "archived", label: "Archívum" },
  { id: "deleted", label: "Nemrég törölt" },
];

export const Route = createFileRoute("/reviews-admin")({
  validateSearch: (search: Record<string, unknown>) => ({
    status: search["status"] === "archived" || search["status"] === "deleted" ? search["status"] : "published",
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  head: () => ({ meta: [{ title: "Admin véleménykezelő | BioCare Kozmetika" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ReviewAdminPage,
});

function ReviewAdminPage() {
  const { status, token } = Route.useSearch() as { status: Status; token: string };
  const [reviews, setReviews] = useState<Review[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [handoffEnabled, setHandoffEnabled] = useState(false);
  const [integrations, setIntegrations] = useState<Integrations>(emptyIntegrations);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const autoLoginToken = useRef("");

  const loadReviews = async (nextStatus = status) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/admin?status=${nextStatus}`, { headers: { Accept: "application/json" }, cache: "no-store" });
      const data = await response.json().catch(() => ({})) as { reviews?: Review[]; handoffEnabled?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || "A véleménylista nem tölthető be.");
      setReviews(data.reviews || []);
      setHandoffEnabled(data.handoffEnabled === true);
      setAuthenticated(true);
      setError("");
      void loadIntegrations();
    } catch (reason) {
      setAuthenticated(false);
      setError(reason instanceof Error ? reason.message : "A véleménylista nem tölthető be.");
    } finally { setLoading(false); }
  };

  const loadIntegrations = async () => {
    try {
      const response = await fetch("/api/reviews/admin?resource=integrations", { headers: { Accept: "application/json" }, cache: "no-store" });
      const data = await response.json().catch(() => ({})) as { integrations?: Integrations; error?: string };
      if (!response.ok) throw new Error(data.error || "A kapcsolatok nem tölthetők be.");
      setIntegrations({ ...emptyIntegrations, ...data.integrations });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "A kapcsolatok nem tölthetők be.");
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reviews/admin?resource=dashboard", { headers: { Accept: "application/json" }, cache: "no-store" });
      const data = await response.json().catch(() => ({})) as { dashboard?: AdminDashboard; error?: string };
      if (!response.ok || !data.dashboard) throw new Error(data.error || "Az áttekintő nem tölthető be.");
      setDashboard(data.dashboard); setError("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Az áttekintő nem tölthető be."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (!token) void loadReviews(); }, [status, token]);

  const post = async (body: Record<string, unknown>, extraHeaders: Record<string, string> = {}) => {
    const response = await fetch("/api/reviews/admin", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", ...extraHeaders },
      body: JSON.stringify(body), credentials: "same-origin",
    });
    const data = await response.json().catch(() => ({})) as { error?: string; message?: string };
    if (!response.ok) throw new Error(data.error || "A művelet nem sikerült.");
    return data;
  };

  const requestAccess = async () => {
    setBusy(true); setError(""); setMessage("");
    try { const data = await post({ action: "request_access" }); setMessage(data.message || "Elküldtük a belépőlinket az admin postafiókba."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "A belépőlink kérése nem sikerült."); }
    finally { setBusy(false); }
  };

  const saveIntegrations = async () => {
    setBusy(true); setError(""); setMessage("");
    try {
      const data = await post({ action: "save_integrations", integrations }) as { integrations?: Integrations };
      if (data.integrations) setIntegrations({ ...emptyIntegrations, ...data.integrations });
      setMessage("A profilhivatkozások mentve.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "A kapcsolatok mentése nem sikerült."); }
    finally { setBusy(false); }
  };

  const updateGiftRequest = async (requestId: string, requestStatus: AdminDashboard["giftRequests"][number]["status"]) => {
    setBusy(true); setError(""); setMessage("");
    try { await post({ action: "update_gift_request", requestId, requestStatus }); await loadDashboard(); setMessage("Az igénylés állapota frissült."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Az igénylés állapotát nem sikerült frissíteni."); }
    finally { setBusy(false); }
  };

  const sendHandoff = async () => {
    if (!window.confirm("Ez elküldi a BioCare üdvözlő és adminbelépési e-mailt a jelenlegi admin címre. Most hivatalos az átadás?")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await post({ action: "send_handoff" });
      setMessage("Az üdvözlő és adminbelépési e-mail elküldve a beállított admin címre.");
      setHandoffEnabled(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Az átadási e-mail küldése nem sikerült."); }
    finally { setBusy(false); }
  };

  const login = async () => {
    setBusy(true); setError("");
    try {
      await post({ action: "login", token });
      window.history.replaceState({}, "", `/reviews-admin?status=${status}`);
      await loadReviews();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "A belépés nem sikerült."); }
    finally { setBusy(false); }
  };

  // Links sent to the configured admin mailbox carry a single-use token.
  // Consume it automatically so the email's “Open admin panel” button lands
  // directly in the dashboard instead of asking for another click.
  useEffect(() => {
    if (token && autoLoginToken.current !== token) {
      autoLoginToken.current = token;
      void login();
    }
  }, [token]);

  const act = async (review: Review, action: "archive" | "restore" | "delete" | "purge") => {
    if (action === "purge" && !window.confirm("Véglegesen törlöd ezt a véleményt? Ezután már nem állítható vissza.")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await post({ action, reviewId: review.id, confirmed: action === "purge" }, action === "purge" ? { "X-BioCare-Confirm-Purge": "true" } : {});
      await loadReviews();
      setMessage(action === "archive" ? "A vélemény az archívumba került." : action === "restore" ? "A vélemény visszaállt a jóváhagyott listába." : action === "delete" ? "A vélemény átkerült a Nemrég törölt listába." : "A vélemény végleg törlődött.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "A művelet nem sikerült."); }
    finally { setBusy(false); }
  };

  const logout = async () => { try { await post({ action: "logout" }); } finally { setAuthenticated(false); setReviews([]); } };

  return (
    <main className="min-h-screen bg-secondary/55 px-4 py-7 text-foreground sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-semibold text-primary print:hidden">← Vissza a BioCare-hoz</a>
        <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Biztonságos admin felület</p><h1 className="mt-2 font-display text-4xl">Vélemények kezelése</h1></div>
          {authenticated && <div className="flex flex-wrap gap-2 print:hidden"><button onClick={() => window.print()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 px-4 text-sm font-semibold"><Download size={16} /> PDF mentése</button>{handoffEnabled && <button disabled={busy} onClick={() => void sendHandoff()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60"><Mail size={16} /> Üdvözlő e-mail küldése</button>}<button onClick={() => void logout()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 px-4 text-sm font-semibold"><LogOut size={16} /> Kilépés</button></div>}
        </header>

        {!authenticated ? (
          <section className="mt-8 rounded-3xl border border-primary/10 bg-background p-6 shadow-sm sm:p-8">
            <LockKeyhole className="text-primary" size={25} />
            <h2 className="mt-4 font-display text-2xl">Admin belépés szükséges</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">A biztonságos belépőlink az admin postafiókba érkezik, 20 percig érvényes, és csak egyszer használható. Az e-mailben lévő Adminpanel megnyitása gomb közvetlenül beléptet.</p>
            {token ? <p className="mt-5 text-sm text-muted-foreground">{busy ? "Biztonságos beléptetés…" : "A belépőlink ellenőrzése folyamatban."}</p> : <button onClick={() => void requestAccess()} disabled={busy} className="mt-5 inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60"><Mail size={17} /> {busy ? "Küldés…" : "Belépőlinket kérek e-mailben"}</button>}
            {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          </section>
        ) : (
          <>
            <nav className="mt-7 flex flex-wrap gap-2 print:hidden" aria-label="Véleménylista">
              {tabs.map((tab) => <a key={tab.id} href={`/reviews-admin?status=${tab.id}`} aria-current={status === tab.id ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-semibold ${status === tab.id && !showIntegrations && !showDashboard ? "bg-primary text-white" : "border border-primary/15 bg-background text-foreground"}`}>{tab.label}</a>)}
              <button type="button" onClick={() => { setShowDashboard(true); setShowIntegrations(false); setMessage(""); setError(""); void loadDashboard(); }} aria-pressed={showDashboard} className={`rounded-full px-4 py-2 text-sm font-semibold ${showDashboard ? "bg-primary text-white" : "border border-primary/15 bg-background text-foreground"}`}>Áttekintés</button>
              <button type="button" onClick={() => { setShowIntegrations(true); setShowDashboard(false); setMessage(""); setError(""); }} aria-pressed={showIntegrations} className={`rounded-full px-4 py-2 text-sm font-semibold ${showIntegrations ? "bg-primary text-white" : "border border-primary/15 bg-background text-foreground"}`}>Kapcsolatok</button>
            </nav>
            {showDashboard ? (
              <section className="mt-6 space-y-6">
                <div><p className="eyebrow">Admin áttekintő</p><h2 className="mt-2 font-display text-2xl">BioCare-fiókok és igénylések</h2><p className="mt-2 text-sm text-muted-foreground">A személyes adatokat csak a védett adminfelületen, adminbelépés után látod.</p></div>
                {loading && <p className="text-sm text-muted-foreground">Betöltés…</p>}
                {dashboard && <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Regisztrált vendég", dashboard.counts.users], ["Összes vélemény", dashboard.counts.reviews], ["Jóváhagyott", dashboard.counts.publishedReviews], ["Jóváhagyásra vár", dashboard.counts.pendingReviews], ["Nyitott igénylés", dashboard.counts.giftRequests]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-primary/10 bg-background p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl text-primary">{value}</p></div>)}</div>
                  <div className="rounded-3xl border border-primary/10 bg-background p-5 sm:p-6"><h3 className="flex items-center gap-2 font-display text-xl"><Users size={18} className="text-primary" /> Regisztrált vendégek</h3>{dashboard.users.length ? <div className="mt-4 divide-y divide-primary/10">{dashboard.users.map((user) => <article key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-semibold">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}{user.phone ? ` · ${user.phone}` : " · telefonszám nincs megadva"}</p><p className="mt-1 text-xs text-muted-foreground">Regisztráció: {user.createdAt}</p></div><p className="text-xs text-muted-foreground">{user.reviewCount} vélemény · {user.giftRequestCount} igénylés</p></article>)}</div> : <p className="mt-3 text-sm text-muted-foreground">Még nincs regisztrált vendég.</p>}</div>
                  <div className="rounded-3xl border border-primary/10 bg-background p-5 sm:p-6"><h3 className="flex items-center gap-2 font-display text-xl"><Gift size={18} className="text-primary" /> Ajándékkártya- és bérletigénylések</h3>{dashboard.giftRequests.length ? <div className="mt-4 space-y-3">{dashboard.giftRequests.map((item) => <article key={item.id} className="rounded-2xl bg-secondary/40 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{item.kind} · {item.customerName}</p><p className="text-sm text-muted-foreground">{item.customerEmail} · {item.customerPhone || "nincs telefonszám"} · {item.createdAt}</p></div><select aria-label="Igénylés állapota" disabled={busy} value={item.status} onChange={(event) => void updateGiftRequest(item.id, event.target.value as typeof item.status)} className="min-h-10 rounded-full border border-primary/20 bg-background px-3 text-xs"><option value="requested">Beérkezett</option><option value="contacted">Kapcsolatfelvétel folyamatban</option><option value="completed">Lezárva</option><option value="cancelled">Visszavonva</option></select></div><p className="mt-3 whitespace-pre-line text-sm leading-6">{item.details}</p></article>)}</div> : <p className="mt-3 text-sm text-muted-foreground">Még nincs igénylés.</p>}</div>
                </>}
                {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}{message && <p role="status" className="text-sm text-primary">{message}</p>}
              </section>
            ) : showIntegrations ? (
              <section className="mt-6 rounded-3xl border border-primary/10 bg-background p-5 shadow-sm sm:p-7">
                <p className="eyebrow">Külső felületek</p>
                <h2 className="mt-2 font-display text-2xl">Kapcsolatok beállítása</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Itt a nyilvános profil- és értékelési hivatkozásokat tudod megadni. Ezek mentése nem kapcsol be automatikus API-szinkront; ahhoz külön Google- vagy Meta-fejlesztői hozzáférés és biztonságos OAuth-beállítás szükséges.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Google Reviews API", "Később beköthető Google Business Profile-hozzáféréssel"],
                    ["Facebook Reviews API", "Később beköthető Meta-oldalengedéllyel"],
                    ["Instagram API", "Később beköthető Meta-fiókengedéllyel"],
                  ].map(([label, detail]) => <div key={label} className="rounded-2xl border border-primary/10 bg-secondary/35 p-4"><p className="text-sm font-semibold">{label}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p><span className="mt-3 inline-flex rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">Nincs összekapcsolva</span></div>)}
                </div>
                <div className="mt-6 grid gap-5">
                  {([
                    ["googleUrl", "Google-értékelések", "Google Cégprofil értékelési hivatkozása"],
                    ["facebookUrl", "Facebook-oldal és értékelések", "A BioCare Facebook-oldalának hivatkozása"],
                    ["instagramUrl", "Instagram-profil", "A BioCare Instagram-profiljának hivatkozása"],
                  ] as const).map(([key, label, hint]) => (
                    <label key={key} className="grid gap-2 text-sm font-semibold">
                      {label}<span className="font-normal text-muted-foreground">{hint}</span>
                      <input type="url" inputMode="url" placeholder="https://…" value={integrations[key]} onChange={(event) => setIntegrations((current) => ({ ...current, [key]: event.target.value }))} className="min-h-11 rounded-xl border border-primary/20 bg-background px-4 text-sm font-normal outline-none focus:border-primary" />
                      {integrations[key] && <a href={integrations[key]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary">Hivatkozás megnyitása <ExternalLink size={13} /></a>}
                    </label>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button type="button" disabled={busy} onClick={() => void saveIntegrations()} className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Mentés…" : "Beállítások mentése"}</button>
                  <span className="text-xs text-muted-foreground">A hivatkozások csak HTTPS-címmel menthetők.</span>
                </div>
                {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}
                {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
              </section>
            ) : <>
            <div className="mt-5 flex items-center justify-between gap-4"><h2 className="font-display text-2xl">{tabs.find((tab) => tab.id === status)?.label}</h2><span className="text-sm text-muted-foreground">{reviews.length} vélemény</span></div>
            {message && <p role="status" className="mt-4 rounded-xl bg-primary/10 p-3 text-sm text-primary">{message}</p>}
            {error && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            {loading ? <p className="mt-6 text-sm text-muted-foreground">Betöltés…</p> : reviews.length === 0 ? <p className="mt-5 rounded-2xl border border-primary/10 bg-background p-6 text-sm text-muted-foreground">Ebben a listában most nincs vélemény.</p> : (
              <div className="mt-5 space-y-4">
                {reviews.map((review) => <article key={review.id} className="rounded-3xl border border-primary/10 bg-background p-5 shadow-sm print:break-inside-avoid sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{review.author}</h3><p className="mt-1 text-xs text-muted-foreground">{review.date}{review.deletedAt ? ` · törölve: ${review.deletedAt}` : ""}</p></div><span className="flex text-primary" aria-label={`${review.rating} csillag`}>{Array.from({ length: review.rating }, (_, i) => <Star key={i} size={15} fill="currentColor" />)}</span></div>
                  <p className="mt-4 whitespace-pre-line text-sm leading-6">{review.text}</p>
                  <div className="mt-5 flex flex-wrap gap-2 print:hidden">
                    {status === "published" && <><button disabled={busy} onClick={() => void act(review, "archive")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 px-4 text-sm"><Archive size={15} /> Archiválás</button><button disabled={busy} onClick={() => void act(review, "delete")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-destructive/30 px-4 text-sm text-destructive"><Trash2 size={15} /> Törlés</button></>}
                    {status === "archived" && <><button disabled={busy} onClick={() => void act(review, "restore")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 px-4 text-sm"><Check size={15} /> Visszaállítás</button><button disabled={busy} onClick={() => void act(review, "delete")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-destructive/30 px-4 text-sm text-destructive"><Trash2 size={15} /> Törlés</button></>}
                    {status === "deleted" && <><button disabled={busy} onClick={() => void act(review, "restore")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 px-4 text-sm"><RotateCcw size={15} /> Visszaállítás</button><button disabled={busy} onClick={() => void act(review, "purge")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-destructive/30 px-4 text-sm text-destructive"><Trash2 size={15} /> Végleges törlés</button></>}
                  </div>
                </article>)}
              </div>
            )}
            <p className="mt-5 text-xs leading-5 text-muted-foreground print:hidden">A „Törlés” a Nemrég törölt listába helyezi az értékelést. Onnan visszaállítható, vagy külön véglegesen törölhető. PDF mentéshez válaszd a böngésző nyomtatási ablakában a PDF-be mentést.</p>
            </>}
          </>
        )}
      </div>
    </main>
  );
}
