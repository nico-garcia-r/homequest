'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/store';
import { householdApi, ApiError } from '../../../lib/api';
import { useT } from '../../../lib/i18n';

export default function GuildSetupPage() {
  const router = useRouter();
  const { user, setHousehold } = useAuthStore();
  const t = useT();
  const [tab, setTab] = useState<'found' | 'enlist'>('found');
  const [name, setName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ['my-households'],
    queryFn: () => householdApi.my(),
    enabled: !!user,
  });

  async function handleFound(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);
    try {
      const h = await householdApi.create(name.trim());
      setHousehold(h.id);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.setup.foundError);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnlist(e: React.FormEvent) {
    e.preventDefault();
    if (!joinId.trim()) return;
    setError('');
    setLoading(true);
    try {
      await householdApi.join(joinId.trim());
      setHousehold(joinId.trim());
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.setup.enlistError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚜️</div>
          <h1 className="font-cinzel-decorative text-3xl text-ink tracking-widest">HomeQuest</h1>
          <div className="ornament mt-3">{t.setup.subtitle}</div>
        </div>

        {/* Existing guilds */}
        {existing && existing.length > 0 && (
          <div className="card p-4 mb-5">
            <p className="section-title mb-3">{t.setup.existingTitle}</p>
            {existing.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setHousehold(h.id);
                  router.push('/dashboard');
                }}
                className="w-full text-left px-3 py-2 rounded-medieval hover:bg-parchment-dark font-cinzel text-sm text-crimson uppercase tracking-wide transition-colors"
              >
                🏰 {h.name}
              </button>
            ))}
          </div>
        )}

        <div className="card p-6">
          {/* Tab switcher */}
          <div className="flex border-2 border-wood-medium rounded-medieval overflow-hidden mb-5">
            {(['found', 'enlist'] as const).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => {
                  setTab(tabKey);
                  setError('');
                }}
                className={`flex-1 py-2 font-cinzel text-xs uppercase tracking-widest transition-colors ${
                  tab === tabKey
                    ? 'bg-wood-dark text-gold'
                    : 'text-ink-muted hover:bg-parchment-dark'
                }`}
              >
                {tabKey === 'found' ? t.setup.tabFound : t.setup.tabEnlist}
              </button>
            ))}
          </div>

          {error && <p className="error-banner mb-4">{error}</p>}

          {tab === 'found' && (
            <form onSubmit={handleFound} className="space-y-4">
              <div>
                <label className="label">{t.setup.guildNameLabel}</label>
                <input
                  type="text"
                  placeholder={t.setup.guildNamePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                />
              </div>
              <button
                type="submit"
                disabled={!name.trim() || loading}
                className="btn-primary w-full"
              >
                {loading ? t.setup.foundLoading : t.setup.foundSubmit}
              </button>
            </form>
          )}

          {tab === 'enlist' && (
            <form onSubmit={handleEnlist} className="space-y-4">
              <div>
                <label className="label">{t.setup.sigilLabel}</label>
                <input
                  type="text"
                  placeholder={t.setup.sigilPlaceholder}
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="input font-mono text-xs"
                />
                <p className="font-lora text-xs text-ink-light italic mt-1.5">
                  {t.setup.sigilHint}
                </p>
              </div>
              <button
                type="submit"
                disabled={!joinId.trim() || loading}
                className="btn-primary w-full"
              >
                {loading ? t.setup.enlistLoading : t.setup.enlistSubmit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
