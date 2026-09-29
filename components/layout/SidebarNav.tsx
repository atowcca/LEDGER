"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav({ items }: { items: { label: string; href: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2 py-3">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center rounded-sm border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-accent bg-accent-soft text-ink"
                : "border-transparent text-ink-soft hover:bg-paper hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
