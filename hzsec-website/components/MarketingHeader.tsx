'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

type DropdownKey = 'product' | 'solutions' | 'resources';

const dropdownBase =
  'absolute top-full mt-2 bg-panel border border-border rounded-xl shadow-xl p-4 z-50 transition-all duration-150';
const dropdownOpen = 'opacity-100 translate-y-0 pointer-events-auto';
const dropdownClosed = 'opacity-0 -translate-y-1.5 pointer-events-none';

const triggerBase =
  'inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors';
const triggerIdle = 'text-muted hover:text-text hover:bg-text/5';
const triggerActive = 'text-text bg-text/5';

const dropdownLink =
  'block px-2.5 py-1.5 text-sm text-text rounded-md hover:text-accent hover:bg-accent/5 transition-colors whitespace-nowrap';

const colTitle =
  'text-[10px] font-mono uppercase tracking-widest text-muted mb-2 pb-2 border-b border-border';

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <polyline points="4 6 8 10 12 6" />
    </svg>
  );
}

// Signed-out nav buttons — shared between the Clerk <SignedOut> path and the
// keyless CI fallback so the rendered output is identical in both cases.
function NavSignedOutUI() {
  return (
    <>
      <Link
        href="/pricing"
        className="text-sm text-muted border border-border px-3 py-1.5 rounded-md hover:border-accent hover:text-accent transition-colors max-[899px]:hidden"
      >
        View pricing
      </Link>
      <Link
        href="/download"
        className="text-sm bg-accent text-white px-3 py-1.5 rounded-md hover:bg-accent/90 transition-colors max-[899px]:hidden"
      >
        Get early access
      </Link>
    </>
  );
}

