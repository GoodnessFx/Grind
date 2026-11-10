import React, { useState } from "react";
import { X, Flag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { apiFetch } from "../../lib/auth";

interface ReportModalProps {
  targetType: "gig" | "user" | "message";
  targetId: string | number;
  onClose: () => void;
}

const REASONS = [
  { value: "spam_scam", label: "Na spam or scam" },
  { value: "inappropriate", label: "Content nor correct" },
  { value: "fake", label: "Na fake profile" },
  { value: "harassment", label: "Person dey harass me" },
  { value: "other", label: "Something else" },
];

export function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) { toast.error("Pick a reason first"); return; }
    setSubmitting(true);
    try {
      await apiFetch("/api/reports", {
        method: "POST",
        body: JSON.stringify({ target_type: targetType, target_id: String(targetId), reason, details }),
      });
    } catch {
      // Save to local queue if server is down
      try {
        const q = JSON.parse(localStorage.getItem("grind_report_queue") ?? "[]");
        q.push({ target_type: targetType, target_id: String(targetId), reason, details, ts: Date.now() });
        localStorage.setItem("grind_report_queue", JSON.stringify(q));
      } catch { /* ignore */ }
    } finally {
      setSubmitting(false);
      toast.success("Report don go. We go look am 👀");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            <h3 className="text-lg font-extrabold text-gray-900">Report this</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Tell us wetin happen</p>

        <div className="space-y-2 mb-5">
          {REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all",
                reason === r.value
                  ? "border-red-500 bg-red-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 shrink-0",
                reason === r.value ? "border-red-500 bg-red-500" : "border-gray-300"
              )} />
              <span className={cn(
                "text-sm font-semibold",
                reason === r.value ? "text-red-600" : "text-gray-700"
              )}>
                {r.label}
              </span>
            </button>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Add more details (optional)..."
          rows={2}
          maxLength={300}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 mb-1"
        />
        <p className="text-[10px] text-gray-400 text-right mb-4">{details.length}/300</p>

        <button
          onClick={handleSubmit}
          disabled={!reason || submitting}
          className="w-full h-13 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-[0.99]"
        >
          {submitting ? "Sending..." : "Send report"}
        </button>
      </div>
    </div>
  );
}
