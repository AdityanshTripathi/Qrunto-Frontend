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
  const sessionIdentity = `${session.user?.id || ''}:${session.refreshToken || ''}`;
  if (refreshPromise) {
    if (refreshIdentity === sessionIdentity) return refreshPromise;
    return refreshPromise.catch(() => undefined).then(() => refreshAccessToken());
  }

  refreshPromise = withRequestTimeout(async (signal) => {
    const refreshToken = session.refreshToken;
    if (!refreshToken) throw new Error('Your session has expired. Please sign in again.');

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error('Your session has expired. Please sign in again.');
    const data = await response.json();
    if (!data.accessToken) throw new Error('The refresh response did not include an access token.');
    const latestSession = useAuthStore.getState();
    if (latestSession.user?.id !== session.user?.id || latestSession.refreshToken !== refreshToken) {
      throw new Error('The authenticated session changed while refreshing.');
    }
    useAuthStore.getState().updateAccessToken(data.accessToken);
    return data.accessToken as string;
  }).catch((error) => {
    const latestSession = useAuthStore.getState();
    if (latestSession.user?.id === session.user?.id && latestSession.refreshToken === session.refreshToken) {
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
    store.setAuth(supportSession.user, supportSession.accessToken, supportSession.refreshToken);
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
    ...options,
    headers,
    body: bodyData,
  };

  try {
    let response = await fetch(url, fetchOptions);

    // A request is retried at most once, and the refresh endpoint never recurses.
    if (response.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
      const currentStore = useAuthStore.getState();
      if (currentStore.user?.supportSessionId && !currentStore.refreshToken) {
        endExpiredImpersonation();
      }
      if (!currentStore.refreshToken) currentStore.clearAuth();
      else await refreshAccessToken();

      const latestAccessToken = useAuthStore.getState().accessToken;
      if (!latestAccessToken) throw new Error('Your session has expired. Please sign in again.');
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
};
