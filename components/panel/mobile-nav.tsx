"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CircleUserRound, Home, NotebookPen, Wallet } from "lucide-react";

const items = [
  { href: "/panel/dashboard", label: "Home", icon: Home },
  { href: "/panel/entries", label: "Lanç.", icon: NotebookPen },
  { href: "/panel/costs", label: "Custos", icon: Wallet },
  { href: "/panel/charts", label: "Gráf.", icon: BarChart3 },
  { href: "/panel/profile", label: "Perfil", icon: CircleUserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="panel-mobile-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`panel-mobile-link ${active ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
