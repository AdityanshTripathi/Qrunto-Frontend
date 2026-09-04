import { resolveBackendUrls } from './backend-url';

const backendUrls = resolveBackendUrls(
  import.meta.env.VITE_API_URL,
  import.meta.env.DEV,
);

export const API_BASE_URL = backendUrls.apiBaseUrl;
export const SOCKET_URL = backendUrls.socketUrl;
