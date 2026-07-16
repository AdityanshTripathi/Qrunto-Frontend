import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('ordio.in') || import.meta.env.DEV)
    ? 'http://localhost:5000/api'
    : 'https://backend-steel-seven-97.vercel.app/api');

interface RequestOptions extends RequestInit {
  body?: any;
}

async function request(path: string, options: RequestOptions = {}) {
  const url = `${BASE_URL}${path}`;
  const store = useAuthStore.getState();

  // Clone headers
  const headers = new Headers(options.headers);

  // Set default Content-Type to application/json
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach Authorization header if token exists
  if (store.accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${store.accessToken}`);
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

    // If 401 Unauthorized, attempt token refresh
    if (response.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
      if (store.refreshToken) {
        console.log('Access token expired, attempting refresh...');
        
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: store.refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newAccessToken = data.accessToken;
          
          // Update access token in store
          store.updateAccessToken(newAccessToken);

          // Update Authorization header for original request retry
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          fetchOptions.headers = headers;

          // Retry original request
          console.log('Token refresh successful, retrying original request...');
          response = await fetch(url, fetchOptions);
        } else {
          // Refresh token failed, clear auth session
          console.error('Refresh token expired or invalid, logging out...');
          store.clearAuth();
        }
      } else if (store.accessToken) {
        // No refresh token but we had an access token, clear auth session
        console.error('Unauthorized response with no refresh token, logging out...');
        store.clearAuth();
      }
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
