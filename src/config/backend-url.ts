export interface BackendUrls {
  apiBaseUrl: string;
  socketUrl: string;
}

const DEVELOPMENT_API_URL = 'http://localhost:5000/api';

function isLoopbackHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  const ipv4MappedPrefix = normalized.match(/^::ffff:([0-9a-f]{1,4}):/i)?.[1];
  const ipv4MappedLoopback = ipv4MappedPrefix
    ? Number.parseInt(ipv4MappedPrefix, 16) >= 0x7f00 && Number.parseInt(ipv4MappedPrefix, 16) <= 0x7fff
    : false;
  return normalized === 'localhost'
    || normalized.endsWith('.localhost')
    || normalized === '::1'
    || normalized === '0:0:0:0:0:0:0:1'
    || normalized.startsWith('::ffff:127.')
    || ipv4MappedLoopback
    || normalized === '0.0.0.0'
    || normalized.startsWith('127.');
}

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

  if (!isDevelopment && parsedUrl.protocol !== 'https:') {
    throw new Error('Production VITE_API_URL must use HTTPS.');
  }

  if (!isDevelopment && isLoopbackHostname(parsedUrl.hostname)) {
    throw new Error('Production VITE_API_URL must not use a loopback host.');
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
