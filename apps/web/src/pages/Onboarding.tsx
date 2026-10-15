/**
 * Onboarding — clean 5-step flow.
 * Reduced from 8 to 5 steps to lower drop-off.
 * Each step saves to DB (or localStorage as fallback).
 *
 * Steps: 1=role  2=profile+handle  3=skills  4=bank(optional)  5=done
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Check, Briefcase, ShoppingBag, Building2,
  Users, ChevronLeft, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { LogoMark } from '../app/components/brand/LogoMark';
import { useAuth, upsertProfile, apiFetch, checkHandleAvailable } from '../lib/auth';

const TOTAL = 5;

const SKILLS = [
  'Writing', 'Design', 'Coding', 'Tutoring', 'Delivery',
  'Hostel Runs', 'Food Pickup', 'Braid and Barb', 'Phone Repair',
  'Printing', 'Laundry', 'Video', 'Research', 'Assignment', 'Thrift',
];

const UNIS = [
  'University of Lagos (UNILAG)', 'Obafemi Awolowo University (OAU)',
  'University of Ibadan (UI)', 'University of Ilorin', 'University of Nigeria, Nsukka',
  'Ahmadu Bello University', 'Federal University of Technology, Akure',
  'Ouí University', 'Covenant University', 'Babcock University',
  'Lagos State University', 'Other',
];

const LEVELS = ['100L', '200L', '300L', '400L', '500L', 'HND 1', 'HND 2', 'Masters', 'PhD'];

// ── Reusable atoms ────────────────────────────────────────────────────────────
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-[#00A651] transition-all ${props.className ?? ''}`}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select
    {...props}
    className={`w-full px-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-[#00A651] transition-all appearance-none ${props.className ?? ''}`}
  />
);

// ── Main component ────────────────────────────────────────────────────────────
export const Onboarding: React.FC = () => {
  const { user, authUser, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]   = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — role
  const [roles, setRoles] = useState({ earn: false, hire: false, sell: false, company: false });

  // Step 2 — profile
  const [handle, setHandle]     = useState('');
  const [handleOk, setHandleOk] = useState<boolean | null>(null);
  const [fullName, setFullName] = useState('');
  const [campus, setCampus]     = useState('');
  const [hostel, setHostel]     = useState('');
  const [level, setLevel]       = useState('');
  const [bio, setBio]           = useState('');

  // Step 3 — skills
  const [skills, setSkills] = useState<string[]>([]);

  // Step 4 — bank (optional)
  const [banks, setBanks]       = useState<{ name: string; code: string }[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accNum, setAccNum]     = useState('');
  const [accName, setAccName]   = useState('');
  const [resolving, setResolving] = useState(false);

  // Restore from saved profile
  useEffect(() => {
    if (!user) return;
    if (user.onboarding_complete) { navigate('/profile', { replace: true }); return; }
    const saved = user.onboarding_step ?? 1;
    setStep(Math.max(1, Math.min(saved, TOTAL)));
    setHandle(user.handle ?? '');
    setFullName(user.full_name ?? '');
    setCampus(user.campus ?? '');
    setHostel(user.hostel ?? '');
    setLevel(user.level ?? '');
    setBio(user.bio ?? '');
    setSkills(user.skills ?? []);
    setRoles({ earn: user.role_earn, hire: user.role_hire, sell: user.role_sell, company: user.role_company });
  }, [user]);

  // Load banks list (graceful — no Paystack keys in dev = empty list)
  useEffect(() => {
    apiFetch<{ banks: any[] }>('/api/wallet/banks').then(d => setBanks(d.banks ?? [])).catch(() => {});
  }, []);

  // Live handle check
  const debounce = React.useRef<ReturnType<typeof setTimeout>>();
  const onHandleChange = (v: string) => {
    const clean = v.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);
    setHandle(clean);
    setHandleOk(null);
    clearTimeout(debounce.current);
    if (clean.length >= 3) {
      debounce.current = setTimeout(async () => {
        setHandleOk(await checkHandleAvailable(clean));
      }, 500);
    }
  };

  // Paystack name resolve
  const resolveBank = useCallback(async () => {
    if (accNum.length !== 10 || !bankCode) return;
    setResolving(true);
    try {
      const d = await apiFetch<{ account_name: string }>('/api/wallet/resolve-account', {
        method: 'POST',
        body: JSON.stringify({ account_number: accNum, bank_code: bankCode }),
      });
      setAccName(d.account_name);
    } catch {
      setAccName('');
    } finally {
      setResolving(false);
    }
  }, [accNum, bankCode]);

  useEffect(() => {
    if (accNum.length === 10 && bankCode) resolveBank();
  }, [accNum, bankCode, resolveBank]);

  // Save and advance
  const advance = async (updates: Record<string, any>, next: number) => {
    setSaving(true);
    try {
      if (authUser?.id) {
        await upsertProfile(authUser.id, { ...updates, onboarding_step: next } as any);
        await refreshProfile();
      } else {
        // Demo / no-Supabase fallback — persist to localStorage
        const stored = JSON.parse(localStorage.getItem('grind_user') ?? '{}');
        localStorage.setItem('grind_user', JSON.stringify({ ...stored, ...updates, onboarding_step: next }));
      }
      setStep(next);
    } catch {
      toast.error('Wahala dey. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      if (authUser?.id) {
        await upsertProfile(authUser.id, {
          bank_name: bankName, bank_code: bankCode,
          bank_account_number: accNum, bank_account_name: accName,
          onboarding_step: TOTAL, onboarding_complete: true,
        } as any);
        await refreshProfile();
      } else {
        const stored = JSON.parse(localStorage.getItem('grind_user') ?? '{}');
        localStorage.setItem('grind_user', JSON.stringify({
          ...stored, onboarding_complete: true,
        }));
      }
      toast.success('Gbam! You\'re ready to grind 🎉');
      const first = roles.earn ? '/gigs' : roles.hire ? '/post-gig' : '/marketplace';
      navigate(first, { replace: true });
    } catch {
      toast.error('Wahala dey. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── UI atoms ─────────────────────────────────────────────────────────────────
  const Progress = () => (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: TOTAL }).map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < step ? 'bg-[#00A651]' : 'bg-gray-100'}`} />
      ))}
    </div>
  );

  const Btn = ({ label = 'Continue', onClick, disabled = false }: { label?: string; onClick: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled || saving}
      className="w-full bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40 text-sm"
      style={{ fontFamily: "'Syne',sans-serif" }}>
      {saving ? 'Saving…' : <>{label} <ArrowRight className="w-4 h-4" /></>}
    </button>
  );

  const SkipBtn = ({ label = 'Skip for now', onClick }: { label?: string; onClick: () => void }) => (
    <button onClick={onClick} className="w-full mt-3 text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
      {label}
    </button>
  );

  const BackBtn = () => step > 1 ? (
    <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
      <ChevronLeft className="w-4 h-4" /> Back
    </button>
  ) : null;

  // ── Steps ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-10"
      style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
          <LogoMark size={28} tone="dark" framed />
          <span style={{ fontFamily: "'Syne',sans-serif" }} className="text-[#0D0D14] font-black text-lg tracking-tight">Grind</span>
        </Link>

        <Progress />
        <BackBtn />

        {/* ── Step 1: Role ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl font-black text-[#0D0D14] mb-1.5 tracking-tight">
              How you wan use Grind?
            </h2>
            <p className="text-gray-400 text-sm mb-6">Pick everything that applies. You can change later.</p>
            <div className="space-y-2.5 mb-7">
              {[
                { key: 'earn',    Icon: Briefcase,   label: 'I want to earn',    sub: 'Gigs, freelance, campus jobs' },
                { key: 'hire',    Icon: Users,       label: 'I want to hire',    sub: 'Post gigs, pay via escrow' },
                { key: 'sell',    Icon: ShoppingBag, label: 'I want to sell',    sub: 'Products, services, listings' },
                { key: 'company', Icon: Building2,   label: 'I\'m a company',   sub: 'Brand deals, bulk gigs, invoices' },
              ].map(({ key, Icon, label, sub }) => {
                const on = roles[key as keyof typeof roles];
                return (
                  <button key={key}
                    onClick={() => setRoles(r => ({ ...r, [key]: !r[key as keyof typeof roles] }))}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${on ? 'border-[#00A651] bg-green-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${on ? 'bg-[#00A651] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${on ? 'text-[#00A651]' : 'text-[#0D0D14]'}`}>{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                    {on && <Check className="w-4 h-4 text-[#00A651] shrink-0" />}
                  </button>
                );
              })}
            </div>
            <Btn label="Save and continue"
              onClick={() => advance({ role_earn: roles.earn, role_hire: roles.hire, role_sell: roles.sell, role_company: roles.company }, 2)}
              disabled={!Object.values(roles).some(Boolean)} />
          </div>
        )}

        {/* ── Step 2: Profile ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl font-black text-[#0D0D14] mb-1.5 tracking-tight">
              Set up your profile
            </h2>
            <p className="text-gray-400 text-sm mb-6">This is your public Grind identity.</p>
            <div className="space-y-3 mb-6">
              {/* Handle */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Your handle *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">@</span>
                  <Input value={handle} onChange={e => onHandleChange(e.target.value)} placeholder="your_handle" autoFocus className="pl-8 pr-9" />
                  {handleOk === true  && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00A651] text-sm">✓</span>}
                  {handleOk === false && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-sm">✗</span>}
                </div>
                {handleOk === false && <p className="text-xs text-red-500 mt-1">That handle don go. Try another one.</p>}
                {handleOk === true  && <p className="text-xs text-[#00A651] mt-1">E dey available!</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full name *</label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Goodness Iyamah" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">University *</label>
                <Select value={campus} onChange={e => setCampus(e.target.value)}>
                  <option value="">Select your school</option>
                  {UNIS.map(u => <option key={u} value={u}>{u}</option>)}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Hostel</label>
                  <Input value={hostel} onChange={e => setHostel(e.target.value)} placeholder="e.g. Moremi" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Level</label>
                  <Select value={level} onChange={e => setLevel(e.target.value)}>
                    <option value="">Level</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Bio (optional)</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} maxLength={150}
                  placeholder="e.g. Design · Coding · Tutoring at UNILAG"
                  className="w-full px-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-2xl text-sm resize-none outline-none focus:bg-white focus:border-[#00A651] transition-all" />
              </div>
            </div>
            <Btn onClick={() => advance({ handle, full_name: fullName, campus, hostel, level, bio }, 3)}
              disabled={!handle || handleOk === false || !fullName.trim() || !campus} />
          </div>
        )}

        {/* ── Step 3: Skills ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl font-black text-[#0D0D14] mb-1.5 tracking-tight">
              Wetin you sabi do?
            </h2>
            <p className="text-gray-400 text-sm mb-6">Pick the skills that match you. We use this to show you the right gigs.</p>
            <div className="flex flex-wrap gap-2 mb-7">
              {SKILLS.map(s => {
                const on = skills.includes(s);
                return (
                  <button key={s}
                    onClick={() => setSkills(p => on ? p.filter(x => x !== s) : [...p, s])}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${on ? 'bg-[#00A651] text-white border-[#00A651]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    {s}
                  </button>
                );
              })}
            </div>
            <Btn onClick={() => advance({ skills }, 4)} disabled={skills.length === 0} />
            <SkipBtn onClick={() => advance({ skills: [] }, 4)} />
          </div>
        )}

        {/* ── Step 4: Bank details (optional) ── */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl font-black text-[#0D0D14] mb-1.5 tracking-tight">
              Add your bank details
            </h2>
            <p className="text-gray-400 text-sm mb-6">This is where we send your money when you cash out. You can add this later in Settings.</p>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Bank</label>
                <Select value={bankCode} onChange={e => { setBankCode(e.target.value); setBankName(banks.find(b => b.code === e.target.value)?.name ?? ''); }}>
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                  {banks.length === 0 && <option value="gtb">GTBank (setup Paystack to see all)</option>}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Account number</label>
                <Input type="text" inputMode="numeric" maxLength={10} value={accNum}
                  onChange={e => setAccNum(e.target.value.replace(/\D/g, ''))} placeholder="0000000000" />
              </div>
              {(resolving || accName) && (
                <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${accName ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                  {resolving ? 'Checking account…' : accName}
                </div>
              )}
            </div>
            <Btn label="Save bank details" onClick={() => advance({ bank_name: bankName, bank_account_number: accNum, bank_account_name: accName }, 5)} />
            <SkipBtn onClick={() => advance({}, 5)} />
          </div>
        )}

        {/* ── Step 5: Done ── */}
        {step === 5 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-[#00A651]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[#00A651]" />
            </div>
            <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl font-black text-[#0D0D14] mb-2 tracking-tight">
              You're ready to grind!
            </h2>
            <p className="text-gray-400 text-sm mb-8">What do you want to do first?</p>
            <div className="space-y-2.5 text-left mb-6">
              {[
                roles.earn    && { label: 'Find my first gig', sub: 'Browse gigs matching my skills', path: '/gigs', emoji: '🔍' },
                roles.hire    && { label: 'Post a gig', sub: 'Find someone to help you right now', path: '/post-gig', emoji: '📝' },
                roles.sell    && { label: 'Create a listing', sub: 'Sell your product or service', path: '/marketplace', emoji: '🛍️' },
                { label: 'Go to my profile', sub: 'Finish setting up later', path: '/profile', emoji: '👤' },
              ].filter(Boolean).map((item: any) => (
                <button key={item.path}
                  onClick={async () => { await finish(); setTimeout(() => navigate(item.path), 150); }}
                  disabled={saving}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-[#00A651] bg-white transition-all text-left active:scale-[0.99]">
                  <span className="text-xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0D0D14] text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
            {saving && <p className="text-xs text-gray-400">Saving…</p>}
          </div>
        )}
      </div>
    </div>
  );
};
