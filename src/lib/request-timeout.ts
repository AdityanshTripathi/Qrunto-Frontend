export const API_TIMEOUT_MS = 20_000;

// One deadline for the entire request, including refresh, retry and body reads.
export async function withRequestTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  callerSignal?: AbortSignal | null,
  timeoutMs = API_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const cancel = () => controller.abort(callerSignal?.reason);
  const timeoutError = new Error('Request timed out. Please try again.');
  timeoutError.name = 'TimeoutError';
  const timer = setTimeout(() => controller.abort(timeoutError), timeoutMs);
  let onAbort: () => void = () => {};
  try {
    if (callerSignal?.aborted) cancel();
    else callerSignal?.addEventListener('abort', cancel, { once: true });
    const aborted = new Promise<never>((_, reject) => {
      onAbort = () => reject(controller.signal.reason);
      if (controller.signal.aborted) onAbort();
      else controller.signal.addEventListener('abort', onAbort, { once: true });
    });
    return await Promise.race([
      aborted,
      Promise.resolve().then(() => {
        controller.signal.throwIfAborted();
        return run(controller.signal);
      }),
    ]);
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', cancel);
    controller.signal.removeEventListener('abort', onAbort);
  }
}
