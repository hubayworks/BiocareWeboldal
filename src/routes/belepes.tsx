import { createFileRoute } from "@tanstack/react-router";
import { AccountAccessPage } from "../components/account-access-page";

export const Route = createFileRoute("/belepes")({
  head: () => ({ meta: [{ title: "Belépés | BioCare Kozmetika" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: () => <AccountAccessPage mode="login" />,
});
