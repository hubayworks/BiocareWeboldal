import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, LogOut, Mail, Star, Trash2 } from "lucide-react";

type Customer = { id: string; email: string; name: string; phone: string };
type Review = { id: string; author: string; rating: number; text: string; date: string; status: "pending" | "published" | "archived" | "deleted"; deletedAt: string | null };
type GiftRequest = { id: string; kind: string; details: string; status: "requested" | "contacted" | "completed" | "cancelled"; createdAt: string };

export const Route = createFileRoute("/fiok")({
  validateSearch: (search: Record<string, unknown>) => ({ token: typeof search.token === "string" ? search.token : "" }),
  head: () => ({ meta: [{ title: "Vendégfiók | BioCare Kozmetika" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: CustomerAccountPage,
});

function CustomerAccountPage() {
  const { token } = Route.useSearch();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [giftRequests, setGiftRequests] = useState<GiftRequest[]>([]);
  const [giftKind, setGiftKind] = useState("Ajándékkártya");
  const [giftDetails, setGiftDetails] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadReviews = async () => {
    const response = await fetch("/api/account/reviews", { headers: { Accept: "application/json" }, cache: "no-store" });
    const data = await response.json().catch(() => ({})) as { reviews?: Review[]; error?: string };
    if (!response.ok) throw new Error(data.error || "A vélemények nem tölthetők be.");
    setReviews(data.reviews || []);
  };

  const loadGiftRequests = async () => {
    const response = await fetch("/api/account/requests", { headers: { Accept: "application/json" }, cache: "no-store" });
    const data = await response.json().catch(() => ({})) as { requests?: GiftRequest[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Az igénylések nem tölthetők be.");
    setGiftRequests(data.requests || []);
  };

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        if (token) {
          const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ action: "login", token }) });
          const data = await response.json().catch(() => ({})) as { customer?: Customer; error?: string };
          if (!response.ok || !data.customer) throw new Error(data.error || "A belépőlink érvénytelen vagy lejárt.");
          window.history.replaceState({}, "", "/fiok");
          if (active) { setCustomer(data.customer); setName(data.customer.name); setPhone(data.customer.phone || ""); setEmail(data.customer.email); setMessage("Sikeresen beléptél a fiókodba."); }
        } else {
          const response = await fetch("/api/account", { headers: { Accept: "application/json" }, cache: "no-store" });
          const data = await response.json().catch(() => ({})) as { customer?: Customer | null };
          if (active) {
            setCustomer(data.customer || null);
            if (data.customer) { setName(data.customer.name); setPhone(data.customer.phone || ""); setEmail(data.customer.email); }
          }
        }
      } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : "A belépés nem sikerült."); }
    };
    void initialize();
    return () => { active = false; };
  }, [token]);

  useEffect(() => { if (customer) void Promise.all([loadReviews(), loadGiftRequests()]).catch((reason) => setError(reason instanceof Error ? reason.message : "A fiók adatai nem tölthetők be.")); }, [customer]);

  const requestLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ action: "request_link", email, name, phone }) });
      const data = await response.json().catch(() => ({})) as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error || "A belépőlink kérése nem sikerült.");
      setMessage(data.message || "Ha az e-mail-cím használható, elküldtük a belépőlinket.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "A belépőlink kérése nem sikerült."); }
    finally { setBusy(false); }
  };

  const updateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ action: "update_profile", name, phone }) });
      const data = await response.json().catch(() => ({})) as { customer?: Customer; error?: string };
      if (!response.ok || !data.customer) throw new Error(data.error || "A profil mentése nem sikerült.");
      setCustomer(data.customer); setMessage("A profiladataid mentve.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "A profil mentése nem sikerült."); }
    finally { setBusy(false); }
  };

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    if (newPassword !== confirmNewPassword) { setError("A két jelszó nem egyezik."); setBusy(false); return; }
    try {
      const response = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ action: "update_password", password: newPassword }) });
      const data = await response.json().catch(() => ({})) as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error || "A jelszó módosítása nem sikerült.");
      setNewPassword(""); setConfirmNewPassword(""); setMessage(data.message || "A jelszavad frissült.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "A jelszó módosítása nem sikerült."); }
    finally { setBusy(false); }
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account/reviews", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ rating, review, consent }) });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "A vélemény beküldése nem sikerült.");
      setRating(0); setReview(""); setConsent(false); setMessage("Elküldtük jóváhagyásra. Közzététel után jelenik meg az oldalon.");
      await loadReviews();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "A vélemény beküldése nem sikerült."); }
    finally { setBusy(false); }
  };

  const withdraw = async (item: Review) => {
    if (!window.confirm("Visszavonod ezt a véleményt? Eltűnik a nyilvános oldalról, de az admin később visszaállíthatja.")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account/reviews", { method: "DELETE", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ reviewId: item.id }) });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "A vélemény visszavonása nem sikerült.");
      setMessage("A vélemény visszavonva."); await loadReviews();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "A vélemény visszavonása nem sikerült."); }
    finally { setBusy(false); }
  };

  const submitGiftRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account/requests", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ kind: giftKind, details: giftDetails }) });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Az igénylés beküldése nem sikerült.");
      setGiftDetails(""); setMessage("Az igénylés bekerült a fiókodba. Dominika felveszi veled a kapcsolatot."); await loadGiftRequests();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Az igénylés beküldése nem sikerült."); }
    finally { setBusy(false); }
  };

  const logout = async () => {
    await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ action: "logout" }) });
    setCustomer(null); setReviews([]); setGiftRequests([]); setMessage("Kijelentkeztél."); setError("");
  };

  return (
    <main className="min-h-screen bg-secondary/55 px-4 py-7 text-foreground sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} /> Vissza a BioCare-hoz</Link>
        <header className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Személyes vendégfiók</p><h1 className="mt-2 font-display text-4xl">A véleményeim</h1></div>{customer && <button type="button" onClick={() => void logout()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 px-4 text-sm font-semibold"><LogOut size={15} /> Kilépés</button>}</header>
        {!customer ? (
          <section className="mt-8 rounded-3xl border border-primary/10 bg-background p-6 shadow-sm sm:p-8">
            <Mail className="text-primary" size={24} /><h2 className="mt-4 font-display text-2xl">Belépés vagy regisztráció</h2>
            <p className="mt-3 flex flex-wrap gap-3 text-sm"><Link to="/belepes" className="font-semibold text-primary underline underline-offset-4">Belépés jelszóval</Link><Link to="/regisztracio" className="font-semibold text-primary underline underline-offset-4">Új fiók létrehozása</Link></p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Írd be a neved és e-mail-címed. A postafiókodba küldött egyszer használatos linkkel tudod igazolni a címedet és megnyitni a fiókodat. A link 20 percig érvényes.</p>
            <form onSubmit={requestLink} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold">Neved<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="min-h-12 rounded-xl border border-primary/20 bg-background px-4 font-normal" /></label>
              <label className="grid gap-2 text-sm font-semibold">E-mail-címed<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 rounded-xl border border-primary/20 bg-background px-4 font-normal" /></label>
              <label className="grid gap-2 text-sm font-semibold">Telefonszámod<input required type="tel" minLength={7} maxLength={40} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+36 30 123 4567" className="min-h-12 rounded-xl border border-primary/20 bg-background px-4 font-normal" /></label>
              <button disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60"><Mail size={16} /> {busy ? "Küldés…" : "Belépőlink küldése"}</button>
            </form>
          </section>
        ) : (
          <>
            <section className="mt-8 rounded-3xl border border-primary/10 bg-background p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-2xl">A profilom</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Az e-mail-címed megerősített fiókazonosító. A neved és telefonszámod később is módosítható.</p>
              <form onSubmit={updateProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">Név<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="min-h-11 rounded-xl border border-primary/20 bg-background px-4 font-normal" /></label>
                <label className="grid gap-2 text-sm font-semibold">Telefonszám<input required type="tel" minLength={7} maxLength={40} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="min-h-11 rounded-xl border border-primary/20 bg-background px-4 font-normal" /></label>
                <button disabled={busy} className="min-h-11 w-fit rounded-full border border-primary/20 px-5 text-sm font-semibold text-primary disabled:opacity-50 sm:col-span-2">Profil mentése</button>
              </form>
            </section>
            <section className="mt-8 rounded-3xl border border-primary/10 bg-background p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-2xl">Jelszó beállítása vagy módosítása</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Legalább 12 karakteres jelszót válassz. Ha korábban e-mailes belépést használtál, ezzel állíthatsz be először jelszót.</p>
              <form onSubmit={updatePassword} className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">Új jelszó<input required type="password" minLength={12} maxLength={200} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="min-h-11 rounded-xl border border-primary/20 bg-background px-4 font-normal" /></label>
                <label className="grid gap-2 text-sm font-semibold">Jelszó megerősítése<input required type="password" minLength={12} maxLength={200} autoComplete="new-password" value={confirmNewPassword} onChange={(event) => setConfirmNewPassword(event.target.value)} className="min-h-11 rounded-xl border border-primary/20 bg-background px-4 font-normal" /></label>
                <button disabled={busy} className="min-h-11 w-fit rounded-full border border-primary/20 px-5 text-sm font-semibold text-primary disabled:opacity-50 sm:col-span-2">Jelszó mentése</button>
              </form>
            </section>
            <section className="mt-8 rounded-3xl border border-primary/10 bg-background p-6 shadow-sm sm:p-8">
              <p className="text-sm text-muted-foreground">Bejelentkezve: <strong className="text-foreground">{customer.email}</strong></p>
              <h2 className="mt-5 font-display text-2xl">Új vélemény beküldése</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">A véleményed csak adminjóváhagyás után lesz nyilvános.</p>
              <form onSubmit={submitReview} className="mt-5 grid gap-4">
                <fieldset><legend className="text-sm font-semibold">Értékelés</legend><div className="mt-2 flex gap-1">{[1,2,3,4,5].map((value) => <label key={value} className="cursor-pointer rounded-full p-1 text-primary"><input className="peer sr-only" type="radio" required name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} aria-label={`${value} csillag`} /><Star size={25} fill={value <= rating ? "currentColor" : "none"} /></label>)}</div></fieldset>
                <label className="grid gap-2 text-sm font-semibold">Véleményed<textarea required minLength={10} maxLength={2000} rows={4} value={review} onChange={(event) => setReview(event.target.value)} className="rounded-xl border border-primary/20 bg-background px-4 py-3 font-normal" /></label>
                <label className="flex items-start gap-3 rounded-xl bg-secondary/60 p-4 text-sm leading-6"><input required type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 size-4 accent-primary" /><span>Hozzájárulok, hogy a nevem és véleményem adminjóváhagyás után megjelenjen a BioCare weboldalán.</span></label>
                <button disabled={busy || !rating} className="min-h-12 rounded-full bg-primary px-5 text-sm font-semibold text-white disabled:opacity-50">Vélemény beküldése</button>
              </form>
            </section>
            <section className="mt-8 rounded-3xl border border-primary/10 bg-background p-6 shadow-sm sm:p-8">
              <p className="eyebrow">Személyes igénylés</p><h2 className="mt-2 font-display text-2xl">Ajándékkártya vagy bérlet</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Küldd el az érdeklődésed a fiókodból. Az igénylés állapotát később itt követheted.</p>
              <form onSubmit={submitGiftRequest} className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold">Miben segíthetünk?
                  <select value={giftKind} onChange={(event) => setGiftKind(event.target.value)} className="min-h-12 rounded-xl border border-primary/20 bg-background px-4 font-normal"><option>Ajándékkártya</option><option>Arckezelési bérlet</option><option>Kezelési utalvány</option></select>
                </label>
                <label className="grid gap-2 text-sm font-semibold">Részletek<textarea required minLength={3} maxLength={1000} rows={3} value={giftDetails} onChange={(event) => setGiftDetails(event.target.value)} placeholder="Például hány alkalmas bérlet érdekel, kinek szánod, és hogyan érhetünk el?" className="rounded-xl border border-primary/20 bg-background px-4 py-3 font-normal" /></label>
                <button disabled={busy} className="min-h-12 w-fit rounded-full border border-primary/20 px-5 text-sm font-semibold text-primary disabled:opacity-50">Igénylés elküldése</button>
              </form>
              <div className="mt-6 border-t border-primary/10 pt-5"><h3 className="font-semibold">Korábbi igényléseim</h3>{giftRequests.length ? <ul className="mt-3 grid gap-3">{giftRequests.map((request) => <li key={request.id} className="rounded-xl bg-secondary/45 p-4 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong>{request.kind}</strong><span className="text-primary">{request.status === "requested" ? "Beérkezett" : request.status === "contacted" ? "Kapcsolatfelvétel folyamatban" : request.status === "completed" ? "Lezárva" : "Visszavonva"}</span></div><p className="mt-2 whitespace-pre-line text-muted-foreground">{request.details}</p><p className="mt-2 text-xs text-muted-foreground">{request.createdAt}</p></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Még nincs igénylésed.</p>}</div>
            </section>
            <section className="mt-8"><h2 className="font-display text-2xl">Saját beküldéseim</h2>{reviews.length ? <div className="mt-4 grid gap-4">{reviews.map((item) => <article key={item.id} className="rounded-2xl border border-primary/10 bg-background p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold">{"★".repeat(item.rating)} <span className="font-normal text-muted-foreground">· {item.date}</span></p><span className="rounded-full bg-secondary px-3 py-1 text-xs">{item.status === "pending" ? "Jóváhagyásra vár" : item.status === "published" ? "Közzétéve" : "Archiválva"}</span></div><p className="mt-3 whitespace-pre-line text-sm leading-6">{item.text}</p>{item.status !== "deleted" && <button type="button" disabled={busy} onClick={() => void withdraw(item)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-destructive/25 px-4 text-sm text-destructive disabled:opacity-50"><Trash2 size={14} /> Visszavonás</button>}</article>)}</div> : <p className="mt-3 rounded-2xl border border-primary/10 bg-background p-5 text-sm text-muted-foreground">Még nincs beküldött vélemény a fiókodban.</p>}</section>
          </>
        )}
        {message && <p role="status" className="mt-5 rounded-xl bg-primary/10 p-3 text-sm text-primary">{message}</p>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Heart size={14} className="text-primary" /> A belépőlink egyszer használatos és 20 percig érvényes.</p>
      </div>
    </main>
  );
}
