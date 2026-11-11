'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { useScrollFill } from '@/hooks/useScrollFill';
import { useSearchShortcut } from '@/hooks/useSearchShortcut';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { SearchModal } from './SearchModal';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'TV Shows', href: '/tv' },
  { label: 'Movies', href: '/movies' },
] as const;

/** `/tv` is active on `/tv` and `/tv/…`, but not on `/tvguide`. */
const isActivePath = (pathname: string, href: string): boolean =>
  href === '/'
    ? pathname === '/'
    : pathname === href || pathname.startsWith(`${href}/`);

const ICON_BUTTON_CLASS =
  'md:hidden size-10 text-white hover:bg-white/10 hover:text-white';

export function Header() {
  const headerRef = React.useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  // The mobile menu belongs to the page it was opened on, so navigating
  // closes it without an effect: it is only "open" for that pathname.
  const [menuOpenOn, setMenuOpenOn] = React.useState<string | null>(null);
  const isMenuOpen = menuOpenOn === pathname;

  const openSearch = () => setIsSearchOpen(true);
  const toggleMenu = () => setMenuOpenOn(isMenuOpen ? null : pathname);

  useScrollFill(headerRef);
  useSearchShortcut(openSearch);

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 [--header-fill:0]">
      {/* Legibility gradient, always present */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-transparent pointer-events-none"
      />
      {/* Solid fill, fades in with scroll (or fully when the menu is open) */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 bg-black pointer-events-none',
          isMenuOpen ? 'opacity-100' : 'opacity-(--header-fill)'
        )}
      />

      <div className="relative mx-auto px-page">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl md:text-3xl font-bold text-white">WH</span>
            <span aria-hidden className="h-6 w-px bg-white/30" />
            <span className="text-xs sm:text-sm md:text-base text-white/80 font-medium">
              WATCH HERE
            </span>
          </Link>

          <nav aria-label="Main" className="hidden md:flex items-center gap-6 lg:gap-8">
            <NavLinks
              pathname={pathname}
              linkClassName="relative text-sm lg:text-base font-medium transition-colors py-1"
              activeClassName="text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-white"
              inactiveClassName="text-white/70 hover:text-white"
            />
          </nav>

          <div className="flex items-center gap-1 md:gap-3">
            {/* Desktop: search pill with shortcut hint */}
            <button
              type="button"
              onClick={openSearch}
              className="hidden md:flex items-center gap-2 h-9 pl-3 pr-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-sm text-white/70 transition-colors"
            >
              <Search aria-hidden className="size-4" />
              <span className="pr-6">Search…</span>
              <kbd className="text-[11px] font-sans px-1.5 rounded bg-white/10 text-white/60">
                ⌘K
              </kbd>
            </button>

            <Button
              variant="ghost"
              size="icon"
              className={ICON_BUTTON_CLASS}
              aria-label="Search"
              onClick={openSearch}
            >
              <Search aria-hidden className="size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={ICON_BUTTON_CLASS}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X aria-hidden className="size-5" />
              ) : (
                <Menu aria-hidden className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <nav aria-label="Main" className="md:hidden pb-3 border-t border-white/10">
            <div className="flex flex-col pt-2">
              <NavLinks
                pathname={pathname}
                linkClassName="py-3 text-base font-medium transition-colors"
                activeClassName="text-white"
                inactiveClassName="text-white/70"
              />
            </div>
          </nav>
        )}
      </div>

      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
}

interface NavLinksProps {
  pathname: string;
  linkClassName: string;
  activeClassName: string;
  inactiveClassName: string;
}

function NavLinks({
  pathname,
  linkClassName,
  activeClassName,
  inactiveClassName,
}: NavLinksProps) {
  return NAV_ITEMS.map(({ label, href }) => {
    const isActive = isActivePath(pathname, href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(linkClassName, isActive ? activeClassName : inactiveClassName)}
      >
        {label}
      </Link>
    );
  });
}
