import { withRequestTimeout } from './request-timeout';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL as BASE_URL } from '../config/backend';
import { getValidSupportSession } from './session-lifecycle';


interface RequestOptions extends RequestInit {
  body?: any;
}

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

  let bodyData = options.body;
  if (bodyData && typeof bodyData === 'object' && !(bodyData instanceof FormData)) {
    bodyData = JSON.stringify(bodyData);
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error('API Request failed:', err);
    if (err instanceof TypeError && (err.message.toLowerCase().includes('fetch') || err.message.toLowerCase().includes('networkerror'))) {
      throw new Error('Unable to connect to the server. Please ensure the backend is running on port 5000.');
    }
    throw err;
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
    
  post: (path: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request(path, { ...options, method: 'POST', body }),

  put: (path: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request(path, { ...options, method: 'PUT', body }),
    
  patch: (path: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) => 
    request(path, { ...options, method: 'PATCH', body }),
    
  delete: (path: string, options?: Omit<RequestOptions, 'method'>) => 
    request(path, { ...options, method: 'DELETE' }),

  logout: logoutSession,
};
