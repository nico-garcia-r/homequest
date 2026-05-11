'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/store';
import { taskApi, achievementApi } from '../../../lib/api';
import type { Difficulty, RecurrenceType, TaskScope } from '../../../lib/api';
import { useT } from '../../../lib/i18n';

// ── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES: { key: Difficulty; points: number }[] = [
  { key: 'EASY', points: 10 },
  { key: 'MEDIUM', points: 25 },
  { key: 'HARD', points: 50 },
  { key: 'EPIC', points: 100 },
];

const RECURRENCES: RecurrenceType[] = ['NONE', 'DAILY', 'WEEKDAYS', 'WEEKLY', 'CUSTOM'];

const DAY_KEYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

const PRESET_CATEGORIES = ['home', 'fitness', 'study', 'work', 'personal', 'custom'] as const;

const DIFFICULTY_BG: Record<Difficulty, string> = {
  EASY: 'bg-forest/10 text-forest border-forest',
  MEDIUM: 'bg-gold/20 text-gold-dark border-gold-dark',
  HARD: 'bg-crimson/10 text-crimson border-crimson',
  EPIC: 'bg-purple-100 text-purple-700 border-purple-400',
};

// ── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  description: string;
  difficulty: Difficulty;
  recurrenceType: RecurrenceType;
  recurrenceDays: string[];
  category: string;
  customCategory: string;
  scope: TaskScope;
};

const defaultForm: FormState = {
  title: '',
  description: '',
  difficulty: 'MEDIUM',
  recurrenceType: 'NONE',
  recurrenceDays: [],
  category: 'personal',
  customCategory: '',
  scope: 'PERSONAL',
};

// ── Component ────────────────────────────────────────────────────────────────

