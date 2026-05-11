'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/store';
import { rewardApi, pointsApi, ApiError } from '../../../lib/api';
import { useT } from '../../../lib/i18n';

export default function TreasuresPage() {
  const { user, currentHouseholdId } = useAuthStore();
  const qc = useQueryClient();
  const t = useT();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', pointCost: 50 });
  const [error, setError] = useState('');
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards', currentHouseholdId],
    queryFn: () => rewardApi.list(currentHouseholdId!),
    enabled: !!currentHouseholdId,
  });

  const { data: points } = useQuery({
    queryKey: ['points', user?.id],
    queryFn: () => pointsApi.get(user!.id),
    enabled: !!user,
  });

  const create = useMutation({
    mutationFn: (data: typeof form) =>
      rewardApi.create(currentHouseholdId!, {
        ...data,
        description: data.description || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rewards', currentHouseholdId] });
      setForm({ title: '', description: '', pointCost: 50 });
      setShowForm(false);
      setError('');
    },
    onError: (e: Error) => setError(e.message),
  });

  const redeem = useMutation({
    mutationFn: (rewardId: string) => rewardApi.redeem(rewardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['points', user?.id] });
      setRedeemError(null);
    },
    onError: (e: Error) => {
      setRedeemError(e instanceof ApiError ? e.message : e.message);
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-cinzel text-xl text-ink uppercase tracking-wide">{t.rewards.title}</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary btn-sm">
          {t.rewards.addButton}
        </button>
      </div>

      {/* ── Treasury balance ── */}
      <div className="card-gold p-4 flex items-center justify-between">
        <span className="font-cinzel text-xs uppercase tracking-widest text-ink-muted">
          {t.rewards.balanceLabel}
        </span>
        <span className="font-cinzel text-lg text-gold-dark font-bold">
          {points?.balance ?? 0} 🪙
        </span>
      </div>

      {redeemError && <p className="error-banner">{redeemError}</p>}

      {/* ── New reward form ── */}
      {showForm && (
        <div className="card p-5 space-y-4 animate-fade-in-up">
          <h2 className="font-cinzel text-sm uppercase tracking-widest text-ink">
            {t.rewards.formTitle}
          </h2>
          {error && <p className="error-banner">{error}</p>}

          <div>
            <label className="label">{t.rewards.nameLabel}</label>
            <input
              type="text"
              placeholder={t.rewards.namePlaceholder}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t.rewards.descLabel}</label>
            <input
              type="text"
              placeholder={t.rewards.descPlaceholder}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t.rewards.costLabel}</label>
            <input
              type="number"
              min={1}
              value={form.pointCost}
              onChange={(e) =>
                setForm((f) => ({ ...f, pointCost: parseInt(e.target.value) || 50 }))
              }
              className="input"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => create.mutate(form)}
              disabled={!form.title || create.isPending}
              className="btn-primary flex-1"
            >
              {create.isPending ? t.rewards.submitLoading : t.rewards.submit}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">
              {t.rewards.withdraw}
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <p className="font-lora text-sm text-ink-muted italic text-center py-8">
          {t.rewards.loading}
        </p>
      )}

      {!isLoading && !rewards?.length && (
        <div className="empty-state card p-10">
          <span className="text-5xl">🗝️</span>
          <p className="font-cinzel text-sm uppercase tracking-widest text-ink-muted">
            {t.rewards.emptyTitle}
          </p>
          <p className="font-lora text-sm text-ink-light italic">{t.rewards.emptySubtitle}</p>
        </div>
      )}

      <div className="space-y-2">
        {rewards?.map((reward) => {
          const canAfford = (points?.balance ?? 0) >= reward.pointCost;
          return (
            <div key={reward.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-lora font-semibold text-sm text-ink">{reward.title}</p>
                {reward.description && (
                  <p className="font-lora text-xs text-ink-muted italic mt-0.5">
                    {reward.description}
                  </p>
                )}
                <p className="font-cinzel text-sm text-gold-dark font-bold mt-1">
                  {reward.pointCost} 🪙
                </p>
              </div>
              <button
                onClick={() => {
                  setRedeemError(null);
                  redeem.mutate(reward.id);
                }}
                disabled={!canAfford || redeem.isPending}
                className={`btn-sm shrink-0 ${canAfford ? 'btn-gold' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
              >
                {canAfford ? t.rewards.claim : t.rewards.insufficient}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
