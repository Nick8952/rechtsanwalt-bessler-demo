"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import type { Link as Verweis } from "@/lib/content/modell";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Leporello: Die Website ist ein Faltblatt. Ab 64 rem stehen alle Seiten als schmale, senkrecht beschriftete Streifen nebeneinander;
 * die aktuelle Seite ist aufgefaltet und liegt zwischen ihren Nachbarn (Reihenfolge wie im Register). Die Streifen kleben am oberen
 * Rand und bleiben beim Lesen sichtbar. Unter 64 rem wird das Register zu Reitern über dem Inhalt. Reines CSS: Die Position des
 * aufgefalteten Blatts kommt über `--aktiv` als Flex-Order; `aria-current` markiert die aktuelle Seite (auch Unterseiten).
 */
export function Leporello({ navigation, label, children }: { navigation: Verweis[]; label: string; children: ReactNode }) {
  const roh = usePathname() ?? "/";
  const pfad = (basePath && roh.startsWith(basePath) ? roh.slice(basePath.length) : roh) || "/";
  const aktiv = navigation.findIndex((n) => (n.ziel === "/" ? pfad === "/" : pfad === n.ziel || pfad.startsWith(n.ziel)));
  return (
    <div className="leporello" style={{ "--aktiv": aktiv < 0 ? navigation.length : aktiv } as CSSProperties}>
      <nav aria-label={label} className="register">
        {navigation.map((n, i) => (
          <Link key={n.ziel} href={n.ziel} className="streifen" style={{ "--i": i } as CSSProperties} aria-current={i === aktiv ? "page" : undefined}>
            <span>{n.text}</span>
          </Link>
        ))}
      </nav>
      <div className="blatt">{children}</div>
    </div>
  );
}
