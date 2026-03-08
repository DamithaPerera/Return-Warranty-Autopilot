import type { Metadata } from "next";
import Link from "next/link";
import { EmailNavDropdown } from "@/components/email-nav-dropdown";
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
        <div className="app-shell min-h-screen">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/dashboard" className="text-lg font-bold tracking-tight text-slate-900">
                Return & Warranty <span className="text-cyan-700">Autopilot</span>
              </Link>
              <nav className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Link href="/dashboard" className="rounded-full px-3 py-1.5 hover:bg-cyan-50 hover:text-cyan-800">
                  Dashboard
                </Link>
                <Link href="/purchases" className="rounded-full px-3 py-1.5 hover:bg-cyan-50 hover:text-cyan-800">
                  Purchases
                </Link>
                <EmailNavDropdown />
                <span className="group relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-slate-500">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                    <path d="M5 7h14v10H5z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 10h14" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 14h4" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="font-semibold">Subscription</span>
                  <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition group-hover:opacity-100">
                    Coming soon
                  </span>
                </span>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
