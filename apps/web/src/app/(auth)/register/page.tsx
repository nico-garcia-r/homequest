'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, ApiError } from '../../../lib/api';
import { useAuthStore } from '../../../lib/store';
import { useT } from '../../../lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const t = useT();
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register(form);
      setAuth(res.token, res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.register.errorFallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Crest */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚜️</div>
          <h1 className="font-cinzel-decorative text-3xl text-ink tracking-widest">HomeQuest</h1>
          <div className="ornament mt-3">{t.register.subtitle}</div>
        </div>

        <div className="card p-6 space-y-5">
          {error && <p className="error-banner">{error}</p>}

          <div>
            <label className="label">{t.register.nameLabel}</label>
            <input
              type="text"
              required
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className="input"
              placeholder={t.register.namePlaceholder}
            />
          </div>

          <div>
            <label className="label">{t.register.emailLabel}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input"
              placeholder={t.register.emailPlaceholder}
            />
          </div>

          <div>
            <label className="label">{t.register.passwordLabel}</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input"
              placeholder={t.register.passwordPlaceholder}
            />
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t.register.submitLoading : t.register.submit}
          </button>
        </div>

        <p className="text-center font-lora text-sm text-ink-muted mt-5 italic">
          {t.register.hasAccount}{' '}
          <Link
            href="/login"
            className="text-crimson hover:text-crimson-dark not-italic font-semibold underline underline-offset-2"
          >
            {t.register.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
