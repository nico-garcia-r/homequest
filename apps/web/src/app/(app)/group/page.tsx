'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '../../../lib/store';
import { householdApi } from '../../../lib/api';
import { useT } from '../../../lib/i18n';

export default function GuildPage() {
  const { user, currentHouseholdId } = useAuthStore();
  const t = useT();

  const { data: guild, isLoading } = useQuery({
    queryKey: ['household', currentHouseholdId],
    queryFn: () => householdApi.get(currentHouseholdId!),
    enabled: !!currentHouseholdId,
  });

  const me = guild?.members.find((m) => m.userId === user?.id);
  const isAdmin = me?.role === 'ADMIN';

  const memberCount = guild?.members.length ?? 0;
  const knightLabel = memberCount === 1 ? t.group.knight : t.group.knights;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-cinzel text-xl text-ink uppercase tracking-wide">{t.group.title}</h1>
        <Link
          href="/group/setup"
          className="font-cinzel text-xs text-crimson uppercase tracking-widest hover:text-crimson-dark"
        >
          {t.group.changeGuild}
        </Link>
      </div>

      {isLoading && (
        <p className="font-lora text-sm text-ink-muted italic text-center py-8">
          {t.group.loading}
        </p>
      )}

      {guild && (
        <>
          {/* Guild info */}
          <div className="card p-5">
            <p className="label">{t.group.guildNameLabel}</p>
            <p className="font-cinzel text-lg text-ink leading-tight">{guild.name}</p>
            <div className="flex items-center gap-2 mt-2">
              {isAdmin && <span className="badge-crimson">{t.group.guildmaster}</span>}
              <span className="badge-ink">
                {memberCount} {knightLabel}
              </span>
            </div>
          </div>

          {/* Company roster */}
          <div className="card p-5">
            <div className="ornament">{t.group.company}</div>
            <div className="space-y-3">
              {guild.members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between">
                  <div>
                    <p className="font-lora font-semibold text-sm text-ink">{member.displayName}</p>
                    <p className="font-lora text-xs text-ink-light italic">{member.email}</p>
                  </div>
                  <span className={member.role === 'ADMIN' ? 'badge-crimson' : 'badge-ink'}>
                    {member.role === 'ADMIN' ? t.group.guildmaster : t.group.knightRole}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Guild sigil (ID) */}
          <div className="card p-4 bg-wood-dark/5 border-dashed">
            <p className="label">{t.group.sigilLabel}</p>
            <p className="font-mono text-xs text-ink-muted break-all bg-parchment-dark/50 p-2 rounded-medieval mt-1">
              {guild.id}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
