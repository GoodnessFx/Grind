/**
 * PostGigPage — /post-gig — 3-step wizard that POSTs to /api/gigs.
 * The server runs the scam/spam keyword filter (hasScamContent) on submit;
 * we mirror it client-side for instant feedback and surface the server's
 * "under review" warning when a gig gets flagged.
 */
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, Loader2, Shield,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { apiFetch, useAuth } from '../lib/auth';
import { useTranslation } from '../lib/i18n';
import { toast } from 'sonner';

// Mirror of SCAM_KEYWORDS in apps/server/src/routes/gigs.ts (server is source of truth)
const SCAM_KEYWORDS = [
  'send me money', 'pay upfront', 'western union', 'moneygram', 'bitcoin', 'btc',
  'crypto', 'ponzi', 'invest and earn', 'double your money', 'work from home and earn daily',
  'nudes', 'adult content', '18+',
];

const CATEGORIES = [
  'Writing', 'Design', 'Coding', 'Tutoring', 'Delivery', 'Research',
  'Video', 'Hostel Runs', 'Food Pickup', 'Assignment', 'Braid and Barb',
  'Thrift', 'Phone Repair', 'Printing', 'Laundry', 'Other',
];

function findScamWords(text: string): string[] {
  const lower = text.toLowerCase();
  return SCAM_KEYWORDS.filter((k) => lower.includes(k));
}

export const PostGigPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Writing');
  const [budgetNaira, setBudgetNaira] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('3');
  const [submitting, setSubmitting] = useState(false);

  const scamHits = useMemo(
    () => findScamWords(`${title}\n${description}`),
    [title, description],
  );

  const step1Valid = title.trim().length >= 10 && description.trim().length >= 20;
  const budget = Number(budgetNaira.replace(/[^0-9]/g, ''));
  const days = Number(deadlineDays);
  const step2Valid = budget >= 500 && days >= 1 && days <= 90 && !!category;

  const submit = async () => {
    if (submitting) return;
    if (!step1Valid || !step2Valid) { toast.error('Complete all fields first'); return; }
    setSubmitting(true);
    try {
      const res = await apiFetch<{ gig: any; warning?: string }>('/api/gigs', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          budget: budget * 100, // kobo
          deadline_days: days,
        }),
      });
      if (res.warning) {
        toast.warning(res.warning);
      } else {
        toast.success(t('gig.post_success'));
      }
      navigate('/gigs');
    } catch (err: any) {
      toast.error(String(err?.message ?? t('error.generic')));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        <Navbar />
        <div className="py-24 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-[#00A651]" /></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        <Navbar />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <Shield className="w-10 h-10 text-[#00A651] mx-auto mb-4" />
          <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-2xl font-black text-[#0D0D14] mb-2">
            {t('home.post_gig')}
          </h1>
          <p className="text-gray-500 text-sm mb-6">Log in first — every gig poster is a real, verified student.</p>
          <Link to="/login" className="inline-block bg-[#0D0D14] hover:bg-[#00A651] text-white font-bold px-8 py-3.5 rounded-full text-sm transition-colors">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/gigs" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#0D0D14] text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to gigs
        </Link>

        <h1 style={{ fontFamily: "'Syne',sans-serif" }} className="text-3xl font-black text-[#0D0D14] tracking-tight mb-2">
          {t('home.post_gig')}
        </h1>
        <p className="text-gray-500 text-sm mb-6">Step {step} of 3 — your budget locks in escrow, not our pocket.</p>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= step ? 'bg-[#00A651]' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          {step === 1 && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Gig title <span className="text-gray-300">({title.trim().length}/120, min 10)</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="e.g. Design a logo for my thrift store"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#00A651] mb-5"
              />
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Description <span className="text-gray-300">({description.trim().length}/1000, min 20)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Say exactly wetin you need — deliverables, style, timeline..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#00A651] resize-none mb-3"
              />

              {/* Client-side spam echo — server (hasScamContent) has the final say */}
              {scamHits.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">This fit look like scam: “{scamHits[0]}”</p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Remove risky words (upfront payment, crypto, adult content) or the gig goes to manual review before e go live.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Category</label>
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`text-xs font-bold px-4 py-2 rounded-full border transition-colors ${
                      category === c
                        ? 'bg-[#0D0D14] text-white border-[#0D0D14]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                    Budget (₦, min 500)
                  </label>
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-2xl px-4">
                    <span className="text-gray-500 font-bold text-sm">₦</span>
                    <input
                      value={budgetNaira}
                      onChange={(e) => setBudgetNaira(e.target.value)}
                      inputMode="numeric"
                      placeholder="e.g. 5000"
                      className="flex-1 min-w-0 bg-transparent py-3 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                    Deadline (1–90 days)
                  </label>
                  <input
                    value={deadlineDays}
                    onChange={(e) => setDeadlineDays(e.target.value)}
                    inputMode="numeric"
                    placeholder="3"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#00A651]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="bg-[#F7F8FA] rounded-2xl p-5 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#00A651] mb-1">{category}</p>
                <h3 style={{ fontFamily: "'Syne',sans-serif" }} className="font-black text-lg text-[#0D0D14] mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-4">{description}</p>
                <div className="flex gap-4 text-sm font-bold text-[#0D0D14]">
                  <span>₦{budget.toLocaleString('en-NG')}</span>
                  <span className="text-gray-400">· {days} day{days === 1 ? '' : 's'}</span>
                </div>
              </div>

              <div className="bg-[#00A651]/8 border border-[#00A651]/20 rounded-2xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#00A651] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  When someone accepts, <span className="font-bold">₦{budget.toLocaleString('en-NG')} locks in escrow</span>.
                  Release am only when the work don complete. Doer gets paid minus platform (8%) + escrow (1.5%) fees.
                </p>
              </div>

              {scamHits.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mt-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    We spot risky wording (“{scamHits[0]}”). The gig go enter manual review before e go live.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Nav */}
          <div className="flex gap-2 mt-7">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 border border-gray-200 hover:border-gray-400 text-gray-600 font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 ? !step1Valid : !step2Valid}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#0D0D14] hover:bg-[#00A651] disabled:opacity-40 text-white font-bold text-sm py-3.5 rounded-2xl transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-[#00A651] hover:bg-[#008040] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-2xl transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Post gig — ₦{budget.toLocaleString('en-NG')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