export default function QuestsPage() {
  const { user, currentHouseholdId } = useAuthStore();
  const qc = useQueryClient();
  const t = useT();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'personal' | 'group'>('personal');
  const [lastStreak, setLastStreak] = useState<{ current: number; best: number } | null>(null);

  const hasGroup = !!currentHouseholdId;

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: personalTasks, isLoading: loadingPersonal } = useQuery({
    queryKey: ['tasks', 'mine'],
    queryFn: () => taskApi.mine(),
    enabled: !!user,
  });

  const { data: groupTasks, isLoading: loadingGroup } = useQuery({
    queryKey: ['tasks', currentHouseholdId],
    queryFn: () => taskApi.list(currentHouseholdId!),
    enabled: !!currentHouseholdId,
  });

  const { data: personalActivity } = useQuery({
    queryKey: ['activity', 'mine'],
    queryFn: () => taskApi.myActivity(),
    enabled: !!user,
  });

  const { data: groupActivity } = useQuery({
    queryKey: ['activity', currentHouseholdId],
    queryFn: () => taskApi.activity(currentHouseholdId!),
    enabled: !!currentHouseholdId,
  });

  const tasks = tab === 'personal' ? personalTasks : groupTasks;
  const activity = tab === 'personal' ? personalActivity : groupActivity;
  const isLoading = tab === 'personal' ? loadingPersonal : loadingGroup;

  // ── Today done set ─────────────────────────────────────────────────────────

  const todayDone = new Set(
    (activity ?? [])
      .filter(
        (a) =>
          new Date(a.completedAt).toDateString() === new Date().toDateString() &&
          a.userId === user?.id,
      )
      .map((a) => a.taskId),
  );

  // ── Mutations ──────────────────────────────────────────────────────────────

  const complete = useMutation({
    mutationFn: (taskId: string) => taskApi.complete(taskId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tasks', 'mine'] });
      qc.invalidateQueries({ queryKey: ['activity', 'mine'] });
      if (currentHouseholdId) {
        qc.invalidateQueries({ queryKey: ['tasks', currentHouseholdId] });
        qc.invalidateQueries({ queryKey: ['activity', currentHouseholdId] });
      }
      qc.invalidateQueries({ queryKey: ['points', user?.id] });
      if (user) achievementApi.check(user.id).catch(() => null);
      if (res?.streak) setLastStreak(res.streak);
    },
  });

  const resolvedCategory = form.category === 'custom' ? form.customCategory.trim() : form.category;

  const create = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        difficulty: form.difficulty,
        recurrenceType: form.recurrenceType,
        recurrenceDays:
          form.recurrenceType === 'CUSTOM' ? form.recurrenceDays.join(',') : undefined,
        category: resolvedCategory || undefined,
      };
      // Route: SHARED tasks with a household → household endpoint; everything else → personal endpoint
      if (hasGroup && form.scope === 'SHARED') {
        return taskApi.create(currentHouseholdId!, { ...payload, scope: 'SHARED' });
      }
      return taskApi.createPersonal(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', 'mine'] });
      if (currentHouseholdId) qc.invalidateQueries({ queryKey: ['tasks', currentHouseholdId] });
      setForm(defaultForm);
      setShowForm(false);
      setError('');
    },
    onError: (e: Error) => setError(e.message),
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      recurrenceDays: f.recurrenceDays.includes(day)
        ? f.recurrenceDays.filter((d) => d !== day)
        : [...f.recurrenceDays, day],
    }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="font-cinzel text-xl text-ink uppercase tracking-wide">{t.tasks.title}</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary btn-sm">
          {t.tasks.addButton}
        </button>
      </div>

      {/* ── Streak toast ───────────────────────────────────────────────────── */}
      {lastStreak && (
        <div
          className="card p-3 bg-amber-50 border border-gold text-center animate-fade-in-up cursor-pointer"
          onClick={() => setLastStreak(null)}
        >
          <p className="font-cinzel text-sm text-gold-dark">
            {t.tasks.streakMsg
              .replace('{current}', String(lastStreak.current))
              .replace('{best}', String(lastStreak.best))}
          </p>
        </div>
      )}

      {/* ── New quest form ──────────────────────────────────────────────────── */}
      {showForm && (
        <div className="card p-5 space-y-5 animate-fade-in-up">
          <h2 className="font-cinzel text-sm uppercase tracking-widest text-ink">
            {t.tasks.formTitle}
          </h2>
          {error && <p className="error-banner">{error}</p>}

          {/* Title */}
          <div>
            <label className="label">{t.tasks.questNameLabel}</label>
            <input
              type="text"
              placeholder={t.tasks.questNamePlaceholder}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">{t.tasks.questDetailsLabel}</label>
            <input
              type="text"
              placeholder={t.tasks.questDetailsPlaceholder}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input"
            />
          </div>

          {/* Category chips */}
          <div>
            <label className="label">{t.tasks.categoryLabel}</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: cat }))}
                  className={`px-3 py-1.5 rounded-full border font-cinzel text-xs uppercase tracking-wide transition-colors ${
                    form.category === cat
                      ? 'bg-ink text-parchment border-ink'
                      : 'bg-transparent text-ink-muted border-ink-muted/40 hover:border-ink-muted'
                  }`}
                >
                  {t.categories[cat as keyof typeof t.categories]}
                </button>
              ))}
            </div>
            {form.category === 'custom' && (
              <input
                type="text"
                placeholder={t.tasks.customCategoryPlaceholder}
                value={form.customCategory}
                onChange={(e) => setForm((f) => ({ ...f, customCategory: e.target.value }))}
                className="input mt-2"
              />
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="label">{t.tasks.difficultyLabel}</label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map(({ key, points }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, difficulty: key }))}
                  className={`py-2 rounded-lg border-2 text-center transition-colors ${
                    form.difficulty === key
                      ? DIFFICULTY_BG[key] + ' font-semibold'
                      : 'border-ink-muted/30 text-ink-muted hover:border-ink-muted/60'
                  }`}
                >
                  <div className="font-cinzel text-xs uppercase">{t.difficulty[key]}</div>
                  <div className="font-cinzel text-[10px] text-gold-dark mt-0.5">{points}🪙</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="label">{t.tasks.recurrenceLabel}</label>
            <div className="flex flex-wrap gap-2">
              {RECURRENCES.map((rec) => (
                <button
                  key={rec}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, recurrenceType: rec, recurrenceDays: [] }))
                  }
                  className={`px-3 py-1.5 rounded-full border font-cinzel text-xs uppercase tracking-wide transition-colors ${
                    form.recurrenceType === rec
                      ? 'bg-ink text-parchment border-ink'
                      : 'bg-transparent text-ink-muted border-ink-muted/40 hover:border-ink-muted'
                  }`}
                >
                  {t.recurrence[rec]}
                </button>
              ))}
            </div>

            {/* Custom day picker */}
            {form.recurrenceType === 'CUSTOM' && (
              <div className="mt-3">
                <p className="label mb-1">{t.tasks.daysLabel}</p>
                <div className="flex gap-1.5">
                  {DAY_KEYS.map((day) => {
                    const active = form.recurrenceDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`w-9 h-9 rounded-full border-2 font-cinzel text-xs transition-colors ${
                          active
                            ? 'bg-ink text-parchment border-ink'
                            : 'border-ink-muted/30 text-ink-muted hover:border-ink-muted/60'
                        }`}
                      >
                        {t.days[day]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Scope (only shown when user has a group) */}
          {hasGroup && (
            <div>
              <label className="label">{t.tasks.scopeLabel}</label>
              <div className="flex gap-2">
                {(['PERSONAL', 'SHARED'] as TaskScope[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, scope: s }))}
                    className={`flex-1 py-2 rounded-lg border-2 font-cinzel text-xs uppercase tracking-wide transition-colors ${
                      form.scope === s
                        ? 'bg-ink text-parchment border-ink'
                        : 'border-ink-muted/30 text-ink-muted hover:border-ink-muted/60'
                    }`}
                  >
                    {t.scope[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => create.mutate()}
              disabled={!form.title || create.isPending}
              className="btn-primary flex-1"
            >
              {create.isPending ? t.tasks.submitLoading : t.tasks.submit}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">
              {t.tasks.withdraw}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab switcher (only shown when user has a group) ──────────────────── */}
      {hasGroup && (
        <div className="flex gap-1 p-1 bg-parchment-dark rounded-lg">
          {(['personal', 'group'] as const).map((t_key) => (
            <button
              key={t_key}
              onClick={() => setTab(t_key)}
              className={`flex-1 py-1.5 rounded-md font-cinzel text-xs uppercase tracking-widest transition-colors ${
                tab === t_key ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t_key === 'personal' ? t.tasks.tabPersonal : t.tasks.tabGroup}
            </button>
          ))}
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {isLoading && (
        <p className="font-lora text-sm text-ink-muted italic text-center py-8">
          {t.tasks.loading}
        </p>
      )}

      {/* ── Empty ───────────────────────────────────────────────────────────── */}
      {!isLoading && !tasks?.length && (
        <div className="empty-state card p-10">
          <span className="text-5xl">📜</span>
          <p className="font-cinzel text-sm uppercase tracking-widest text-ink-muted">
            {t.tasks.emptyTitle}
          </p>
          <p className="font-lora text-sm text-ink-light italic">{t.tasks.emptySubtitle}</p>
        </div>
      )}

      {/* ── Quest list ──────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        {tasks?.map((task) => {
          const done = todayDone.has(task.id);
          const difficulty = (task.difficulty ?? 'MEDIUM') as Difficulty;
          const recurrence = (task.recurrenceType ?? 'NONE') as RecurrenceType;
          const isRecurring = recurrence !== 'NONE';

          return (
            <div
              key={task.id}
              className={`card p-4 flex items-start justify-between gap-3 transition-opacity ${done ? 'opacity-50' : ''}`}
            >
              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`font-lora font-semibold text-sm ${done ? 'line-through text-ink-light' : 'text-ink'}`}
                  >
                    {task.title}
                  </p>
                  {/* Difficulty badge */}
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-cinzel uppercase ${DIFFICULTY_BG[difficulty]}`}
                  >
                    {t.difficulty[difficulty]}
                  </span>
                  {/* Recurrence badge */}
                  {isRecurring && (
                    <span className="badge-ink text-[10px]">{t.recurrence[recurrence]}</span>
                  )}
                </div>

                {/* Category */}
                {task.category && (
                  <p className="font-lora text-[11px] text-ink-muted italic mt-0.5">
                    {task.category}
                  </p>
                )}

                {/* Description */}
                {task.description && (
                  <p className="font-lora text-xs text-ink-muted italic mt-0.5 truncate">
                    {task.description}
                  </p>
                )}

                <p className="font-cinzel text-xs text-gold-dark mt-1">+{task.points} 🪙</p>
              </div>

              {/* Action */}
              <div className="shrink-0">
                {done ? (
                  <span className="text-forest text-xl">⚜️</span>
                ) : (
                  <button
                    onClick={() => complete.mutate(task.id)}
                    disabled={complete.isPending}
                    className="btn-gold btn-sm"
                  >
                    {t.tasks.claim}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
