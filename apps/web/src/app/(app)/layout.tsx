'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, type Locale } from '../../lib/store';
import { useT } from '../../lib/i18n';

function ShieldCrest() {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none" className="text-gold">
      <path
        d="M11 0L0 5V14C0 20.1 4.9 25.2 11 26C17.1 25.2 22 20.1 22 14V5L11 0Z"
        fill="#B8860B"
        opacity="0.3"
      />
      <path
        d="M11 2.5L2 7V14C2 19.1 5.9 23.7 11 24.5C16.1 23.7 20 19.1 20 14V7L11 2.5Z"
        fill="#B8860B"
        opacity="0.6"
      />
      <path d="M11 7L7.5 13H10.5V19L14.5 13H11.5L11 7Z" fill="#E8C84A" />
    </svg>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, locale, setLocale, logout } = useAuthStore();
  const t = useT();

  const LOCALES: { value: Locale; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'es', label: 'ES' },
  ];

  const NAV = [
    { href: '/dashboard', label: t.nav.keep, icon: '🏰' },
    { href: '/tasks', label: t.nav.quests, icon: '⚔️' },
    { href: '/rewards', label: t.nav.treasure, icon: '💰' },
    { href: '/achievements', label: t.nav.honours, icon: '🛡️' },
    { href: '/group', label: t.nav.guild, icon: '🏴' },
    { href: '/profile', label: t.nav.herald, icon: '📜' },
  ];

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="bg-wood-dark border-b-4 border-gold sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCrest />
            <span className="font-cinzel-decorative text-gold text-lg tracking-widest leading-none">
              HomeQuest
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div className="flex items-center border border-gold/30 rounded-medieval overflow-hidden">
              {LOCALES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setLocale(value)}
                  className={`px-2 py-0.5 font-cinzel text-[10px] uppercase tracking-widest transition-colors ${
                    locale === value
                      ? 'bg-gold text-wood-dark font-bold'
                      : 'text-parchment/40 hover:text-parchment/70'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <span className="font-lora text-sm text-parchment/60 hidden sm:block italic">
              {user.displayName}
            </span>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="font-cinzel text-xs uppercase tracking-widest text-parchment/50 hover:text-gold transition-colors"
            >
              {t.nav.depart}
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 animate-fade-in-up">
        {children}
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="bg-wood-dark border-t-4 border-gold sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto px-2 flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
