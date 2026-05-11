'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '../../../lib/store';
import { taskApi, pointsApi, achievementApi } from '../../../lib/api';
import type { TaskItem, RecurrenceType } from '../../../lib/api';
import { useT } from '../../../lib/i18n';

// ── Category display helper ───────────────────────────────────────────────────

const PRESET_KEYS = ['home', 'fitness', 'study', 'work', 'personal'] as const;
type PresetKey = (typeof PRESET_KEYS)[number];

function isPreset(cat: string): cat is PresetKey {
  return (PRESET_KEYS as readonly string[]).includes(cat);
}

// ── Group tasks by category ───────────────────────────────────────────────────

function groupByCategory(tasks: TaskItem[]): [string, TaskItem[]][] {
  const map = new Map<string, TaskItem[]>();
  for (const task of tasks) {
    const key = task.category ?? '__none__';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(task);
  }
  // Sort: preset categories first (in order), then custom, then uncategorized last
  const order = [...PRESET_KEYS, '__none__'];
  return [...map.entries()].sort(([a], [b]) => {
    const ia = order.indexOf(a as any);
    const ib = order.indexOf(b as any);
    const ra = ia === -1 ? order.length - 1 : ia;
    const rb = ib === -1 ? order.length - 1 : ib;
    return ra - rb;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, currentHouseholdId } = useAuthStore();
  const qc = useQueryClient();
  const t = useT();
  const isPersonal = !currentHouseholdId;

  // ── Points ──────────────────────────────────────────────────────────────────
  const { data: points } = useQuery({
    queryKey: ['points', user?.id],
    queryFn: () => pointsApi.get(user!.id),
    enabled: !!user,
  });

  // ── Tasks ───────────────────────────────────────────────────────────────────
  const { data: personalTasks } = useQuery({
    queryKey: ['tasks', 'mine'],
    queryFn: () => taskApi.mine(),
    enabled: isPersonal,
  });

  const { data: groupTasks } = useQuery({
    queryKey: ['tasks', currentHouseholdId],
    queryFn: () => taskApi.list(currentHouseholdId!),
    enabled: !!currentHouseholdId,
  });

  const tasks = isPersonal ? (personalTasks ?? []) : (groupTasks ?? []);

  // ── Activity ─────────────────────────────────────────────────────────────────
  const { data: personalActivity } = useQuery({
    queryKey: ['activity', 'mine'],
    queryFn: () => taskApi.myActivity(),
    enabled: isPersonal,
  });

  const { data: groupActivity } = useQuery({
    queryKey: ['activity', currentHouseholdId],
    queryFn: () => taskApi.activity(currentHouseholdId!),
    enabled: !!currentHouseholdId,
  });

  const activity = isPersonal ? personalActivity : groupActivity;

  // ── Complete mutation ────────────────────────────────────────────────────────
  const complete = useMutation({
    mutationFn: (taskId: string) => taskApi.complete(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', isPersonal ? 'mine' : currentHouseholdId] });
      qc.invalidateQueries({ queryKey: ['points', user?.id] });
      qc.invalidateQueries({ queryKey: ['activity', isPersonal ? 'mine' : currentHouseholdId] });
      if (user) achievementApi.check(user.id).catch(() => null);
    },
  });

  // ── Today's done set ─────────────────────────────────────────────────────────
  const todayDone = new Set(
    (activity ?? [])
      .filter(
        (a) =>
          new Date(a.completedAt).toDateString() === new Date().toDateString() &&
          a.userId === user?.id,
      )
      .map((a) => a.taskId),
  );

  // ── Daily progress ───────────────────────────────────────────────────────────
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => todayDone.has(t.id)).length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const allDone = totalTasks > 0 && doneTasks === totalTasks;

  // ── Grouped tasks ────────────────────────────────────────────────────────────
  const grouped = groupByCategory(tasks);

  // ── Category label helper ────────────────────────────────────────────────────
  function categoryLabel(key: string): string {
    if (key === '__none__') return t.dashboard.uncategorized;
    if (isPreset(key)) return t.categories[key];
    // Capitalise first letter of custom text
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  return (
    <div className="space-y-5">
      {/* ── Solo mode banner ─────────────────────────────────────────────────── */}
      {isPersonal && (
        <div className="card px-4 py-3 border-dashed flex items-center justify-between gap-3">
          <p className="font-lora text-xs text-ink-muted italic">{t.solo.banner}</p>
          <Link
            href="/group/setup"
            className="font-cinzel text-xs text-crimson uppercase tracking-widest hover:text-crimson-dark shrink-0"
          >
            {t.solo.joinGroup}
          </Link>
        </div>
      )}

      {/* ── Treasury card ────────────────────────────────────────────────────── */}
      <div className="bg-wood-dark border-4 border-gold rounded-medieval p-5 shadow-medieval-gold">
        <p className="section-title text-parchment/60 mb-1">{t.dashboard.treasuryTitle}</p>
        <p className="font-cinzel-decorative text-4xl text-gold-light leading-none">
          {points?.balance ?? 0}
          <span className="text-2xl ml-2 text-gold">🪙</span>
        </p>
        <p className="font-lora text-sm text-parchment/50 mt-2 italic">
          {t.dashboard.welcomePrefix} {user?.displayName}. {t.dashboard.welcomeSuffix}
        </p>
      </div>

      {/* ── Daily progress bar ───────────────────────────────────────────────── */}
      {totalTasks > 0 && (
        <div className="card px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-cinzel text-xs uppercase tracking-widest text-ink-muted">
              {t.dashboard.dailyProgress}
            </p>
            <p className="font-cinzel text-xs text-ink-muted">
              {allDone
                ? t.dashboard.allDone
                : t.dashboard.progressOf
                    .replace('{done}', String(doneTasks))
                    .replace('{total}', String(totalTasks))}
            </p>
          </div>
          <div className="h-2 bg-parchment-dark rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                allDone ? 'bg-forest' : 'bg-gold'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Today's Quests ───────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-cinzel text-base text-ink uppercase tracking-wide">
            {t.dashboard.questsTitle}
          </h2>
          <Link
            href="/tasks"
            className="font-cinzel text-xs text-crimson uppercase tracking-widest hover:text-crimson-dark"
          >
            {t.dashboard.viewAll}
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="card p-5 text-center">
            <p className="text-3xl mb-2">📜</p>
            <p className="font-lora text-sm text-ink-muted italic">{t.dashboard.questBoardEmpty}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([catKey, catTasks]) => (
              <div key={catKey}>
                {/* Category header */}
                <p className="font-cinzel text-xs uppercase tracking-widest text-ink-muted mb-1.5 pl-1">
                  {categoryLabel(catKey)}
                </p>
                <div className="space-y-1.5">
                  {catTasks.map((task) => {
                    const done = todayDone.has(task.id);
                    const isRecurring = (task.recurrenceType as RecurrenceType) !== 'NONE';
                    return (
                      <div
                        key={task.id}
                        className={`card p-3 flex items-center justify-between gap-3 transition-opacity ${done ? 'opacity-50' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p
                              className={`font-lora text-sm font-semibold ${done ? 'line-through text-ink-light' : 'text-ink'}`}
                            >
                              {task.title}
                            </p>
                            {isRecurring && (
                              <span
                                className="text-sm leading-none"
                                title={t.recurrence[task.recurrenceType as RecurrenceType]}
                              >
                                🔥
                              </span>
                            )}
                          </div>
                          <p className="font-cinzel text-xs text-gold-dark mt-0.5">
                            +{task.points} 🪙
                          </p>
                        </div>
                        {done ? (
                          <span className="text-forest text-lg shrink-0">⚜️</span>
                        ) : (
                          <button
                            onClick={() => complete.mutate(task.id)}
                            disabled={complete.isPending}
                            className="btn-gold btn-sm shrink-0"
                          >
                            {t.dashboard.claim}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Chronicle ────────────────────────────────────────────────────────── */}
      <div className="ornament">{t.dashboard.chronicle}</div>

      <section>
        {!activity?.length ? (
          <p className="font-lora text-sm text-ink-muted italic text-center">
            {t.dashboard.chronicleEmpty}
          </p>
        ) : (
          <div className="space-y-2">
            {activity.slice(0, 5).map((a) => (
              <div key={a.id} className="card p-3 flex items-center gap-3">
                <span className="text-xl shrink-0">⚔️</span>
                <div className="min-w-0">
                  <p className="font-lora text-sm text-ink">
                    {isPersonal ? (
                      <span className="italic">{a.taskTitle}</span>
                    ) : (
                      <>
                        <span className="font-semibold">{a.userDisplayName}</span>{' '}
                        {t.dashboard.claimed} <span className="italic">{a.taskTitle}</span>
                      </>
                    )}
                  </p>
                  <p className="font-lora text-xs text-ink-light mt-0.5">
                    {new Date(a.completedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
