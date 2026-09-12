export interface NumberRules {
  field: string;
  min?: number;
  max?: number;
  allowZero?: boolean;
}

export function parseFiniteNumber(value: unknown, rules: NumberRules): number {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${rules.field} is required.`);
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${rules.field} must be a finite number.`);
  if (rules.min !== undefined && parsed < rules.min) {
    throw new Error(`${rules.field} must be at least ${rules.min}.`);
  }
  if (rules.max !== undefined && parsed > rules.max) {
    throw new Error(`${rules.field} must be at most ${rules.max}.`);
  }
  if (rules.allowZero === false && parsed === 0) {
    throw new Error(`${rules.field} must not be zero.`);
  }
  return parsed;
}

export async function withActionLock<T>(
  locks: Set<string>,
  key: string,
  action: () => Promise<T>,
  onChange?: (key: string, active: boolean) => void,
): Promise<{ started: boolean; value?: T }> {
  if (locks.has(key)) return { started: false };
  locks.add(key);
  onChange?.(key, true);
  try {
    return { started: true, value: await action() };
  } finally {
    locks.delete(key);
    onChange?.(key, false);
  }
}
