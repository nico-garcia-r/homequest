'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, ApiError } from '../../../lib/api';
import { useAuthStore } from '../../../lib/store';
import { useT } from '../../../lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const t = useT();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuth(res.token, res.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.login.errorFallback);
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
          <div className="ornament mt-3">{t.login.subtitle}</div>
        </div>

        <div className="card p-6 space-y-5">
          {error && <p className="error-banner">{error}</p>}

          <div>
            <label className="label">{t.login.emailLabel}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input"
              placeholder={t.login.emailPlaceholder}
            />
          </div>

          <div>
            <label className="label">{t.login.passwordLabel}</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t.login.submitLoading : t.login.submit}
          </button>
        </div>

        <p className="text-center font-lora text-sm text-ink-muted mt-5 italic">
          {t.login.noAccount}{' '}
          <Link
            href="/register"
            className="text-crimson hover:text-crimson-dark not-italic font-semibold underline underline-offset-2"
          >
            {t.login.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
