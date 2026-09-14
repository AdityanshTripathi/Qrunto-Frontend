import { withRequestTimeout } from './request-timeout';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL as BASE_URL } from '../config/backend';
import { getValidSupportSession } from './session-lifecycle';


type ApiRequestBody = BodyInit | object | null;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: ApiRequestBody;
}

export type ApiErrorKind = 'http' | 'auth' | 'network' | 'timeout' | 'aborted';

export interface ApiErrorDetails {
  status?: number;
  kind: ApiErrorKind;
  code?: string;
  requestId?: string;
  retryAfter?: string;
  fieldErrors?: Record<string, string[]>;
}

/** A safe, transport-independent error shape for all central API requests. */
export class ApiError extends Error {
  readonly status?: number;
  readonly kind: ApiErrorKind;
  readonly code?: string;
  readonly requestId?: string;
  readonly retryAfter?: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, details: ApiErrorDetails) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
    this.status = details.status;
    this.kind = details.kind;
    this.code = details.code;
    this.requestId = details.requestId;
    this.retryAfter = details.retryAfter;
    this.fieldErrors = details.fieldErrors;
  }
}

const safeText = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, 500) : fallback;

const safeFieldErrors = (value: unknown): Record<string, string[]> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const result: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(value)) {
    if (typeof messages === 'string') result[field] = [messages.slice(0, 500)];
    else if (Array.isArray(messages)) {
      const safeMessages = messages
        .filter((message): message is string => typeof message === 'string')
        .map(message => message.slice(0, 500));
      if (safeMessages.length) result[field] = safeMessages;
    }
  }
  return Object.keys(result).length ? result : undefined;
};

const apiErrorFromResponse = async (response: Response): Promise<ApiError> => {
  const payload: Record<string, unknown> = await response.json().catch(() => ({}));
  const status = response.status;
  const message = safeText(payload.error ?? payload.message, `Request failed with status ${status}`);
  const fieldErrors = safeFieldErrors(payload.fieldErrors ?? payload.errors ?? payload.validation);
  return new ApiError(message, {
    status,
    kind: status === 401 ? 'auth' : 'http',
    code: typeof payload.code === 'string' ? payload.code.slice(0, 100) : undefined,
    requestId: response.headers?.get('x-request-id') ?? response.headers?.get('x-correlation-id') ?? undefined,
    retryAfter: response.headers?.get('retry-after') ?? undefined,
    fieldErrors,
  });
};

const normalizeRequestError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (error instanceof Error && error.name === 'TimeoutError') {
    return new ApiError('Request timed out. Please try again.', { kind: 'timeout' });
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError('Request was cancelled.', { kind: 'aborted' });
  }
  if (error instanceof TypeError) {
    return new ApiError('Unable to connect. Check your internet connection and try again.', { kind: 'network' });
  }
  if (error instanceof Error) {
    return new ApiError(error.message || 'Unable to complete the request. Please try again.', {
      kind: /session|sign in/i.test(error.message) ? 'auth' : 'network',
    });
  }
  return new ApiError('Unable to complete the request. Please try again.', { kind: 'network' });
};

function request(path: string, options: RequestOptions = {}) {
  return withRequestTimeout(
    signal => performRequest(path, { ...options, signal }),
    options.signal,
  );
}

let refreshPromise: Promise<string> | null = null;
let refreshIdentity: string | null = null;

