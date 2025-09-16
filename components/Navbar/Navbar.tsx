// /components/Navbar/Navbar.tsx
"use client";

import { Home, MessageCircle, Users, Folder, User } from "lucide-react"; // lucide-react icons
import Logo from "@/components/Shared/Logo";
import SearchBar from "@/components/Shared/SearchBar";
import NavItem from "@/components/Navbar/NavItem";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/friends", icon: Users, label: "Friends" },
  { href: "/projects", icon: Folder, label: "Projects" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function Navbar() {
  return (
    <>
      {/* Top Navbar for Mobile */}
      <nav className="flex items-center justify-between border-b px-4 py-2 bg-background sticky top-0 z-50 md:hidden">
        <div className="flex items-center gap-4">
          <NavItem href="/profile" icon={User} label="Profile" />
          <SearchBar />
        </div>
      </nav>

      {/* Main Navbar for Desktop */}
      <nav className="hidden md:flex items-center justify-around border-b px-4 py-2 bg-background sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Logo />
          <SearchBar />
        </div>

        <div className="flex gap-6">
          {navItems.map(({ href, icon, label }) => (
            <NavItem key={href} href={href} icon={icon} label={label} />
          ))}
        </div>
      </nav>

      {/* Bottom Navbar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t px-4 py-2 bg-background z-50 md:hidden">
        {navItems
          .filter((item) => item.href !== "/profile")
          .map(({ href, icon, label }) => (
            <NavItem key={href} href={href} icon={icon} label={label} />
          ))}
      </nav>
    </>
  );
}
