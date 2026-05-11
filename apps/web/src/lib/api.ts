const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hq_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const hasBody = options.body !== undefined && options.body !== null;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed', code: 'UNKNOWN' }));
    throw new ApiError(res.status, body.error ?? 'UNKNOWN', body.message ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'CUSTOM';
export type TaskScope = 'PERSONAL' | 'SHARED';

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  points: number;
  difficulty: Difficulty;
  category: string | null;
  scope: TaskScope;
  recurrenceType: RecurrenceType;
  recurrenceDays: string | null;
  createdById: string;
}

export interface ActivityItem {
  id: string;
  taskId: string;
  userId: string;
  taskTitle: string;
  userDisplayName: string;
  completedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; displayName: string }) =>
    request<{ token: string; user: { id: string; email: string; displayName: string } }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify(data) },
    ),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: { id: string; email: string; displayName: string } }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify(data) },
    ),

  me: () => request<{ user: { id: string; email: string; displayName: string } }>('/api/auth/me'),
};

// ─── Households ───────────────────────────────────────────────────────────────

export const householdApi = {
  create: (name: string) =>
    request<{ id: string; name: string }>('/api/households', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  join: (id: string) =>
    request<{ householdId: string; role: string }>(`/api/households/${id}/join`, {
      method: 'POST',
    }),

  get: (id: string) =>
    request<{
      id: string;
      name: string;
      members: Array<{ userId: string; displayName: string; email: string; role: string }>;
    }>(`/api/households/${id}`),

  my: () => request<Array<{ id: string; name: string }>>('/api/households/my'),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const taskApi = {
  /** Personal quests for the current user (no household needed) */
  mine: () => request<TaskItem[]>('/api/tasks/mine'),

  /** Personal activity feed */
  myActivity: () => request<ActivityItem[]>('/api/tasks/mine/activity'),

  /** Shared quests for a household */
  list: (householdId: string) => request<TaskItem[]>(`/api/households/${householdId}/tasks`),

  /** Activity feed for a household */
  activity: (householdId: string) =>
    request<ActivityItem[]>(`/api/households/${householdId}/activity`),

  /** Create a personal quest */
  createPersonal: (data: {
    title: string;
    description?: string;
    difficulty: Difficulty;
    category?: string;
    recurrenceType: RecurrenceType;
    recurrenceDays?: string;
  }) => request<TaskItem>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),

  /** Create a shared quest in a household */
  create: (
    householdId: string,
    data: {
      title: string;
      description?: string;
      difficulty?: Difficulty;
      category?: string;
      recurrenceType?: RecurrenceType;
      recurrenceDays?: string;
      scope?: TaskScope;
      // Legacy fields kept for backward compat
      points?: number;
      recurring?: boolean;
    },
  ) =>
    request<TaskItem>(`/api/households/${householdId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ difficulty: 'MEDIUM', recurrenceType: 'NONE', ...data }),
    }),

  complete: (taskId: string) =>
    request<{
      completionId: string;
      pointsEarned: number;
      streak: { current: number; best: number } | null;
    }>(`/api/tasks/${taskId}/complete`, { method: 'POST', body: '{}' }),
};

// ─── Points ───────────────────────────────────────────────────────────────────

export const pointsApi = {
  get: (userId: string) =>
    request<{
      balance: number;
      history: Array<{ id: string; amount: number; reason: string; createdAt: string }>;
    }>(`/api/users/${userId}/points`),
};

// ─── Rewards ──────────────────────────────────────────────────────────────────

export const rewardApi = {
  list: (householdId: string) =>
    request<Array<{ id: string; title: string; description: string | null; pointCost: number }>>(
      `/api/households/${householdId}/rewards`,
    ),

  create: (householdId: string, data: { title: string; description?: string; pointCost: number }) =>
    request<{ id: string; title: string; pointCost: number }>(
      `/api/households/${householdId}/rewards`,
      { method: 'POST', body: JSON.stringify(data) },
    ),

  redeem: (rewardId: string) =>
    request<{ redemptionId: string; pointsSpent: number; newBalance: number }>(
      `/api/rewards/${rewardId}/redeem`,
      { method: 'POST', body: '{}' },
    ),
};

// ─── Achievements ─────────────────────────────────────────────────────────────

export const achievementApi = {
  get: (userId: string) =>
    request<
      Array<{
        id: string;
        title: string;
        description: string;
        badgeIcon: string | null;
        isUnlocked: boolean;
        progress: number;
        conditionValue: number;
        unlockedAt: string | null;
      }>
    >(`/api/users/${userId}/achievements`),

  check: (userId: string) =>
    request<{ newlyUnlocked: Array<{ id: string; title: string; badgeIcon: string | null }> }>(
      `/api/users/${userId}/achievements/check`,
      { method: 'POST', body: '{}' },
    ),
};

export { ApiError };
