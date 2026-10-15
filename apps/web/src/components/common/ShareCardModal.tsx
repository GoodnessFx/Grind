/**
 * ShareCardModal — one-tap share card after a gig completes.
 * Renders the server-generated SVG from GET /api/share-card/:userId with
 * download / WhatsApp / copy-link actions.
 */
import React from 'react';
import { Download, Share2, Copy, X, Sparkles } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface ShareCardModalProps {
  userId: string;
  /** Public profile URL used in share text */
  profileUrl?: string;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ userId, profileUrl, onClose }) => {
  const { t } = useTranslation();
  const cardUrl = `${API_BASE}/api/share-card/${userId}`;
  const shareText = `${t('share.title')} ${t('share.sub')} ${profileUrl ?? `${window.location.origin}/profile`}`;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = cardUrl;
    a.download = 'grind-share-card.svg';
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
    toast.success(t('share.download'));
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success(t('success.copied'));
    } catch {
      toast.error(t('error.generic'));
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t('share.title'), text: t('share.sub'), url: profileUrl ?? window.location.origin });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1.5 text-[#00A651] text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Gig complete
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 style={{ fontFamily: "'Syne',sans-serif" }} className="font-black text-xl text-[#0D0D14] mb-1">
          {t('share.title')}
        </h2>
        <p className="text-gray-500 text-sm mb-4">{t('share.sub')}</p>

        <div className="rounded-2xl overflow-hidden border border-gray-100 mb-4 bg-[#0A2540]">
          <img src={cardUrl} alt="Grind share card" className="w-full object-cover" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleWhatsApp}
            className="col-span-2 bg-[#00A651] hover:bg-[#008040] text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> {t('share.whatsapp')}
          </button>
          <button
            onClick={handleDownload}
            className="border border-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" /> {t('share.download')}
          </button>
          <button
            onClick={handleCopy}
            className="border border-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Copy className="w-4 h-4" /> {t('success.copied').replace('!', '')}
          </button>
        </div>

        <button
          onClick={handleNativeShare}
          className="w-full text-[#00A651] hover:text-[#008040] text-xs font-bold py-2"
        >
          More share options…
        </button>
      </div>
    </div>
  );
};
