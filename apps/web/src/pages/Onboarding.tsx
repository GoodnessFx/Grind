/**
 * Onboarding — 8-step flow.
 * Step saved to DB after every screen so the user can resume if they close.
 * Steps: 1=role, 2=profile, 3=skills, 4=verify, 5=wallet, 6=bank, 7=notifications, 8=first action
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, Upload, Bell, BellOff, Building2,
  Briefcase, ShoppingBag, Store, Users, ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, upsertProfile, supabase, apiFetch, checkHandleAvailable } from '../lib/auth';
import { useTranslation } from '../lib/i18n';

const STEPS = 8;

const SKILLS = [
  'Writing', 'Design', 'Coding', 'Tutoring', 'Delivery', 'Research',
  'Video', 'Hostel Runs', 'Food Pickup', 'Assignment', 'Braid and Barb',
  'Thrift', 'Phone Repair', 'Printing', 'Laundry',
];

const UNIVERSITIES = [
  'University of Lagos (UNILAG)', 'Obafemi Awolowo University (OAU)',
  'University of Ibadan (UI)', 'University of Ilorin', 'University of Nigeria, Nsukka',
  'Ahmadu Bello University', 'Federal University of Technology, Akure', 'Ouí University',
  'Covenant University', 'Babcock University', 'Lagos State University', 'Other',
];

const LEVELS = ['100L', '200L', '300L', '400L', '500L', 'HND 1', 'HND 2', 'Masters', 'PhD'];

export const Onboarding: React.FC = () => {
  const { user, authUser, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);

  // Step 1 — roles
  const [roles, setRoles] = useState({ earn: false, hire: false, sell: false, company: false });

  // Step 2 — profile
  const [handle, setHandle]         = useState('');
  const [handleAvail, setHandleAvail] = useState<boolean | null>(null);
  const [fullName, setFullName]     = useState('');
  const [campus, setCampus]         = useState('');
  const [hostel, setHostel]         = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel]           = useState('');
  const [bio, setBio]               = useState('');

  // Step 3 — skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Step 5 — wallet explained
  // Step 6 — bank
  const [bankName, setBankName]       = useState('');
  const [bankCode, setBankCode]       = useState('');
  const [bankAccNum, setBankAccNum]   = useState('');
  const [bankAccName, setBankAccName] = useState('');
  const [resolving, setResolving]     = useState(false);
  const [banks, setBanks]             = useState<{ name: string; code: string }[]>([]);

  // Step 7 — notifications
  const [notif8am, setNotif8am] = useState(true);
  const [notifGigs, setNotifGigs] = useState(true);

  // Resume from saved step
  useEffect(() => {
    if (user) {
      const savedStep = user.onboarding_step ?? 1;
      if (user.onboarding_complete) { navigate('/profile', { replace: true }); return; }
      setStep(Math.max(1, Math.min(savedStep, STEPS)));
      setHandle(user.handle ?? '');
      setFullName(user.full_name ?? '');
      setCampus(user.campus ?? '');
      setHostel(user.hostel ?? '');
      setDepartment(user.department ?? '');
      setLevel(user.level ?? '');
      setBio(user.bio ?? '');
      setSelectedSkills(user.skills ?? []);
      setRoles({ earn: user.role_earn, hire: user.role_hire, sell: user.role_sell, company: user.role_company });
    }
  }, [user]);

  // Load banks list
  useEffect(() => {
    apiFetch<{ banks: any[] }>('/api/wallet/banks')
      .then(d => setBanks(d.banks ?? []))
      .catch(() => {});
  }, []);

  const saveStep = async (nextStep: number, updates: Record<string, any>) => {
    if (!authUser?.id) return;
    setSaving(true);
    try {
      await upsertProfile(authUser.id, { ...updates, onboarding_step: nextStep } as any);
      await refreshProfile();
      setStep(nextStep);
    } catch (err: any) {
      toast.error(err.message ?? t('error.generic'));
    } finally {
      setSaving(false);
    }
  };

  // Handle live availability check
  let handleDebounce: ReturnType<typeof setTimeout>;
  const onHandleChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);
    setHandle(clean);
    setHandleAvail(null);
    clearTimeout(handleDebounce);
    if (clean.length >= 3) {
      handleDebounce = setTimeout(async () => {
        const avail = await checkHandleAvailable(clean);
        setHandleAvail(avail);
      }, 500);
    }
  };

  // Bank account resolve
  const resolveAccount = async () => {
    if (bankAccNum.length !== 10 || !bankCode) return;
    setResolving(true);
    try {
      const data = await apiFetch<{ account_name: string }>('/api/wallet/resolve-account', {
        method: 'POST',
        body: JSON.stringify({ account_number: bankAccNum, bank_code: bankCode }),
      });
      setBankAccName(data.account_name);
      toast.success(`Account name: ${data.account_name}`);
    } catch {
      setBankAccName('');
      toast.error('Could not resolve account. Check the number and bank.');
    } finally {
      setResolving(false);
    }
  };

  const finish = async () => {
    if (!authUser?.id) return;
    setLoading(true);
    try {
      await upsertProfile(authUser.id, {
        notif_8am:         notif8am,
        notif_gigs:        notifGigs,
        onboarding_step:   STEPS,
        onboarding_complete: true,
      } as any);
      await refreshProfile();
      toast.success(t('auth.success_register'));
      const firstRoute = roles.earn ? '/gigs' : roles.hire ? '/post-gig' : '/marketplace';
      navigate(firstRoute, { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? t('error.generic'));
    } finally {
      setLoading(false);
    }
  };

  // ── Progress bar ─────────────────────────────────────────────────────────────
  const Progress = () => (
    <div className="flex gap-1 mb-8">
      {Array.from({ length: STEPS }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-400 ${i < step ? 'bg-[#00A651]' : 'bg-gray-100'}`} />
      ))}
    </div>
  );

  const Next = ({ label = 'Continue', onClick, disabled = false }: { label?: string; onClick: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled || saving}
      className="w-full bg-[#00A651] hover:bg-[#007A3D] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#00A651]/30 disabled:opacity-40 disabled:shadow-none"
    >
      {saving ? 'Saving...' : <>{label} <ArrowRight className="w-4 h-4" /></>}
    </button>
  );

  const Back = () => step > 1 ? (
    <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-gray-400 text-sm mb-6 hover:text-gray-600 transition-colors">
      <ChevronLeft className="w-4 h-4" /> Back
    </button>
  ) : null;

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-[#00A651]' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 font-[Inter,sans-serif]">
      <div className="w-full max-w-[440px]">
        <Progress />
        <Back />

        {/* ── Step 1: Role ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{t('onboard.pick_role')}</h2>
            <p className="text-gray-500 text-sm mb-6">Pick one or more. You can change later.</p>
            <div className="space-y-3 mb-8">
              {[
                { key: 'earn',    icon: Briefcase,  label: t('onboard.earn'),    sub: 'Gigs, freelance, campus jobs' },
                { key: 'hire',    icon: Users,      label: t('onboard.hire'),    sub: 'Post gigs, pay via escrow' },
                { key: 'sell',    icon: ShoppingBag, label: t('onboard.sell'),   sub: 'Products, services, listings' },
                { key: 'company', icon: Building2,  label: t('onboard.company'), sub: 'Brand deals, bulk gigs, invoices' },
              ].map(({ key, icon: Icon, label, sub }) => {
                const active = roles[key as keyof typeof roles];
                return (
                  <button key={key} onClick={() => setRoles(r => ({ ...r, [key]: !r[key as keyof typeof roles] }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${active ? 'border-[#00A651] bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-[#00A651] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${active ? 'text-[#00A651]' : 'text-gray-900'}`}>{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    {active && <Check className="w-5 h-5 text-[#00A651] shrink-0" />}
                  </button>
                );
              })}
            </div>
            <Next label="Save and continue"
              onClick={() => saveStep(2, { role_earn: roles.earn, role_hire: roles.hire, role_sell: roles.sell, role_company: roles.company })}
              disabled={!Object.values(roles).some(Boolean)}
            />
          </div>
        )}

        {/* ── Step 2: Profile ───────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{t('onboard.setup_profile')}</h2>
            <p className="text-gray-500 text-sm mb-6">This is your public Grind identity.</p>
            <div className="space-y-4 mb-6">
              {/* Handle */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{t('onboard.choose_handle')} *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                  <input type="text" value={handle} onChange={e => onHandleChange(e.target.value)}
                    placeholder="your_handle" autoFocus
                    className="w-full pl-8 pr-10 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
                  {handleAvail === true && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00A651] text-sm">✓</span>}
                  {handleAvail === false && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-sm">✗</span>}
                </div>
                {handleAvail === false && <p className="text-xs text-red-500 mt-1">{t('onboard.handle_taken')}</p>}
                {handleAvail === true && <p className="text-xs text-[#00A651] mt-1">{t('onboard.handle_free')}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Goodness Iyamah"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">University *</label>
                <select value={campus} onChange={e => setCampus(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] bg-white transition-colors">
                  <option value="">Select school</option>
                  {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Hostel</label>
                  <input type="text" value={hostel} onChange={e => setHostel(e.target.value)} placeholder="e.g. Moremi Hall"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Level</label>
                  <select value={level} onChange={e => setLevel(e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] bg-white transition-colors">
                    <option value="">Level</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Bio (optional)</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} maxLength={150}
                  placeholder="e.g. Design · Writing · Tutoring at OAU"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm resize-none outline-none focus:border-[#00A651] transition-colors" />
              </div>
            </div>
            <Next onClick={() => saveStep(3, { handle, full_name: fullName, campus, hostel, department, level, bio })}
              disabled={!handle || handleAvail === false || !fullName || !campus}
            />
          </div>
        )}

        {/* ── Step 3: Skills ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{t('onboard.skills_pick')}</h2>
            <p className="text-gray-500 text-sm mb-6">We use this to show you relevant gigs. Pick as many as you like.</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {SKILLS.map(s => {
                const active = selectedSkills.includes(s);
                return (
                  <button key={s}
                    onClick={() => setSelectedSkills(prev => active ? prev.filter(x => x !== s) : [...prev, s])}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${active ? 'bg-[#00A651] text-white border-[#00A651]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    {s}
                  </button>
                );
              })}
            </div>
            <Next onClick={() => saveStep(4, { skills: selectedSkills })} disabled={selectedSkills.length === 0} />
          </div>
        )}

        {/* ── Step 4: Student Verification ───────────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{t('onboard.verify_student')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('onboard.verify_sub')}</p>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center mb-4 hover:border-[#00A651] transition-colors cursor-pointer"
              onClick={() => document.getElementById('id-upload')?.click()}>
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-600">Upload student ID or matric card</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or PDF · Max 5MB</p>
              <input id="id-upload" type="file" accept="image/*,.pdf" className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5MB.'); return; }
                  toast.success('ID uploaded! We will review within 24 hours.');
                }} />
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 text-sm text-amber-800">
              {t('onboard.pending_verify')}
            </div>
            <Next label="Continue, I'll verify later" onClick={() => saveStep(5, { verification_status: 'pending' })} />
          </div>
        )}

        {/* ── Step 5: Wallet setup ────────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{t('onboard.wallet_setup')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('onboard.wallet_sub')}</p>
            <div className="space-y-4 mb-6">
              <div className="bg-[#E6F7EE] border border-[#00A651]/20 rounded-2xl p-5">
                <p className="font-bold text-gray-900 text-sm mb-1">How escrow works</p>
                <p className="text-xs text-gray-600 leading-relaxed">When a client posts a gig, their money locks in a secure vault. You only receive it after they approve your work. If they don't respond in 48 hours, it auto-releases to you.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 text-center">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Your balance</p>
                <p className="text-3xl font-black text-gray-900">₦0.00</p>
                <p className="text-xs text-gray-400 mt-1">Wallet ready</p>
              </div>
            </div>
            <Next onClick={() => saveStep(6, {})} label="Got it, continue" />
          </div>
        )}

        {/* ── Step 6: Bank details ────────────────────────────────────────── */}
        {step === 6 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{t('onboard.bank_details')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('onboard.bank_sub')}</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Bank</label>
                <select value={bankCode} onChange={e => { setBankCode(e.target.value); setBankName(banks.find(b => b.code === e.target.value)?.name ?? ''); }}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] bg-white transition-colors">
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Account Number</label>
                <input type="text" inputMode="numeric" maxLength={10}
                  value={bankAccNum} onChange={e => { setBankAccNum(e.target.value.replace(/\D/g, '')); if (e.target.value.length === 10) setTimeout(resolveAccount, 200); }}
                  placeholder="0000000000"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00A651] transition-colors" />
              </div>
              {(resolving || bankAccName) && (
                <div className={`px-4 py-3 rounded-2xl text-sm font-semibold ${bankAccName ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                  {resolving ? 'Resolving account...' : bankAccName}
                </div>
              )}
            </div>
            <Next onClick={() => saveStep(7, { bank_name: bankName, bank_code: bankCode, bank_account_number: bankAccNum, bank_account_name: bankAccName })}
              label="Save bank details"
            />
            <button onClick={() => saveStep(7, {})} className="w-full mt-3 text-center text-sm text-gray-400 hover:text-gray-600 py-2">
              Skip for now, I'll add later
            </button>
          </div>
        )}

        {/* ── Step 7: Notifications ──────────────────────────────────────── */}
        {step === 7 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Stay in the loop</h2>
            <p className="text-gray-500 text-sm mb-6">Choose what you want to hear about. You can change these in Settings.</p>
            <div className="space-y-3 mb-8">
              {[
                { label: '8am daily gig alert', sub: 'New gigs matching your skills every morning', val: notif8am, set: setNotif8am },
                { label: 'New gig matches', sub: 'When a gig that matches your profile drops', val: notifGigs, set: setNotifGigs },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{row.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{row.sub}</p>
                  </div>
                  <Toggle value={row.val} onChange={() => row.set(v => !v)} />
                </div>
              ))}
            </div>
            <Next onClick={() => saveStep(8, { notif_8am: notif8am, notif_gigs: notifGigs })} label="Almost done!" />
          </div>
        )}

        {/* ── Step 8: First action ──────────────────────────────────────── */}
        {step === 8 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">You're set! 🎉</h2>
            <p className="text-gray-500 text-sm mb-6">What do you want to do first?</p>
            <div className="space-y-3 mb-8">
              {[
                roles.earn    && { label: 'Find my first gig', sub: 'Browse gigs that match my skills', path: '/gigs', icon: '🔍' },
                roles.hire    && { label: 'Post a gig', sub: 'Find someone to help me right now', path: '/post-gig', icon: '📝' },
                roles.sell    && { label: 'Create a listing', sub: 'Sell my product or service', path: '/marketplace', icon: '🛍' },
                { label: 'Go to my profile', sub: 'Set up the rest later', path: '/profile', icon: '👤' },
              ].filter(Boolean).map((item: any) => (
                <button key={item.path} onClick={async () => { await finish(); setTimeout(() => navigate(item.path), 100); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#00A651] transition-all text-left active:scale-[0.99]"
                  disabled={loading}>
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
