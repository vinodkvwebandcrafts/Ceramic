'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 h-16 bg-[var(--color-cream)] border-b border-[var(--color-warm-gray-1)]">
      <Container className="h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-[family-name:var(--font-logo)] text-[1.375rem] leading-none">
          <span className="text-[var(--color-primary-dark)]">Cer</span>
          <span className="text-[var(--color-secondary)]">a</span>
          <span className="text-[var(--color-primary-dark)]">mic</span>
        </Link>

        {/* Nav Links (desktop) */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="font-[family-name:var(--font-body)] text-[0.8125rem] font-medium text-[var(--color-primary-dark)] px-[0.625rem] py-[0.3125rem] rounded-[0.1875rem] hover:bg-[rgba(25,114,120,0.07)] hover:text-[var(--color-primary)] transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden sm:block">
            <Input size="sm" placeholder="Search..." className="w-[8.75rem]" />
          </div>

          {/* Wishlist */}
          <Link href="/account/wishlist" className="w-[2.25rem] h-[2.25rem] border border-[var(--color-warm-gray-1)] rounded-[0.1875rem] flex items-center justify-center text-[0.875rem] hover:border-[var(--color-primary)] transition-colors">
            ♡
          </Link>

          {/* Cart */}
          <Link href="/cart" className="w-[2.25rem] h-[2.25rem] border border-[var(--color-warm-gray-1)] rounded-[0.1875rem] flex items-center justify-center text-[0.875rem] relative hover:border-[var(--color-primary)] transition-colors">
            ⊞
            <span className="absolute -top-[0.3125rem] -right-[0.3125rem] w-4 h-4 bg-[var(--color-secondary)] text-white text-[0.5rem] rounded-full flex items-center justify-center font-[family-name:var(--font-ui)] font-semibold">3</span>
          </Link>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-[2.25rem] h-[2.25rem] flex items-center justify-center text-lg cursor-pointer">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--color-cream)] border-t border-[var(--color-warm-gray-1)] px-6 py-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 text-[0.9375rem] font-medium text-[var(--color-primary-dark)]" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
