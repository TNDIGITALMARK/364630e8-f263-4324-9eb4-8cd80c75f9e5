"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/lore", label: "Lore" },
    { href: "/puzzles", label: "Puzzles" },
    { href: "/entities", label: "Entities" },
    { href: "/", label: "Home" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`uppercase text-sm tracking-wider transition-colors ${
              pathname === link.href
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-cyan-400"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-white hover:text-cyan-400 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Menu Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 text-white hover:text-cyan-400"
              aria-label="Close menu"
            >
              <X className="w-8 h-8" />
            </button>

            <nav className="flex flex-col gap-8 text-center">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-2xl uppercase tracking-wider transition-colors ${
                    pathname === link.href
                      ? "text-cyan-400"
                      : "text-gray-400 hover:text-cyan-400"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
