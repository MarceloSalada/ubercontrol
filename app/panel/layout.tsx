import "./panel.css";
import Link from "next/link";
import { getPanelSession } from "@/lib/panel-data";
import { MobileNav } from "@/components/panel/mobile-nav";
import { isAdminEmail } from "@/lib/security/admin";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getPanelSession();
  const showAdmin = isAdminEmail(user.email);

  return (
    <div className="panel-shell">
      <div className="panel-container">
        {showAdmin ? (
          <div className="panel-inline" style={{ justifyContent: "flex-end" }}>
            <Link href="/panel/admin" className="panel-button-secondary">
              Admin
            </Link>
          </div>
        ) : null}
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
