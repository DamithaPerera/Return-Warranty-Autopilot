import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Return & Warranty Autopilot",
  description: "Track returns and warranties from purchase receipts."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
                Return & Warranty Autopilot
              </Link>
              <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
                <Link href="/dashboard" className="hover:text-slate-900">
                  Dashboard
                </Link>
                <Link href="/purchases" className="hover:text-slate-900">
                  Purchases
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
