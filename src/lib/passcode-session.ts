export type ProtectedSection = 'analytics' | 'subscription' | 'settings';

interface SecurityProof { value: string; expiresAt: number; }

// Deliberately module-only: reloads and persistent-storage edits cannot restore proofs.
const proofs = new Map<ProtectedSection, SecurityProof>();
const listeners = new Set<() => void>();
const notify = () => { for (const listener of listeners) listener(); };

export function saveSecurityProof(section: ProtectedSection, value: string, expiresAt: string): void {
  const expiry = Date.parse(expiresAt);
  if (!value || !Number.isFinite(expiry) || expiry <= Date.now()) throw new Error('Invalid security proof response.');
  proofs.set(section, { value, expiresAt: expiry });
  notify();
}

export function getSecurityProof(section: ProtectedSection, now = Date.now()): string | null {
  const proof = proofs.get(section);
  if (!proof) return null;
  if (proof.expiresAt <= now) { proofs.delete(section); notify(); return null; }
  return proof.value;
}

export function hasValidSecurityProof(section: ProtectedSection, now = Date.now()): boolean {
  return getSecurityProof(section, now) !== null;
}

export function clearSecurityProof(section?: ProtectedSection): void {
  if (section) proofs.delete(section); else proofs.clear();
  notify();
}

export function subscribeSecurityProofs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
