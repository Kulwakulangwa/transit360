import { createFileRoute } from "@tanstack/react-router";
import App from "@/AppShell";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Transit360 — Logistics Platform" },
      { name: "description", content: "Operations command center for shipments, fleet, drivers, and compliance." },
      { property: "og:title", content: "Transit360 — Logistics Platform" },
      { property: "og:description", content: "Operations command center for shipments, fleet, drivers, and compliance." },
    ],
  }),
  component: Index,
});

function Index() {
  return <App />;
}
