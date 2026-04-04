import "./panel.css";
import { getPanelSession } from "@/lib/panel-data";
import { MobileNav } from "@/components/panel/mobile-nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await getPanelSession();

  return (
    <div className="panel-shell">
      <div className="panel-container">{children}</div>
      <MobileNav />
    </div>
  );
}
