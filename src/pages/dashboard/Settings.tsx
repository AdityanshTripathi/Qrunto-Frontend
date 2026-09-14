import { timezone } from '../../lib/timezone';
import React, { useEffect, useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
  Camera,
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { api } from '../../lib/api';


// ─── Types ────────────────────────────────────────────────────────────────────
interface SettingsInputs {
  timezone: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  gstEnabled: boolean;
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

export const Settings: React.FC = () => {
  return <SettingsContent />;
};

const SettingsContent: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultBusinessHours());
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<SettingsInputs>({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
      gstEnabled: true,
      currency: 'INR',
      timezone: timezone(undefined),
      taxPercentage: 0,
      logoUrl: '',
    },
  });
  const watchedTaxPercentage = useWatch({ control, name: 'taxPercentage' });
  const watchedGstEnabled = useWatch({ control, name: 'gstEnabled' });


  // Load Settings
  useEffect(() => {
    if (!token) return;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await api.get('/settings');

        setValue('name', data.restaurant.name || '');
        setValue('phone', data.restaurant.phone || '');
        setValue('email', data.restaurant.email || '');
        setValue('address', data.restaurant.address || '');
        setValue('gstNumber', data.restaurant.gstNumber || '');
        setValue('gstEnabled', data.settings.gstEnabled ?? true);
        setValue('timezone', timezone(data.restaurant.timezone));
        setValue('currency', data.settings.currency || 'INR');
        setValue('taxPercentage', data.settings.taxPercentage ?? 0);
        setLogoPreview(data.restaurant.logoUrl || null);

        // Load business hours if saved
        if (data.settings.businessHours && typeof data.settings.businessHours === 'object') {
          setBusinessHours({ ...defaultBusinessHours(), ...data.settings.businessHours });
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error loading settings');
      } finally {
        setLoading(false);
      }
    };


    loadSettings();
  }, [token, setValue]);

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
      const data = await api.patch('/settings', {
          name: payload.name,
          phone: payload.phone || null,
          email: payload.email || null,
          address: payload.address || null,
          gstNumber: payload.gstNumber || null,
          logoUrl: logoPreview || null,
          timezone: payload.timezone,
          currency: payload.currency,
          gstEnabled: payload.gstEnabled,
          taxPercentage: Number(payload.taxPercentage),
          businessHours,
      });
      const currentUser = useAuthStore.getState().user;
      if (currentUser) useAuthStore.setState({ user: { ...currentUser, restaurantTimezone: data.restaurant.timezone, restaurants: currentUser.restaurants.map(r => r.id === data.restaurant.id ? { ...r, timezone: data.restaurant.timezone } : r) } });
      toast.success('Restaurant settings saved successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving settings');
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

            {watchedGstEnabled && (
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
            )}

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

            <div className="space-y-2">
              <label htmlFor="restaurant-timezone" className="text-xs font-bold text-slate-500">Restaurant timezone</label>
              <input id="restaurant-timezone" {...register('timezone', { required: 'Timezone is required' })} placeholder="Asia/Kolkata" className="w-full rounded-xl border p-3 bg-transparent" />
              <p className="text-xs text-slate-500">Use an IANA name, such as Asia/Kolkata, UTC, or America/New_York.</p>
            </div>
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

            <div className={`md:col-span-2 flex flex-col gap-2.5 rounded-xl border px-3.5 py-2.5 transition-colors sm:flex-row sm:items-center sm:justify-between ${watchedGstEnabled ? 'border-[#FF6B35]/30 bg-[#FFF7F2] dark:border-[#FF6B35]/30 dark:bg-[#FF6B35]/5' : 'border-slate-200 bg-slate-50 dark:border-[#374151]/40 dark:bg-[#111827]/30'}`}>
              <div className="flex items-center gap-2.5">
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${watchedGstEnabled ? 'bg-[#FF6B35]/15 text-[#C2410C]' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'}`} aria-hidden="true">
                  <Percent className="size-3" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Charge GST</p>
                    <span className={`size-2 rounded-full ${watchedGstEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden="true" />
                  </div>
                  <p className="mt-0.5 text-xs leading-4 text-slate-600 dark:text-[#9ca3af]">
                    {watchedGstEnabled
                      ? 'GST will be added to new bills and your GSTIN will be displayed.'
                      : 'New bills will not include GST or display a GSTIN.'}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-2.5 sm:justify-end">
                <div className="sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Status</p>
                  <p className={`mt-0.5 text-xs font-bold ${watchedGstEnabled ? 'text-[#C2410C] dark:text-[#FF8A5C]' : 'text-slate-600 dark:text-slate-300'}`}>
                    {watchedGstEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={watchedGstEnabled}
                  aria-label="Charge GST"
                  onClick={() => setValue('gstEnabled', !watchedGstEnabled, { shouldDirty: true })}
                  className={`relative h-7 w-14 shrink-0 rounded-full border p-0.5 shadow-inner transition-all duration-300 ease-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${watchedGstEnabled ? 'border-[#A83B12] bg-[#C4511E]' : 'border-slate-600 bg-slate-500 dark:border-slate-500 dark:bg-slate-600'}`}
                >
                  <span className={`relative block size-6 rounded-full border border-black/5 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out ${watchedGstEnabled ? 'translate-x-7' : 'translate-x-0'}`} aria-hidden="true" />
                </button>
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
                  disabled={!watchedGstEnabled}
                  placeholder="e.g. 5"
                  {...register('taxPercentage', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                    max: { value: 100, message: 'Cannot exceed 100%' },
                  })}
                  className="w-full bg-slate-50 dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-2xl py-3 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35]/40 transition-all text-sm disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              {errors.taxPercentage && <p className="text-rose-400 text-xs">{errors.taxPercentage.message}</p>}

              {/* CGST, SGST Component Breakdown Display */}
              {watchedGstEnabled && <div className="mt-3 bg-slate-50 dark:bg-[#111827]/30 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-4 space-y-2.5">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">GST Component Breakdown (India)</p>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="flex justify-between border-r border-slate-200 dark:border-[#374151]/20 pr-4">
                    <span className="text-slate-500">CGST (Central Tax)</span>
                    <span className="text-slate-900 dark:text-white">{(Number(watchedTaxPercentage || 0) / 2).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span className="text-slate-500">SGST (State Tax)</span>
                    <span className="text-slate-900 dark:text-white">{(Number(watchedTaxPercentage || 0) / 2).toFixed(2)}%</span>
                  </div>
                </div>
              </div>}
            </div>

          </div>
        </div>

        {/* ── Security & Access Lock ───────────────────────────────────────── */}
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
