"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Provider = {
  name: string;
  href?: string;
  note?: string;
  icon: ReactNode;
};

const providers: Provider[] = [
  {
    name: "Gmail",
    href: "/connect/gmail",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="1.5" />
        <path d="m3 7 9 7 9-7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    name: "Outlook",
    note: "Coming soon",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    name: "Yahoo Mail",
    note: "Coming soon",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M4 6h16l-8 8-8-8Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 10v8h12v-8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    name: "iCloud Mail",
    note: "Coming soon",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M7.5 17h9a3.5 3.5 0 1 0-.8-6.9 4.5 4.5 0 0 0-8.7 1.5A2.8 2.8 0 0 0 7.5 17Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    name: "Proton Mail",
    note: "Coming soon",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M4 7h16v10H4z" stroke="currentColor" strokeWidth="1.5" />
        <path d="m4 8 8 6 8-6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
];

export function EmailNavDropdown() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-cyan-50 hover:text-cyan-800"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="1.5" />
          <path d="m3 7 9 7 9-7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>Email</span>
        <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} fill="none" aria-hidden="true">
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <ul className="py-1">
            {providers.map((provider) => (
              <li key={provider.name}>
                {provider.href ? (
                  <Link
                    href={provider.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      {provider.icon}
                      {provider.name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                      Active
                    </span>
                  </Link>
                ) : (
                  <span className="flex items-center justify-between px-3 py-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      {provider.icon}
                      {provider.name}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {provider.note}
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