function refreshAccessToken(): Promise<string> {
  const session = useAuthStore.getState();
  const userId = session.user?.id;
  const accessToken = session.accessToken;

  if (!userId || !accessToken) {
    return Promise.reject(new Error('Your session has expired. Please sign in again.'));
  }

  const sessionIdentity = `${userId}:${accessToken}`;

  if (refreshPromise) {
    if (refreshIdentity === sessionIdentity) return refreshPromise;
    return refreshPromise.catch(() => undefined).then(() => refreshAccessToken());
  }

  refreshPromise = withRequestTimeout(async (signal) => {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    const data = await response.json();

    if (!data.accessToken) {
      throw new Error('The refresh response did not include an access token.');
    }

    const latestSession = useAuthStore.getState();

    if (
      latestSession.user?.id !== userId ||
      latestSession.accessToken !== accessToken
    ) {
      throw new Error('The authenticated session changed while refreshing.');
    }

    latestSession.updateAccessToken(data.accessToken);
    return data.accessToken as string;
  }).catch((error) => {
    const latestSession = useAuthStore.getState();

    if (
      latestSession.user?.id === userId &&
      latestSession.accessToken === accessToken
    ) {
      latestSession.clearAuth();
    }

    throw error;
  }).finally(() => {
    refreshPromise = null;
    refreshIdentity = null;
  });

  refreshIdentity = sessionIdentity;
  return refreshPromise;
}

function endExpiredImpersonation(): never {
  const store = useAuthStore.getState();
  let supportSession = null;
  try {
    supportSession = getValidSupportSession(localStorage, store.user);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  if (supportSession) {
    store.setAuth(supportSession.user, supportSession.accessToken);
    throw new Error('The support session expired. The SuperAdmin session has been restored.');
  }

  store.clearAuth();
  throw new Error('Your session has expired. Please sign in again.');
}

async function performRequest(path: string, options: RequestOptions) {
  const url = `${BASE_URL}${path}`;
  const initialStore = useAuthStore.getState();

  // Clone headers
  const headers = new Headers(options.headers);

  // Set default Content-Type to application/json
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach Authorization header if token exists
  if (initialStore.accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${initialStore.accessToken}`);
  }

  let bodyData: BodyInit | undefined;
  const requestBody = options.body;
  if (requestBody && typeof requestBody === 'object' && !(requestBody instanceof FormData)) {
    bodyData = JSON.stringify(requestBody);
  } else {
    bodyData = requestBody ?? undefined;
  }

  const fetchOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers,
    body: bodyData,
  };

  try {
    let response = await fetch(url, fetchOptions);

    // A request is retried at most once, and the refresh endpoint never recurses.
    if (
      response.status === 401 &&
      path !== '/auth/refresh' &&
      path !== '/auth/login' &&
      path !== '/auth/logout'
    ) {
      const currentStore = useAuthStore.getState();

      // Impersonation is intentionally access-token-only. Never use the
      // SuperAdmin refresh cookie while acting as a restaurant owner.
      if (currentStore.user?.supportSessionId) {
        endExpiredImpersonation();
      }

      if (!currentStore.user) {
        currentStore.clearAuth();
        throw new Error('Your session has expired. Please sign in again.');
      }

      await refreshAccessToken();

      const latestAccessToken = useAuthStore.getState().accessToken;
      if (!latestAccessToken) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      headers.set('Authorization', `Bearer ${latestAccessToken}`);
      response = await fetch(url, { ...fetchOptions, headers });
    }

    if (!response.ok) throw await apiErrorFromResponse(response);

    return await response.json();
  } catch (err: unknown) {
    console.error('API Request failed:', err);
    throw normalizeRequestError(err);
  }
}

async function logoutSession(): Promise<void> {
  try {
    await withRequestTimeout(async (signal) => {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        signal,
      });

      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }
    });
  } catch (error) {
    // Local teardown must still happen if the network/server is unavailable.
    console.error('Server logout failed:', error);
  } finally {
    useAuthStore.getState().clearAuth();
  }
}

export const api = {
  get: (path: string, options?: Omit<RequestOptions, 'method'>) => 
    request(path, { ...options, method: 'GET' }),
    
  post: (path: string, body?: ApiRequestBody, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request(path, { ...options, method: 'POST', body }),

  put: (path: string, body?: ApiRequestBody, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request(path, { ...options, method: 'PUT', body }),
    
  patch: (path: string, body?: ApiRequestBody, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request(path, { ...options, method: 'PATCH', body }),
    
  delete: (path: string, options?: Omit<RequestOptions, 'method'>) => 
    request(path, { ...options, method: 'DELETE' }),

  logout: logoutSession,
};
