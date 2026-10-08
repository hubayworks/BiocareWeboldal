import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BioCare Kozmetika Pécs | Természetes bőrápolás" },
      {
        name: "description",
        content:
          "Személyre szabott arckezelések, gépi bőrápolás és kényeztető szolgáltatások Pécs belvárosában, a BioCare Kozmetikában.",
      },
      { property: "og:title", content: "BioCare Kozmetika Pécs" },
      {
        property: "og:description",
        content:
          "Természetes bőrápolás. Egy kis idő önmagadra. Ismerd meg a BioCare Kozmetika szolgáltatásait és árlistáját.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});
