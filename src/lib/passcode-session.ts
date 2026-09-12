import type { User } from '../store/authStore';
import { clearPasscodeSessions, type StorageLike } from './session-lifecycle';

export type ProtectedSection = 'analytics' | 'subscription' | 'settings';

const PASSCODE_PREFIX = 'ordio_passcode_verified:';
const PASSCODE_TTL_MS = 30 * 60 * 1000;

interface PasscodeVerification {
  userId: string;
  restaurantId: string;
  section: ProtectedSection;
  expiresAt: number;
}

const keyFor = (section: ProtectedSection) => `${PASSCODE_PREFIX}${section}`;

export { clearPasscodeSessions };

export function savePasscodeVerification(
  storage: StorageLike,
  user: User,
  section: ProtectedSection,
  now = Date.now(),
): void {
  const restaurantId = user.restaurants[0]?.id;
  if (!restaurantId) throw new Error('A restaurant is required to verify this section.');
  storage.setItem(keyFor(section), JSON.stringify({
    userId: user.id,
    restaurantId,
    section,
    expiresAt: now + PASSCODE_TTL_MS,
  } satisfies PasscodeVerification));
}

export function hasValidPasscodeVerification(
  storage: StorageLike,
  user: User | null,
  section: ProtectedSection,
  now = Date.now(),
): boolean {
  const key = keyFor(section);
  try {
    storage.removeItem('ordio_passcode_verified');
    const raw = storage.getItem(key);
    const restaurantId = user?.restaurants[0]?.id;
    if (!raw || !user || !restaurantId) return false;
    const verification = JSON.parse(raw) as PasscodeVerification;
    const valid = verification.userId === user.id
      && verification.restaurantId === restaurantId
      && verification.section === section
      && Number.isFinite(verification.expiresAt)
      && verification.expiresAt > now;
    if (!valid) storage.removeItem(key);
    return valid;
  } catch {
    storage.removeItem(key);
    return false;
  }
}
