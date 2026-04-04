import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UberControl",
  description: "Controle financeiro para motoristas com dashboard, histórico e autenticação.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
