export interface EmbeddedSignupStart {
  appId: string;
  configId: string;
  graphApiVersion: string;
  state: string;
  expiresAt: string;
}

interface FacebookLoginResponse {
  authResponse?: { code?: unknown } | null;
  status?: unknown;
}

export interface FacebookSdk {
  init(options: {
    appId: string;
    autoLogAppEvents: boolean;
    version: string;
    xfbml: boolean;
  }): void;
  login(
    callback: (response: FacebookLoginResponse) => void,
    options: {
      config_id: string;
      response_type: 'code';
      override_default_response_type: true;
      extras: { setup: Record<string, never> };
    },
  ): void;
}

type MetaWindow = Window & {
  FB?: FacebookSdk;
  fbAsyncInit?: () => void;
};

export type EmbeddedSignupCompletion =
  | { status: 'connected' }
  | { status: 'cancelled' }
  | { status: 'expired' }
  | { status: 'ignored' };

export class MetaEmbeddedSignupClientError extends Error {
  readonly code: 'SDK_LOAD_FAILED' | 'SDK_INIT_FAILED' | 'SDK_LOGIN_FAILED';

  constructor(code: 'SDK_LOAD_FAILED' | 'SDK_INIT_FAILED' | 'SDK_LOGIN_FAILED') {
    super(
      code === 'SDK_LOAD_FAILED'
        ? 'Meta signup could not be loaded. Please try again.'
        : code === 'SDK_INIT_FAILED'
          ? 'Meta signup could not be initialized. Please try again.'
          : 'Meta signup could not be opened. Please try again.',
    );
    this.name = 'MetaEmbeddedSignupClientError';
    this.code = code;
  }
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function parseEmbeddedSignupStart(value: unknown): EmbeddedSignupStart {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('The signup service returned an invalid response.');
  }
  const candidate = value as Record<string, unknown>;
  if (
    !nonEmptyString(candidate.appId)
    || !nonEmptyString(candidate.configId)
    || !nonEmptyString(candidate.graphApiVersion)
    || !nonEmptyString(candidate.state)
    || !nonEmptyString(candidate.expiresAt)
    || !Number.isFinite(Date.parse(candidate.expiresAt))
  ) {
    throw new Error('The signup service returned an invalid response.');
  }
  return {
    appId: candidate.appId,
    configId: candidate.configId,
    graphApiVersion: candidate.graphApiVersion,
    state: candidate.state,
    expiresAt: candidate.expiresAt,
  };
}

function initializeSdk(sdk: FacebookSdk, config: EmbeddedSignupStart): void {
  try {
    sdk.init({
      appId: config.appId,
      autoLogAppEvents: true,
      xfbml: true,
      version: config.graphApiVersion,
    });
  } catch {
    throw new MetaEmbeddedSignupClientError('SDK_INIT_FAILED');
  }
}

export function loadFacebookSdk(config: EmbeddedSignupStart, signal?: AbortSignal): Promise<FacebookSdk> {
  const metaWindow = window as MetaWindow;
  if (metaWindow.FB) {
    initializeSdk(metaWindow.FB, config);
    return Promise.resolve(metaWindow.FB);
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('facebook-jssdk') as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement('script');
    const createdScript = !existingScript;
    const previousAsyncInit = metaWindow.fbAsyncInit;
    let settled = false;

    const cleanup = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      if (metaWindow.fbAsyncInit === onSdkReady) {
        if (previousAsyncInit) metaWindow.fbAsyncInit = previousAsyncInit;
        else delete metaWindow.fbAsyncInit;
      }
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (createdScript) script.remove();
      reject(error);
    };
    const finish = () => {
      if (settled || !metaWindow.FB) return;
      try {
        initializeSdk(metaWindow.FB, config);
      } catch (error) {
        fail(error instanceof Error ? error : new MetaEmbeddedSignupClientError('SDK_INIT_FAILED'));
        return;
      }
      settled = true;
      cleanup();
      resolve(metaWindow.FB);
    };
    const onSdkReady = () => {
      previousAsyncInit?.();
      finish();
    };
    const onLoad = () => finish();
    const onError = () => fail(new MetaEmbeddedSignupClientError('SDK_LOAD_FAILED'));
    const onAbort = () => fail(new DOMException('The operation was aborted.', 'AbortError'));
    const timeoutId = window.setTimeout(onError, 15_000);

    metaWindow.fbAsyncInit = onSdkReady;
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) {
      onAbort();
      return;
    }
    if (createdScript) {
      script.id = 'facebook-jssdk';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      document.head.appendChild(script);
    }
  });
}

function requestAuthorizationCode(sdk: FacebookSdk, configId: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    try {
      sdk.login(response => {
        const code = response.authResponse?.code;
        resolve(nonEmptyString(code) ? code : null);
      }, {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {} },
      });
    } catch {
      reject(new MetaEmbeddedSignupClientError('SDK_LOGIN_FAILED'));
    }
  });
}

export interface PreparedEmbeddedSignupAttempt {
  complete(
    requestCompletion: (
      body: { code: string; state: string },
      signal?: AbortSignal,
    ) => Promise<void>,
    signal?: AbortSignal,
  ): Promise<EmbeddedSignupCompletion>;
  dispose(): void;
}

export function createPreparedEmbeddedSignupAttempt(
  sdk: FacebookSdk,
  config: EmbeddedSignupStart,
  now: () => number = Date.now,
): PreparedEmbeddedSignupAttempt {
  let started = false;
  let disposed = false;
  return {
    async complete(requestCompletion, signal) {
      if (started || disposed) return { status: 'ignored' };
      started = true;
      if (Date.parse(config.expiresAt) <= now()) return { status: 'expired' };

      const code = await requestAuthorizationCode(sdk, config.configId);
      if (disposed || signal?.aborted) return { status: 'cancelled' };
      if (!code) return { status: 'cancelled' };
      if (Date.parse(config.expiresAt) <= now()) return { status: 'expired' };

      await requestCompletion({ code, state: config.state }, signal);
      if (disposed || signal?.aborted) return { status: 'cancelled' };
      return { status: 'connected' };
    },
    dispose() {
      disposed = true;
    },
  };
}
