import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ExternalLink, LoaderCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '../../../lib/api';
import {
  createPreparedEmbeddedSignupAttempt,
  loadFacebookSdk,
  MetaEmbeddedSignupClientError,
  parseEmbeddedSignupStart,
  type PreparedEmbeddedSignupAttempt,
} from '../../../lib/meta-embedded-signup';

type SignupPhase = 'idle' | 'preparing' | 'ready' | 'popup' | 'verifying' | 'connected' | 'cancelled' | 'expired' | 'error';

interface Props {
  connected: boolean;
  connectionLabel: string | null;
  onConnected: () => Promise<void>;
}

const primary = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
const secondary = 'inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white';

function signupErrorMessage(error: unknown): string {
  if (error instanceof MetaEmbeddedSignupClientError) return error.message;
  if (error instanceof ApiError) {
    if (error.code === 'WHATSAPP_SIGNUP_STATE_INVALID') {
      return 'This signup session expired or was already used. Start a new signup.';
    }
    if (error.code === 'WHATSAPP_SIGNUP_SELECTION_REQUIRED') {
      return 'More than one eligible WhatsApp account or phone number was found. Ordio cannot choose one safely yet.';
    }
    if (error.code === 'WHATSAPP_SIGNUP_CONFIG_MISSING' || error.code === 'WHATSAPP_SIGNUP_CONFIG_INVALID') {
      return 'WhatsApp signup is not configured on the server.';
    }
    return error.message;
  }
  return error instanceof Error ? error.message : 'WhatsApp signup could not be completed.';
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function WhatsAppEmbeddedSignup({ connected, connectionLabel, onConnected }: Props) {
  const [phase, setPhase] = useState<SignupPhase>('idle');
  const [message, setMessage] = useState('');
  const attemptRef = useRef<PreparedEmbeddedSignupAttempt | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const discardAttempt = () => {
    attemptRef.current?.dispose();
    attemptRef.current = null;
    controllerRef.current?.abort();
    controllerRef.current = null;
  };

  useEffect(() => () => discardAttempt(), []);

  const prepareSignup = async () => {
    if (phase === 'preparing' || phase === 'popup' || phase === 'verifying') return;
    if (connected && !window.confirm('A WhatsApp connection is already active. Continue only if you intend to replace it after Meta verifies the new connection.')) {
      return;
    }
    discardAttempt();
    const controller = new AbortController();
    controllerRef.current = controller;
    setMessage('');
    setPhase('preparing');
    try {
      const response = await api.post('/crm/v2/whatsapp/connect/start', undefined, { signal: controller.signal });
      const config = parseEmbeddedSignupStart(response);
      if (Date.parse(config.expiresAt) <= Date.now()) {
        setPhase('expired');
        setMessage('The signup session expired before it could start. Please try again.');
        return;
      }
      const sdk = await loadFacebookSdk(config, controller.signal);
      if (controller.signal.aborted) return;
      attemptRef.current = createPreparedEmbeddedSignupAttempt(sdk, config);
      setPhase('ready');
    } catch (error) {
      if (isAbortError(error)) return;
      setMessage(signupErrorMessage(error));
      setPhase('error');
    }
  };

  const launchSignup = async () => {
    const attempt = attemptRef.current;
    const controller = controllerRef.current;
    if (!attempt || !controller || phase !== 'ready') return;
    setMessage('');
    setPhase('popup');
    try {
      const result = await attempt.complete(async (body, signal) => {
        setPhase('verifying');
        await api.post('/crm/v2/whatsapp/connect/complete', body, { signal });
      }, controller.signal);
      attemptRef.current = null;
      if (result.status === 'connected') {
        setPhase('connected');
        try {
          await onConnected();
          toast.success('WhatsApp connected through Meta');
        } catch {
          setMessage('WhatsApp connected, but the displayed status could not be refreshed. Refresh this page to update it.');
        }
      } else if (result.status === 'expired') {
        setPhase('expired');
        setMessage('The signup session expired. Start a new signup to continue.');
      } else if (result.status === 'cancelled') {
        setPhase('cancelled');
        setMessage('Meta signup was cancelled. No connection changes were made.');
      }
    } catch (error) {
      if (isAbortError(error)) return;
      attemptRef.current = null;
      setMessage(signupErrorMessage(error));
      setPhase('error');
    }
  };

  const cancelPreparedSignup = () => {
    discardAttempt();
    setMessage('Signup cancelled. No connection changes were made.');
    setPhase('cancelled');
  };

  const busy = phase === 'preparing' || phase === 'popup' || phase === 'verifying';
  const statusText = phase === 'preparing'
    ? 'Preparing a secure signup session…'
    : phase === 'popup'
      ? 'Complete the steps in the Meta popup…'
      : phase === 'verifying'
        ? 'Verifying your WhatsApp account with Meta…'
        : null;

  return <div className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Connect securely with Meta
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
          Meta verifies your business account and sends credentials directly to Ordio&apos;s backend. Ordio never asks you to paste an access token.
        </p>
        {connected && <p className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="mr-1 inline h-4 w-4" /> {connectionLabel || 'WhatsApp is connected'}
        </p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {phase === 'ready' ? <>
          <button className={primary} onClick={() => void launchSignup()}>
            Continue with Meta <ExternalLink className="h-4 w-4" />
          </button>
          <button className={secondary} onClick={cancelPreparedSignup}>Cancel</button>
        </> : <button className={primary} disabled={busy} onClick={() => void prepareSignup()}>
          {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {connected ? 'Reconnect with Meta' : 'Connect WhatsApp'}
        </button>}
      </div>
    </div>
    {phase === 'ready' && <p role="status" className="mt-3 text-xs text-slate-600 dark:text-slate-300">
      Secure signup is ready. Continue within a few minutes to open Meta.
    </p>}
    {statusText && <p role="status" className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
      <LoaderCircle className="h-4 w-4 animate-spin" /> {statusText}
    </p>}
    {message && <p role={phase === 'error' || phase === 'expired' ? 'alert' : 'status'} className={`mt-3 text-xs leading-5 ${phase === 'error' || phase === 'expired' ? 'text-red-700 dark:text-red-300' : 'text-slate-600 dark:text-slate-300'}`}>{message}</p>}
  </div>;
}
