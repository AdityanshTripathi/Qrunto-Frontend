export interface BackendUrls {
  apiBaseUrl: string;
  socketUrl: string;
}

const DEVELOPMENT_API_URL = 'http://localhost:5000/api';

export function resolveBackendUrls(
  configuredUrl: string | undefined,
  isDevelopment: boolean,
): BackendUrls {
  const rawUrl = configuredUrl?.trim() || (isDevelopment ? DEVELOPMENT_API_URL : '');

  if (!rawUrl) {
    throw new Error(
      'VITE_API_URL is required in production (for example, https://qrunto2-0-backends.vercel.app/api).',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error('VITE_API_URL must be a valid absolute HTTP(S) URL.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('VITE_API_URL must use HTTP or HTTPS.');
  }

  const apiBaseUrl = rawUrl.replace(/\/+$/, '');
  if (!new URL(apiBaseUrl).pathname.endsWith('/api')) {
    throw new Error('VITE_API_URL must include the backend /api path.');
  }

  return {
    apiBaseUrl,
    socketUrl: parsedUrl.origin,
  };
}
