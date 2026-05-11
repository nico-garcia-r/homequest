'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/store';
import { achievementApi } from '../../../lib/api';
import { useT } from '../../../lib/i18n';

export default function HonoursPage() {
  const { user } = useAuthStore();
  const t = useT();

  const { data, isLoading } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => achievementApi.get(user!.id),
    enabled: !!user,
  });

  const unlocked = data?.filter((a) => a.isUnlocked) ?? [];
  const locked = data?.filter((a) => !a.isUnlocked) ?? [];

  return (
    <div className="space-y-5">
      <h1 className="font-cinzel text-xl text-ink uppercase tracking-wide">
        {t.achievements.title}
      </h1>

      {isLoading && (
        <p className="font-lora text-sm text-ink-muted italic text-center py-8">
          {t.achievements.loading}
        </p>
      )}

      {/* ── Bestowed honours ── */}
      {unlocked.length > 0 && (
        <section>
          <div className="ornament">
            {t.achievements.bestowed} ({unlocked.length})
          </div>
          <div className="grid grid-cols-2 gap-3">
            {unlocked.map((a) => (
              <div key={a.id} className="card-gold p-4 text-center animate-fade-in-up">
                <p className="text-4xl leading-none">{a.badgeIcon ?? '🛡️'}</p>
                <p className="font-cinzel text-xs uppercase tracking-wide text-ink mt-2 leading-tight">
                  {a.title}
                </p>
                <p className="font-lora text-xs text-ink-muted italic mt-1">{a.description}</p>
                {a.unlockedAt && (
                  <p className="font-cinzel text-[10px] text-forest uppercase tracking-widest mt-2">
                    ⚜️ {new Date(a.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Quests for glory ── */}
      {locked.length > 0 && (
        <section>
          <div className="ornament">{t.achievements.forGlory}</div>
          <div className="grid grid-cols-2 gap-3">
            {locked.map((a) => (
              <div key={a.id} className="card p-4 text-center opacity-70">
                <p className="text-4xl leading-none grayscale">{a.badgeIcon ?? '🛡️'}</p>
                <p className="font-cinzel text-xs uppercase tracking-wide text-ink-muted mt-2 leading-tight">
                  {a.title}
                </p>
                <p className="font-lora text-xs text-ink-light italic mt-1">{a.description}</p>
                {/* Progress bar */}
                <div className="progress-bar mt-3">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, (a.progress / a.conditionValue) * 100)}%` }}
                  />
                </div>
                <p className="font-cinzel text-[10px] text-ink-light uppercase tracking-widest mt-1">
                  {a.progress} / {a.conditionValue}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isLoading && !data?.length && (
        <div className="empty-state card p-10">
          <span className="text-5xl">🛡️</span>
          <p className="font-cinzel text-sm uppercase tracking-widest text-ink-muted">
            {t.achievements.emptyTitle}
          </p>
          <p className="font-lora text-sm text-ink-light italic">{t.achievements.emptySubtitle}</p>
        </div>
      )}
    </div>
  );
}
