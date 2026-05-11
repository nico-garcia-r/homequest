'use client';
import { useAuthStore, type Locale } from '../../../lib/store';
import { useT } from '../../../lib/i18n';

const LOCALES: { value: Locale; flag: string }[] = [
  { value: 'en', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { value: 'es', flag: '🇪🇸' },
];

export default function ProfilePage() {
  const { user, locale, setLocale } = useAuthStore();
  const t = useT();

  return (
    <div className="space-y-5">
      <h1 className="font-cinzel text-xl text-ink uppercase tracking-wide">{t.profile.title}</h1>

      {/* ── Identity ── */}
      <div className="card p-5 space-y-4">
        <div>
          <p className="label">{t.profile.nameLabel}</p>
          <p className="font-lora font-semibold text-ink">{user?.displayName}</p>
        </div>
        <div>
          <p className="label">{t.profile.emailLabel}</p>
          <p className="font-lora text-sm text-ink-muted italic">{user?.email}</p>
        </div>
      </div>

      {/* ── Language ── */}
      <div className="card p-5">
        <div className="ornament mb-4">{t.profile.languageTitle}</div>
        <div className="flex gap-3">
          {LOCALES.map(({ value, flag }) => {
            const label = value === 'en' ? t.profile.langEn : t.profile.langEs;
            const active = locale === value;
            return (
              <button
                key={value}
                onClick={() => setLocale(value)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-medieval border-2 transition-all font-cinzel text-xs uppercase tracking-widest ${
                  active
                    ? 'border-gold bg-wood-dark text-gold shadow-medieval-gold'
                    : 'border-wood-medium text-ink-muted hover:border-gold/50 hover:bg-parchment-dark'
                }`}
              >
                <span className="text-3xl leading-none">{flag}</span>
                <span>{label}</span>
                {active && <span className="text-[10px] text-gold/70">⚜️ active</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
