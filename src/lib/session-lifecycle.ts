import type { User } from '../store/authStore';

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

const SUPPORT_USER_KEY = 'admin_user';
const SUPPORT_ACCESS_TOKEN_KEY = 'admin_access_token';
const SUPPORT_REFRESH_TOKEN_KEY = 'admin_refresh_token';
const SUPPORT_CONTEXT_KEY = 'admin_support_session';

const SUPPORT_KEYS = [
  SUPPORT_USER_KEY,
  SUPPORT_ACCESS_TOKEN_KEY,
  SUPPORT_REFRESH_TOKEN_KEY,
  SUPPORT_CONTEXT_KEY,
] as const;

interface SupportSessionContext {
  flowId: string;
  adminUserId: string;
  impersonatedRestaurantId: string;
  expiresAt: number;
}

export interface SupportSessionBackup {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface SaveSupportSessionInput extends SupportSessionBackup {
  flowId: string;
  impersonatedRestaurantId: string;
  expiresAt: number;
}

type SessionTeardown = () => void;
const sessionTeardowns = new Set<SessionTeardown>();

export function registerSessionTeardown(teardown: SessionTeardown): () => void {
  sessionTeardowns.add(teardown);
  return () => sessionTeardowns.delete(teardown);
}

export function clearSupportSession(storage: StorageLike): void {
  for (const key of SUPPORT_KEYS) storage.removeItem(key);
}

export function teardownFrontendSession(storage: StorageLike): void {
  try {
    clearSupportSession(storage);
  } finally {
    for (const teardown of sessionTeardowns) teardown();
  }
}

export function saveSupportSession(
  storage: StorageLike,
  input: SaveSupportSessionInput,
): void {
  clearSupportSession(storage);
  storage.setItem(SUPPORT_USER_KEY, JSON.stringify(input.user));
  storage.setItem(SUPPORT_ACCESS_TOKEN_KEY, input.accessToken);
  storage.setItem(SUPPORT_REFRESH_TOKEN_KEY, input.refreshToken);
  storage.setItem(
    SUPPORT_CONTEXT_KEY,
    JSON.stringify({
      flowId: input.flowId,
      adminUserId: input.user.id,
      impersonatedRestaurantId: input.impersonatedRestaurantId,
      expiresAt: input.expiresAt,
    } satisfies SupportSessionContext),
  );
}

export function getValidSupportSession(
  storage: StorageLike,
  activeUser: User | null,
  now = Date.now(),
): SupportSessionBackup | null {
  if (!activeUser?.supportSessionId || activeUser.role !== 'RESTAURANT_OWNER') return null;

  try {
    const rawUser = storage.getItem(SUPPORT_USER_KEY);
    const accessToken = storage.getItem(SUPPORT_ACCESS_TOKEN_KEY);
    const refreshToken = storage.getItem(SUPPORT_REFRESH_TOKEN_KEY);
    const rawContext = storage.getItem(SUPPORT_CONTEXT_KEY);
    if (!rawUser || !accessToken || !refreshToken || !rawContext) return null;

    const user = JSON.parse(rawUser) as User;
    const context = JSON.parse(rawContext) as SupportSessionContext;
    const activeRestaurantId = activeUser.restaurants[0]?.id;

    if (
      user.role !== 'SUPER_ADMIN' ||
      !user.id ||
      context.adminUserId !== user.id ||
      context.flowId !== activeUser.supportSessionId ||
      context.impersonatedRestaurantId !== activeRestaurantId ||
      !Number.isFinite(context.expiresAt) ||
      context.expiresAt <= now
    ) {
      return null;
    }

    return { user, accessToken, refreshToken };
  } catch {
    return null;
  }
}

export function clearInvalidSupportSession(
  storage: StorageLike,
  activeUser: User | null,
): void {
  const hasSupportState = SUPPORT_KEYS.some((key) => storage.getItem(key) !== null);
  if (hasSupportState && !getValidSupportSession(storage, activeUser)) {
    clearSupportSession(storage);
  }
}
