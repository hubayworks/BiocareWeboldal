import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, LockKeyhole, Mail, UserRound } from "lucide-react";

export function AccountAccessPage({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (registering && password !== confirmPassword) {
      setError("A két jelszó nem egyezik.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ action: registering ? "register" : "password_login", name, email, phone, password }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string; message?: string; customer?: unknown };
      if (!response.ok) throw new Error(data.error || (registering ? "A regisztráció nem sikerült." : "A belépés nem sikerült."));
      if (registering) setMessage(data.message || "Nézd meg az e-mailjeidet a regisztráció megerősítéséhez.");
      else if (data.customer) window.location.assign("/fiok");
      else throw new Error("A belépés nem sikerült.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "A kérés most nem sikerült.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary/55 px-4 py-8 text-foreground sm:px-8 sm:py-14">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} /> Vissza a BioCare-hoz</Link>
        <section className="mt-6 rounded-[2rem] border border-primary/10 bg-background p-6 shadow-[0_24px_70px_-42px_rgba(45,62,38,.45)] sm:p-9">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Heart size={23} /></div>
          <p className="eyebrow mt-5">Személyes vendégfiók</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">{registering ? "Regisztráció" : "Belépés"}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {registering ? "Hozz létre fiókot, hogy egy helyen követhesd a véleményeidet és az ajándékkártya- vagy bérletigényléseidet." : "Lépj be, hogy kezeld a véleményeidet és a korábbi igényléseidet."}
          </p>
          <form onSubmit={submit} className="mt-7 grid gap-4">
            {registering && <label className="grid gap-2 text-sm font-semibold">Teljes név<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="min-h-12 rounded-xl border border-primary/20 bg-background px-4 font-normal outline-none focus:border-primary" placeholder="A neved" /></label>}
            <label className="grid gap-2 text-sm font-semibold">E-mail-cím<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 rounded-xl border border-primary/20 bg-background px-4 font-normal outline-none focus:border-primary" placeholder="nev@email.hu" /></label>
            {registering && <label className="grid gap-2 text-sm font-semibold">Telefonszám<input required type="tel" minLength={7} maxLength={40} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="min-h-12 rounded-xl border border-primary/20 bg-background px-4 font-normal outline-none focus:border-primary" placeholder="+36 30 123 4567" /></label>}
            <label className="grid gap-2 text-sm font-semibold">Jelszó<input required type="password" minLength={registering ? 12 : 1} maxLength={200} autoComplete={registering ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 rounded-xl border border-primary/20 bg-background px-4 font-normal outline-none focus:border-primary" placeholder={registering ? "Legalább 12 karakter" : "A jelszavad"} /></label>
            {registering && <label className="grid gap-2 text-sm font-semibold">Jelszó megerősítése<input required type="password" minLength={12} maxLength={200} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="min-h-12 rounded-xl border border-primary/20 bg-background px-4 font-normal outline-none focus:border-primary" placeholder="Írd be újra a jelszót" /></label>}
            {registering && <p className="rounded-xl bg-secondary/55 p-3 text-xs leading-5 text-muted-foreground">A fiók aktiválásához az e-mail-címedet egy 20 percig érvényes, egyszer használható hivatkozással erősítjük meg.</p>}
            <button disabled={busy} className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60">
              {registering ? <UserRound size={17} /> : <LockKeyhole size={17} />}{busy ? "Feldolgozás…" : registering ? "Fiók létrehozása" : "Belépés"}
            </button>
          </form>
          {!registering && <div className="mt-5 rounded-xl border border-primary/10 bg-secondary/35 p-4 text-sm leading-6 text-muted-foreground"><Mail size={16} className="mr-2 inline text-primary" />Elfelejtetted a jelszót, vagy még csak e-mailes belépésed van? <Link to="/fiok" className="font-semibold text-primary underline underline-offset-4">Kérj belépőlinket</Link>.</div>}
          {message && <p role="status" className="mt-5 rounded-xl bg-primary/10 p-3 text-sm leading-6 text-primary">{message}</p>}
          {error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm leading-6 text-destructive">{error}</p>}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {registering ? "Már van fiókod? " : "Még nincs fiókod? "}
            <Link to={registering ? "/belepes" : "/regisztracio"} className="font-semibold text-primary underline underline-offset-4">{registering ? "Belépés" : "Regisztráció"}</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