export function MarketingHeader() {
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  function openMenu(key: DropdownKey) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(key);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 100);
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as Element).closest('[data-nav-item]')) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isOpen = (key: DropdownKey) => activeDropdown === key;

  return (
    <>
      {/* ── Utility bar ── */}
      <div className="fixed top-0 inset-x-0 z-50 h-9 bg-panel border-b border-border flex items-center px-[6%]">
        <div className="relative">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-9 focus:-translate-x-1/2 focus:z-[300] focus:px-4 focus:py-2 focus:bg-panel focus:border focus:border-accent focus:rounded focus:text-accent focus:text-sm focus:shadow-lg"
          >
            Skip to main content
          </a>
        </div>
        <div className="flex-1 text-center">
          <Link
            href="/download"
            className="text-xs text-muted hover:text-accent transition-colors"
          >
            Early access: get Pro free for 3 months →
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/docs" className="text-xs text-muted hover:text-text transition-colors">
            Docs
          </Link>
          <a
            href="mailto:hello@hzsec.io"
            className="text-xs text-muted hover:text-text transition-colors"
          >
            Contact
          </a>
          {clerkKey ? (
            <SignedOut>
              <Link href="/login" className="text-xs text-muted hover:text-text transition-colors">
                Sign in
              </Link>
            </SignedOut>
          ) : (
            <Link href="/login" className="text-xs text-muted hover:text-text transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* ── Main nav ── */}
      <nav
        className="fixed top-9 inset-x-0 z-40 h-[72px] bg-bg/90 backdrop-blur-md border-b border-border flex items-center justify-between px-[6%]"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <svg
            className="text-accent"
            width="20"
            height="24"
            viewBox="0 0 48 56"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 4 L44 4 L44 32 Q44 48 24 54 Q4 48 4 32 Z"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <line x1="10" y1="16" x2="10" y2="36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="10" y1="26" x2="20" y2="26" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="20" y1="16" x2="20" y2="36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="25" y1="16" x2="38" y2="16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <line x1="38" y1="16" x2="25" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <line x1="25" y1="32" x2="38" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="font-mono text-sm font-bold tracking-tight">
            <span className="text-text">HZ</span>
            <span className="text-accent">Sec</span>
          </span>
        </Link>

        {/* Desktop nav items — hidden below 900px */}
        <ul className="flex items-center gap-0.5 list-none max-[899px]:hidden" role="list">

          {/* Product — 3-column mega menu */}
          <li
            className="relative"
            data-nav-item=""
            onMouseEnter={() => openMenu('product')}
            onMouseLeave={scheduleClose}
          >
            <button
              className={`${triggerBase} ${isOpen('product') ? triggerActive : triggerIdle}`}
              aria-expanded={isOpen('product')}
              aria-haspopup="true"
              aria-controls="dropdown-product"
            >
              Product
              <Chevron open={isOpen('product')} />
            </button>
            <div
              id="dropdown-product"
              role="menu"
              className={`${dropdownBase} left-0 min-w-[580px] ${isOpen('product') ? dropdownOpen : dropdownClosed}`}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="flex gap-7">
                <div className="flex-1">
                  <div className={colTitle}>Scan</div>
                  {/* TODO: build page */}
                  <a href="#" role="menuitem" className={dropdownLink}>Security Scanner</a>
                  {/* TODO: build page */}
                  <a href="#" role="menuitem" className={dropdownLink}>Auto-fixes</a>
                  {/* TODO: build page */}
                  <a href="#" role="menuitem" className={dropdownLink}>Score history</a>
                  {/* TODO: build page */}
                  <a href="#" role="menuitem" className={dropdownLink}>Audit log</a>
                </div>
                <div className="flex-1">
                  <div className={colTitle}>Defend</div>
                  {/* TODO: build page */}
                  <a href="#" role="menuitem" className={dropdownLink}>AI Assistant</a>
                  {/* TODO: build page */}
                  <a href="#" role="menuitem" className={dropdownLink}>Live Monitor</a>
                  {/* TODO: build page */}
                  <a href="#" role="menuitem" className={dropdownLink}>Breach Intelligence</a>
                </div>
                <div className="flex-1">
                  <div className={colTitle}>Govern</div>
                  {/* TODO: build page */}
                  <a href="#" role="menuitem" className={dropdownLink}>Compliance mapping</a>
                  {/* TODO: build page */}
                  <a href="#" role="menuitem" className={dropdownLink}>OWASP / CIS / SOC 2</a>
                  {/* TODO: build page */}
                  <a href="#" role="menuitem" className={dropdownLink}>CVE database</a>
                </div>
              </div>
            </div>
          </li>

          {/* Solutions — single column */}
          <li
            className="relative"
            data-nav-item=""
            onMouseEnter={() => openMenu('solutions')}
            onMouseLeave={scheduleClose}
          >
            <button
              className={`${triggerBase} ${isOpen('solutions') ? triggerActive : triggerIdle}`}
              aria-expanded={isOpen('solutions')}
              aria-haspopup="true"
              aria-controls="dropdown-solutions"
            >
              Solutions
              <Chevron open={isOpen('solutions')} />
            </button>
            <div
              id="dropdown-solutions"
              role="menu"
              className={`${dropdownBase} left-1/2 -translate-x-1/2 min-w-[220px] ${isOpen('solutions') ? dropdownOpen : dropdownClosed}`}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              {/* TODO: build page */}
              <a href="#" role="menuitem" className={dropdownLink}>For Solo Developers</a>
              {/* TODO: build page */}
              <a href="#" role="menuitem" className={dropdownLink}>For Small Teams</a>
              {/* TODO: build page */}
              <a href="#" role="menuitem" className={dropdownLink}>For Open Source Maintainers</a>
              {/* TODO: build page */}
              <a href="#" role="menuitem" className={dropdownLink}>Pre-commit Security</a>
              {/* TODO: build page */}
              <a href="#" role="menuitem" className={dropdownLink}>Compliance for Startups</a>
            </div>
          </li>

          {/* Resources — single column */}
          <li
            className="relative"
            data-nav-item=""
            onMouseEnter={() => openMenu('resources')}
            onMouseLeave={scheduleClose}
          >
            <button
              className={`${triggerBase} ${isOpen('resources') ? triggerActive : triggerIdle}`}
              aria-expanded={isOpen('resources')}
              aria-haspopup="true"
              aria-controls="dropdown-resources"
            >
              Resources
              <Chevron open={isOpen('resources')} />
            </button>
            <div
              id="dropdown-resources"
              role="menu"
              className={`${dropdownBase} left-1/2 -translate-x-1/2 min-w-[200px] ${isOpen('resources') ? dropdownOpen : dropdownClosed}`}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <Link href="/blog" role="menuitem" className={dropdownLink}>Blog</Link>
              <Link href="/docs" role="menuitem" className={dropdownLink}>How It Works</Link>
              {/* TODO: build page */}
              <a href="#" role="menuitem" className={dropdownLink}>Demo</a>
              {/* TODO: build page */}
              <a href="#" role="menuitem" className={dropdownLink}>FAQ</a>
            </div>
          </li>

          {/* Direct links */}
          <li>
            <Link href="/pricing" className={`${triggerBase} ${triggerIdle}`}>Pricing</Link>
          </li>
          <li>
            <Link href="/download" className={`${triggerBase} ${triggerIdle}`}>Download</Link>
          </li>
        </ul>

        {/* Right: theme switcher + auth + CTAs + hamburger */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {clerkKey ? (
            <>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted hover:text-text transition-colors max-[899px]:hidden"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <NavSignedOutUI />
              </SignedOut>
            </>
          ) : (
            <NavSignedOutUI />
          )}
          {/* Hamburger — shown below 900px */}
          <button
            className="hidden max-[899px]:flex flex-col justify-center gap-[5px] w-9 h-9 p-1.5 rounded-md bg-transparent border-none cursor-pointer hover:bg-text/5 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobileNav"
          >
            <span className="block w-5 h-0.5 bg-text rounded-sm" />
            <span className="block w-5 h-0.5 bg-text rounded-sm" />
            <span className="block w-5 h-0.5 bg-text rounded-sm" />
          </button>
        </div>
      </nav>

      {/* ── Mobile overlay ── */}
      <div
        className={`fixed inset-0 z-[199] bg-text/40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile drawer ── */}
      <div
        id="mobileNav"
        className={`fixed top-0 right-0 bottom-0 z-[200] w-[min(360px,100vw)] bg-panel border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-5 h-[72px] border-b border-border flex-shrink-0">
          <span className="font-mono text-sm font-bold">
            <span className="text-text">HZ</span>
            <span className="text-accent">Sec</span>
          </span>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-md text-xl text-muted hover:bg-text/5 hover:text-text transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <div className="flex flex-col px-3 py-4 gap-1 flex-1 overflow-y-auto">
          {/* TODO: expand to sub-items or dedicated pages */}
          <a
            href="#"
            className="px-4 py-2.5 text-sm font-medium text-text rounded-md hover:text-accent hover:bg-accent/5 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Product
          </a>
          {/* TODO: expand to sub-items or dedicated pages */}
          <a
            href="#"
            className="px-4 py-2.5 text-sm font-medium text-text rounded-md hover:text-accent hover:bg-accent/5 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Solutions
          </a>
          <Link
            href="/docs"
            className="px-4 py-2.5 text-sm font-medium text-text rounded-md hover:text-accent hover:bg-accent/5 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Demo
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2.5 text-sm font-medium text-text rounded-md hover:text-accent hover:bg-accent/5 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/download"
            className="px-4 py-2.5 text-sm font-medium text-text rounded-md hover:text-accent hover:bg-accent/5 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Download
          </Link>
          <a
            href="mailto:hello@hzsec.io"
            className="px-4 py-2.5 text-sm font-medium text-text rounded-md hover:text-accent hover:bg-accent/5 transition-colors"
          >
            Contact
          </a>
        </div>
        <div className="flex flex-col gap-3 px-5 py-5 border-t border-border flex-shrink-0">
          {clerkKey ? (
            <SignedOut>
              <Link
                href="/login"
                className="flex justify-center items-center text-sm text-muted border border-border px-4 py-2.5 rounded-md hover:border-border hover:text-text transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            </SignedOut>
          ) : (
            <Link
              href="/login"
              className="flex justify-center items-center text-sm text-muted border border-border px-4 py-2.5 rounded-md hover:border-border hover:text-text transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
          )}
          <Link
            href="/pricing"
            className="flex justify-center items-center text-sm text-text border border-border px-4 py-2.5 rounded-md hover:border-accent hover:text-accent transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            View pricing
          </Link>
          <Link
            href="/download"
            className="flex justify-center items-center text-sm bg-accent text-white px-4 py-2.5 rounded-md hover:bg-accent/90 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Get early access
          </Link>
        </div>
      </div>
    </>
  );
}
