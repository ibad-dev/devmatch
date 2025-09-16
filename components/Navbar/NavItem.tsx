"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type NavItemProps = {
  href: string;
  label: string;
  icon: IconType;
};

export default function NavItem({ href, label, icon: Icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex flex-col items-center text-sm ${
        isActive ? "text-shadow-gray-200 font-semibold" : "text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="hidden md:block">{label}</span>
    </Link>
  );
}


