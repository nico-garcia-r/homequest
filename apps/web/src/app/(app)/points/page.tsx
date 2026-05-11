'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/store';
import { pointsApi } from '../../../lib/api';
import { useT } from '../../../lib/i18n';

export default function GoldLedgerPage() {
  const { user } = useAuthStore();
  const t = useT();

  const { data, isLoading } = useQuery({
    queryKey: ['points', user?.id],
    queryFn: () => pointsApi.get(user!.id),
    enabled: !!user,
  });

  return (
    <div className="space-y-5">
      <h1 className="font-cinzel text-xl text-ink uppercase tracking-wide">{t.points.title}</h1>

      {/* Treasury hero */}
      <div className="bg-wood-dark border-4 border-gold rounded-medieval p-5 shadow-medieval-gold">
        <p className="font-cinzel text-xs uppercase tracking-widest text-parchment/50 mb-1">
          {t.points.balanceLabel}
        </p>
        <p className="font-cinzel-decorative text-5xl text-gold-light leading-none">
          {data?.balance ?? 0}
          <span className="text-3xl ml-2">🪙</span>
        </p>
      </div>

      <div className="ornament">{t.points.ledgerTitle}</div>

      {isLoading && (
        <p className="font-lora text-sm text-ink-muted italic text-center py-8">
          {t.points.loading}
        </p>
      )}

      {!isLoading && !data?.history.length && (
        <div className="empty-state card p-10">
          <span className="text-5xl">📜</span>
          <p className="font-lora text-sm text-ink-muted italic">{t.points.empty}</p>
        </div>
      )}

      <div className="space-y-2">
        {data?.history.map((entry) => (
          <div key={entry.id} className="card px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-lora text-sm text-ink">{entry.reason}</p>
              <p className="font-lora text-xs text-ink-light italic mt-0.5">
                {new Date(entry.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`font-cinzel font-bold text-base shrink-0 ${entry.amount > 0 ? 'text-forest' : 'text-crimson'}`}
            >
              {entry.amount > 0 ? '+' : ''}
              {entry.amount} 🪙
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
