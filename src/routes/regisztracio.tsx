import { createFileRoute } from "@tanstack/react-router";
import { AccountAccessPage } from "../components/account-access-page";

export const Route = createFileRoute("/regisztracio")({
  head: () => ({ meta: [{ title: "Regisztráció | BioCare Kozmetika" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AccountAccessPage mode="register" />,
});
