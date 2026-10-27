"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Interner Navigationslink, der die aktuelle Seite mit aria-current markiert (auch Unterseiten, zum Beispiel einzelne Publikationen). */
export function NavLink({ ziel, className, aktivKlasse = "", children, onClick }: { ziel: string; className?: string; aktivKlasse?: string; children: ReactNode; onClick?: () => void }) {
  const roh = usePathname() ?? "/";
  const pfad = (basePath && roh.startsWith(basePath) ? roh.slice(basePath.length) : roh) || "/";
  const aktiv = ziel === "/" ? pfad === "/" : pfad === ziel || pfad.startsWith(ziel);
  return (
    <Link href={ziel} className={`${className ?? ""} ${aktiv ? aktivKlasse : ""}`.trim()} aria-current={aktiv ? "page" : undefined} onClick={onClick}>
      {children}
    </Link>
  );
}
