import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Store,
  Percent,
  CircleDollarSign,
  Phone,
  Mail,
  MapPin,
  FileText,
  Save,
  Loader2,
  Clock,
  Camera,
  Lock,
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { api } from '../../lib/api';
import { PasscodeLockGate } from '../../components/PasscodeLockGate';
import { useCallback } from 'react';


// ─── Types ────────────────────────────────────────────────────────────────────
interface SettingsInputs {
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  currency: string;
  taxPercentage: number;
  logoUrl?: string | null;
}


type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DaySchedule {
  open: string;
  close: string;
  isClosed: boolean;
}

type BusinessHours = Record<DayKey, DaySchedule>;

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const defaultBusinessHours = (): BusinessHours => {
  const hours: Partial<BusinessHours> = {};
  DAYS.forEach(({ key }) => {
    hours[key] = { open: '09:00', close: '22:00', isClosed: false };
  });
  return hours as BusinessHours;
};

// ─── Logo Compression Helper ──────────────────────────────────────────────────
const compressLogo = (file: File, maxSize = 300, quality = 0.85): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
        } else {
          if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const BASE_URL = 'https://backend-steel-seven-97.vercel.app/api';


export const Settings: React.FC = () => {
  return (
    <PasscodeLockGate section="settings">
      <SettingsContent />
    </PasscodeLockGate>
  );
};

const SettingsContent: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultBusinessHours());
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Passcode States
  const [passcodeEnabled, setPasscodeEnabled] = useState(false);
  const [hasPasscodeSet, setHasPasscodeSet] = useState(false);
  const [passcodeRequest, setPasscodeRequest] = useState<any | null>(null);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [passcodeNew, setPasscodeNew] = useState('');
  const [passcodeConfirm, setPasscodeConfirm] = useState('');
  const [isPasscodeSubmitting, setIsPasscodeSubmitting] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  const fetchPasscodeStatus = useCallback(async () => {
    try {
      const res = await api.get('/settings/passcode/status');
      setPasscodeEnabled(res.isPasscodeEnabled);
      setHasPasscodeSet(res.hasPasscodeSet);
      setPasscodeRequest(res.activeRequest);
    } catch (err: any) {
      console.error('Failed to load passcode status:', err);
    }
  }, []);

  const handleSetPasscode = async () => {
    if (!passcodeNew || passcodeNew.length < 4) {
      toast.error('Passcode must be at least 4 characters.');
      return;
    }
    if (passcodeNew !== passcodeConfirm) {
      toast.error('Passcodes do not match.');
      return;
    }
    setIsPasscodeSubmitting(true);
    try {
      const res = await api.post('/settings/passcode/set', {
        passcode: passcodeNew,
        oldPasscode: currentPasscode || undefined,
      });
      toast.success(res.message || 'Passcode updated successfully!');
      setPasscodeNew('');
      setPasscodeConfirm('');
      setCurrentPasscode('');
      fetchPasscodeStatus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update passcode.');
    } finally {
      setIsPasscodeSubmitting(false);
    }
  };

  const handleTogglePasscode = async () => {
    if (!currentPasscode) {
      toast.error('Please enter your passcode to confirm.');
      return;
    }
    try {
      const res = await api.post('/settings/passcode/toggle', {
        isPasscodeEnabled: !passcodeEnabled,
        passcode: currentPasscode,
      });
      toast.success(res.message);
      setIsVerifyOpen(false);
      setCurrentPasscode('');
      fetchPasscodeStatus();
    } catch (err: any) {
      toast.error(err.message || 'Verification failed.');
    }
  };

  const handleRequestReset = async () => {
    try {
      const res = await api.post('/settings/passcode/reset-request');
      toast.success(res.message || 'Passcode reset request sent!');
      fetchPasscodeStatus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset request.');
    }
  };

  useEffect(() => {
    fetchPasscodeStatus();
  }, [fetchPasscodeStatus]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsInputs>({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
      currency: 'INR',
      taxPercentage: 0,
      logoUrl: '',
    },
  });


  // Load Settings
  useEffect(() => {
    if (!token) return;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');

        setValue('name', data.restaurant.name || '');
        setValue('phone', data.restaurant.phone || '');
        setValue('email', data.restaurant.email || '');
        setValue('address', data.restaurant.address || '');
        setValue('gstNumber', data.restaurant.gstNumber || '');
        setValue('currency', data.settings.currency || 'INR');
        setValue('taxPercentage', data.settings.taxPercentage ?? 0);
        setLogoPreview(data.restaurant.logoUrl || null);

        // Load business hours if saved
        if (data.settings.businessHours && typeof data.settings.businessHours === 'object') {
          setBusinessHours({ ...defaultBusinessHours(), ...data.settings.businessHours });
        }
      } catch (err: any) {
        toast.error(err.message || 'Error loading settings');
      } finally {
        setLoading(false);
      }
    };


    loadSettings();
  }, [token, setValue]);

  // Update a specific day's schedule
  const updateDaySchedule = (day: DayKey, field: keyof DaySchedule, value: string | boolean) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // Quick actions for business hours
  const setAllDaysOpen = () => {
    const updated: BusinessHours = { ...businessHours };
    DAYS.forEach(({ key }) => { updated[key] = { ...updated[key], isClosed: false }; });
    setBusinessHours(updated);
  };

  const setWeekdaysOnly = () => {
    const updated: BusinessHours = { ...businessHours };
    DAYS.forEach(({ key }) => {
      updated[key] = { ...updated[key], isClosed: key === 'sunday' || key === 'saturday' };
    });
    setBusinessHours(updated);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    setIsCompressingLogo(true);
    try {
      const compressed = await compressLogo(file);
      setLogoPreview(compressed);
      toast.success('Logo compressed successfully!');
    } catch (err) {
      toast.error('Failed to compress image');
      console.error(err);
    } finally {
      setIsCompressingLogo(false);
    }
  };

  // Save
  const onSubmit: SubmitHandler<SettingsInputs> = async (payload) => {
    if (!token) return;
    setSaving(true);

    try {
      const res = await fetch(`${BASE_URL}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: payload.name,
          phone: payload.phone || null,
          email: payload.email || null,
          address: payload.address || null,
          gstNumber: payload.gstNumber || null,
          logoUrl: logoPreview || null,
          currency: payload.currency,
          taxPercentage: Number(payload.taxPercentage),
          businessHours,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update settings');
      toast.success('Restaurant settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="form" count={6} />;
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Restaurant Settings</h1>
        <p className="text-sm text-slate-500 dark:text-[#9ca3af]">Manage your business details, taxes, currency, and operating hours.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Restaurant Profile ──────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5 sm:p-6 space-y-5">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4" />
            Restaurant Profile
          </h3>

          {/* Logo Upload Widget */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 dark:bg-[#111827]/20 border border-slate-200 dark:border-[#374151]/20 rounded-2xl p-4">
            <div className="relative w-24 h-24 rounded-2xl bg-slate-100 dark:bg-[#111827]/50 border border-slate-200 dark:border-[#374151]/55 overflow-hidden flex items-center justify-center shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-gray-600" />
              )}
              {isCompressingLogo && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-[#FF6B35] animate-spin" />
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-center sm:text-left">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Restaurant Logo</h4>
              <p className="text-xs text-slate-500 dark:text-[#9ca3af]">Upload a square photo from gallery or camera. Max size 5MB.</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2 bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 border border-[#FF6B35]/30 hover:border-[#FF6B35]/50 text-[#FF6B35] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Choose Image
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => setLogoPreview(null)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/35 text-red-400 text-xs font-bold rounded-xl transition-all"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-[#9ca3af] uppercase tracking-wide">Restaurant Name</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="e.g. Pizza Bistro"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35]/40 transition-all text-sm"
                />
              </div>
              {errors.name && <p className="text-rose-400 text-xs">{errors.name.message}</p>}
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-[#9ca3af] uppercase tracking-wide">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="email"
                  placeholder="e.g. contact@pizzabistro.com"
                  {...register('email', {
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' },
                  })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35]/40 transition-all text-sm"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-[#9ca3af] uppercase tracking-wide">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  {...register('phone')}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35]/40 transition-all text-sm"
                />
              </div>
            </div>

            {/* GST */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-[#9ca3af] uppercase tracking-wide">GST Number</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  {...register('gstNumber')}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35]/40 transition-all text-sm"
                />
              </div>
            </div>

          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-[#9ca3af] uppercase tracking-wide">Store Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400 dark:text-gray-500" />
              <textarea
                placeholder="e.g. 1st Floor, Connaught Place, New Delhi"
                rows={2}
                {...register('address')}
                className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35]/40 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* ── Billing & Tax ────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5 sm:p-6 space-y-5">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Billing &amp; Financials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Currency */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-[#9ca3af] uppercase tracking-wide">Billing Currency</label>
              <div className="relative">
                <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <select
                  {...register('currency')}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35]/40 transition-all text-sm appearance-none"
                >
                  <option value="INR">₹ INR — Indian Rupee</option>
                  <option value="USD">$ USD — US Dollar</option>
                  <option value="EUR">€ EUR — Euro</option>
                  <option value="GBP">£ GBP — British Pound</option>
                  <option value="AED">د.إ AED — UAE Dirham</option>
                </select>
              </div>
            </div>

            {/* Tax % */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-[#9ca3af] uppercase tracking-wide">Tax / GST Rate (%)</label>
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 5"
                  {...register('taxPercentage', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                    max: { value: 100, message: 'Cannot exceed 100%' },
                  })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35]/40 transition-all text-sm"
                />
              </div>
              {errors.taxPercentage && <p className="text-rose-400 text-xs">{errors.taxPercentage.message}</p>}

              {/* CGST, SGST Component Breakdown Display */}
              <div className="mt-3 bg-slate-50 dark:bg-[#111827]/30 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-4 space-y-2.5">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">GST Component Breakdown (India)</p>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="flex justify-between border-r border-slate-200 dark:border-[#374151]/20 pr-4">
                    <span className="text-slate-500">CGST (Central Tax)</span>
                    <span className="text-slate-900 dark:text-white">{(Number(watch('taxPercentage') || 0) / 2).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span className="text-slate-500">SGST (State Tax)</span>
                    <span className="text-slate-900 dark:text-white">{(Number(watch('taxPercentage') || 0) / 2).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Business Hours ───────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Business Hours
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={setAllDaysOpen}
                className="text-xs px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded-xl font-semibold transition-all"
              >
                All Open
              </button>
              <button
                type="button"
                onClick={setWeekdaysOnly}
                className="text-xs px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/25 rounded-xl font-semibold transition-all"
              >
                Weekdays Only
              </button>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {DAYS.map(({ key, short }) => {
              const schedule = businessHours[key];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 sm:gap-4 rounded-2xl px-3 sm:px-4 py-3 border transition-all ${
                    schedule.isClosed
                      ? 'bg-slate-50 dark:bg-[#111827]/20 border-slate-200 dark:border-[#374151]/20 opacity-60'
                      : 'bg-slate-50 dark:bg-[#111827]/30 border-slate-200 dark:border-[#374151]/40'
                  }`}
                >
                  {/* Day label */}
                  <span className="w-8 sm:w-10 text-xs font-bold text-slate-700 dark:text-gray-300 shrink-0">{short}</span>

                  {/* Open/Close toggle */}
                  <button
                    type="button"
                    onClick={() => updateDaySchedule(key, 'isClosed', !schedule.isClosed)}
                    className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                      schedule.isClosed ? 'bg-slate-300 dark:bg-[#374151]' : 'bg-[#FF6B35]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        schedule.isClosed ? 'translate-x-0' : 'translate-x-5'
                      }`}
                    />
                  </button>

                  {/* Status label */}
                  <span className={`text-xs font-semibold w-10 sm:w-12 shrink-0 ${schedule.isClosed ? 'text-slate-400 dark:text-gray-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {schedule.isClosed ? 'Closed' : 'Open'}
                  </span>

                  {/* Time pickers */}
                  {!schedule.isClosed && (
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 flex-wrap">
                      <input
                        type="time"
                        value={schedule.open}
                        onChange={(e) => updateDaySchedule(key, 'open', e.target.value)}
                        className="bg-white dark:bg-[#1f2937]/60 border border-slate-300 dark:border-[#374151]/50 rounded-xl px-2 sm:px-3 py-1.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50"
                      />
                      <span className="text-slate-400 dark:text-gray-600 text-xs font-semibold">to</span>
                      <input
                        type="time"
                        value={schedule.close}
                        onChange={(e) => updateDaySchedule(key, 'close', e.target.value)}
                        className="bg-white dark:bg-[#1f2937]/60 border border-slate-300 dark:border-[#374151]/50 rounded-xl px-2 sm:px-3 py-1.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50"
                      />
                    </div>
                  )}

                  {schedule.isClosed && (
                    <div className="flex-1">
                      <span className="text-xs text-slate-400 dark:text-gray-600 italic">Restaurant closed all day</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Security & Access Lock ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5 sm:p-6 space-y-5">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Security & Access Lock
          </h3>
          
          <div className="space-y-4">
            {/* Toggle Row */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#111827]/30 border border-slate-200 dark:border-[#374151]/40 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Enable Passcode Lock</h4>
                <p className="text-xs text-slate-500 dark:text-[#9ca3af] mt-1">
                  Locks Analytics, Billing Plan, and Settings sections with a security passcode.
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  if (!hasPasscodeSet) {
                    toast.error('Please set a passcode first.');
                    return;
                  }
                  setIsVerifyOpen(true);
                }}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                  passcodeEnabled ? 'bg-[#FF6B35]' : 'bg-slate-300 dark:bg-[#374151]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    passcodeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle Verification Modal Inline */}
            {isVerifyOpen && (
              <div className="p-4 border border-orange-500/25 bg-orange-500/5 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
                  Verify Passcode to {passcodeEnabled ? 'Disable' : 'Enable'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={currentPasscode}
                    onChange={(e) => setCurrentPasscode(e.target.value)}
                    placeholder="Enter current passcode"
                    className="flex-1 bg-white dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF6B35]"
                  />
                  <button
                    type="button"
                    onClick={handleTogglePasscode}
                    className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white font-semibold rounded-xl text-xs transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifyOpen(false);
                      setCurrentPasscode('');
                    }}
                    className="px-3 py-2 border border-slate-300 dark:border-[#374151]/80 text-slate-700 dark:text-gray-300 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Change or Set Passcode Form */}
            <div className="p-5 bg-slate-50 dark:bg-[#111827]/30 border border-slate-200 dark:border-[#374151]/40 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
                {hasPasscodeSet ? 'Change Passcode' : 'Set Passcode'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current passcode (only if passcode is set and reset is NOT approved) */}
                {hasPasscodeSet && (!passcodeRequest || passcodeRequest.status !== 'APPROVED') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Passcode</label>
                    <input
                      type="password"
                      value={currentPasscode}
                      onChange={(e) => setCurrentPasscode(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-white dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">New Passcode</label>
                  <input
                    type="password"
                    value={passcodeNew}
                    onChange={(e) => setPasscodeNew(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-white dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Confirm New Passcode</label>
                  <input
                    type="password"
                    value={passcodeConfirm}
                    onChange={(e) => setPasscodeConfirm(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-white dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center flex-wrap gap-2 pt-2">
                {/* Reset Request Link */}
                {hasPasscodeSet ? (
                  <div>
                    {(!passcodeRequest || passcodeRequest.status === 'REJECTED') ? (
                      <button
                        type="button"
                        onClick={handleRequestReset}
                        className="text-xs font-semibold text-[#FF6B35] hover:underline"
                      >
                        Forgot Passcode? Send Reset Request
                      </button>
                    ) : (
                      <span className={`text-xs font-bold ${
                        passcodeRequest.status === 'PENDING' ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        Reset Request: {passcodeRequest.status === 'PENDING' ? 'Pending Admin Approval' : 'Approved! Set passcode without current.'}
                      </span>
                    )}
                  </div>
                ) : <div />}

                <button
                  type="button"
                  onClick={handleSetPasscode}
                  disabled={isPasscodeSubmitting || !passcodeNew || passcodeNew !== passcodeConfirm}
                  className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all"
                >
                  {isPasscodeSubmitting ? 'Saving...' : hasPasscodeSet ? 'Update Passcode' : 'Set & Enable Passcode'}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 bg-[#FF6B35] hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-2xl shadow-xl shadow-[#FF6B35]/15 flex items-center gap-2 transition-all hover:scale-[1.02] transform"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4" />Save All Settings</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;
