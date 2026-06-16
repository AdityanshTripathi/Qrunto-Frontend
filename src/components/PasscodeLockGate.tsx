import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Key, AlertCircle, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface PasscodeLockGateProps {
  children: React.ReactNode;
  section: 'analytics' | 'subscription' | 'settings';
}

interface ActiveRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  requestedAt: string;
}

export const PasscodeLockGate: React.FC<PasscodeLockGateProps> = ({ children, section }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [checking, setChecking] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forgot password states
  const [forgotMode, setForgotMode] = useState(false);
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showNewPasscode, setShowNewPasscode] = useState(false);

  const checkPasscodeStatus = useCallback(async () => {
    try {
      setChecking(true);
      const res = await api.get('/settings/passcode/status');

      // Check if verified in current tab session
      const isVerified = sessionStorage.getItem('qrunto_passcode_verified') === 'true';

      if (!res.isPasscodeEnabled || !res.hasPasscodeSet || isVerified) {
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }

      setActiveRequest(res.activeRequest);
    } catch (err: any) {
      console.error('Failed to load passcode status:', err);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkPasscodeStatus();
  }, [checkPasscodeStatus]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setSubmitting(true);
    try {
      const res = await api.post('/settings/passcode/verify', { passcode });
      if (res.success) {
        sessionStorage.setItem('qrunto_passcode_verified', 'true');
        setIsLocked(false);
        toast.success('Access unlocked successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Incorrect passcode. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendResetRequest = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/settings/passcode/reset-request');
      toast.success(res.message || 'Passcode reset request sent to Admin!');
      setActiveRequest(res.request);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode || newPasscode.length < 4) {
      toast.error('Passcode must be at least 4 characters long.');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      toast.error('Passcodes do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/settings/passcode/set', { passcode: newPasscode });
      toast.success(res.message || 'Passcode reset successfully!');
      sessionStorage.setItem('qrunto_passcode_verified', 'true');
      setIsLocked(false);
      // Refresh passcode state
      checkPasscodeStatus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset passcode.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-4 py-12">
        <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
        <p className="text-slate-500 dark:text-gray-400 font-medium text-sm">Verifying security locks...</p>
      </div>
    );
  }

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="w-full min-h-[500px] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1f2937]/35 backdrop-blur-xl border border-slate-200 dark:border-[#374151]/50 shadow-xl rounded-3xl p-8 transition-all duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] mb-4 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
            {forgotMode ? 'Reset Lock Passcode' : 'Section Lock Enabled'}
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-2 font-medium">
            {forgotMode 
              ? 'Request a reset from the platform Admin or set a new passcode if approved.'
              : `Enter your passcode to access ${section.charAt(0).toUpperCase() + section.slice(1)}.`
            }
          </p>
        </div>

        {/* Form Body */}
        {!forgotMode ? (
          /* Normal Passcode Prompt Form */
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block">
                Enter Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-2xl py-3.5 pl-12 pr-12 text-slate-800 dark:text-white font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all text-center tracking-widest text-lg"
                  placeholder="••••"
                  autoFocus
                  required
                />
                <Key className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !passcode}
              className="w-full py-4 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#FF6B35]/20 hover:shadow-orange-600/35 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                'Unlock Section'
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-xs font-bold text-slate-500 hover:text-[#FF6B35] dark:text-gray-400 dark:hover:text-[#FF6B35] transition-colors uppercase tracking-wider"
              >
                Forgot Passcode?
              </button>
            </div>
          </form>
        ) : (
          /* Forgot Passcode / Reset Flow */
          <div className="space-y-6">
            
            {/* 1. If no reset request, or request was rejected */}
            {(!activeRequest || activeRequest.status === 'REJECTED') && (
              <div className="space-y-4">
                {activeRequest?.status === 'REJECTED' && (
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl flex gap-3 text-red-600 dark:text-red-400 text-xs font-semibold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold">Reset Request Rejected</p>
                      <p className="mt-0.5 opacity-90">Your request was rejected by the admin. Please send another or contact support.</p>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-slate-600 dark:text-gray-300 font-medium leading-relaxed text-center">
                  To reset your passcode, send a request to the system Admin. Once approved, you can set a new passcode.
                </p>

                <button
                  type="button"
                  onClick={handleSendResetRequest}
                  disabled={submitting}
                  className="w-full py-4 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    'Send Reset Request to Admin'
                  )}
                </button>
              </div>
            )}

            {/* 2. If reset request is PENDING */}
            {activeRequest?.status === 'PENDING' && (
              <div className="p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <div>
                  <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm uppercase tracking-wider">Reset Request Pending</h4>
                  <p className="text-slate-500 dark:text-gray-400 text-xs mt-2 leading-relaxed">
                    Submitted on {new Date(activeRequest.requestedAt).toLocaleDateString()} at {new Date(activeRequest.requestedAt).toLocaleTimeString()}. Waiting for Super Admin approval.
                  </p>
                </div>
              </div>
            )}

            {/* 3. If reset request is APPROVED */}
            {activeRequest?.status === 'APPROVED' && (
              <form onSubmit={handleResetPasscode} className="space-y-5">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold">Request Approved!</p>
                    <p className="mt-0.5 opacity-90">Admin has approved your request. Please set a new passcode below.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block">
                    New Passcode
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPasscode ? 'text' : 'password'}
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-2xl py-3 pl-12 pr-12 text-slate-800 dark:text-white font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B35] transition-all text-center tracking-widest text-lg"
                      placeholder="••••"
                      required
                    />
                    <Key className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowNewPasscode(!showNewPasscode)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      {showNewPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block">
                    Confirm Passcode
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPasscode ? 'text' : 'password'}
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/40 rounded-2xl py-3 pl-12 pr-12 text-slate-800 dark:text-white font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B35] transition-all text-center tracking-widest text-lg"
                      placeholder="••••"
                      required
                    />
                    <Key className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !newPasscode || newPasscode !== confirmPasscode}
                  className="w-full py-4 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#FF6B35]/20 hover:shadow-orange-600/35 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    'Set New Passcode & Unlock'
                  )}
                </button>
              </form>
            )}

            <div className="text-center mt-4 border-t border-slate-100 dark:border-[#374151]/30 pt-4">
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="text-xs font-bold text-slate-500 hover:text-[#FF6B35] dark:text-gray-400 dark:hover:text-[#FF6B35] transition-colors uppercase tracking-wider"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
