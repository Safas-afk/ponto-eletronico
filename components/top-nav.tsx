"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/registros", label: "Registros" },
  { href: "/colaboradores", label: "Colaboradores" },
];

export function TopNav({ email }: { email: string | undefined }) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-3.5">
      <nav className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="rounded-md dark:bg-white dark:p-1.5">
            <Image
              src="/civalerg-logo.png"
              alt="Civalerg"
              width={1987}
              height={1144}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>
          <div className="h-8 w-px bg-border" />
          <span className="text-[15px] font-bold tracking-tight">Ponto Eletrônico</span>
        </div>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm text-muted-foreground hover:text-foreground",
              pathname.startsWith(link.href) && "font-semibold text-primary",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{email}</span>
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
