/**
 * ReportModal — report a gig, user, message or post.
 * POSTs to /api/reports (authenticated). Used on gig cards, profiles and chat.
 */
import React, { useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/auth';
import { useTranslation } from '../../lib/i18n';
import { toast } from 'sonner';

export type ReportTargetType = 'gig' | 'user' | 'message' | 'post';

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
}

const REASON_KEYS = [
  'report.spam',
  'report.inappropriate',
  'report.fake',
  'report.harassment',
  'report.other',
];

export const ReportModal: React.FC<ReportModalProps> = ({ targetType, targetId, onClose }) => {
  const { t } = useTranslation();
  const [reasonKey, setReasonKey] = useState(REASON_KEYS[0]);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (sending) return;
    setSending(true);
    try {
      await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason: t(reasonKey),
          details: details.trim() || undefined,
        }),
      });
      toast.success(t('report.success'));
      onClose();
    } catch (err: any) {
      const msg = String(err?.message ?? '');
      toast.error(
        msg.includes('Unauthorized') || msg.includes('Authorization')
          ? 'Log in first to send a report.'
          : msg || t('error.generic'),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </span>
            <h2 className="font-black text-lg text-[#0D0D14]">{t('report.title')}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-5">{t('report.sub')}</p>

        {/* Reasons */}
        <div className="space-y-2 mb-4">
          {REASON_KEYS.map((key) => (
            <label
              key={key}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-colors ${
                reasonKey === key
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                checked={reasonKey === key}
                onChange={() => setReasonKey(key)}
                className="accent-red-500"
              />
              <span className="text-sm font-medium text-gray-700">{t(key)}</span>
            </label>
          ))}
        </div>

        {/* Extra details */}
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Anything else we should know? (optional)"
          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-red-300 resize-none mb-5"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-2xl text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={sending}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {sending && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('report.send')}
          </button>
        </div>
      </div>
    </div>
  );
};
