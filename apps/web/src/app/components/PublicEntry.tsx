import React from "react";
import { ArrowRight, Users, Shield, Clock, Tag } from "lucide-react";
import { ALL_TASKS } from "./TaskBoard";
import { LogoMark } from "./brand/LogoMark";
import { Login } from "./Login";
import { cn } from "../../lib/utils";
import type { UserData } from "../App";

function Shell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-accent relative overflow-hidden">
      {/* Splash-like blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute top-[28%] -left-20 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 right-[18%] w-72 h-72 rounded-full bg-white/10" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Small brand header */}
        <div className="px-5 pt-10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              <LogoMark size={26} tone="light" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-extrabold tracking-tight leading-tight">Grind</p>
              <p className="text-white/70 text-[11px] font-medium leading-tight">
                Trustless gigs, across schools
              </p>
            </div>
          </div>
        </div>

        {/* Content sheet */}
        <div className="flex-1 bg-white rounded-t-3xl overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function GigPreviewCard({ gigId }: { gigId: number }) {
  const task = ALL_TASKS.find((t) => t.id === gigId);
  if (!task) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-gray-900">Gig not found</p>
        <p className="text-xs text-gray-500 mt-1">This link may be outdated.</p>
      </div>
    );
  }

  const urgent = task.deadline.includes("hour") || task.deadline.includes("1 day");

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold text-accent uppercase tracking-wide">Shared gig</p>
          <h2 className="mt-1 text-[15px] font-extrabold text-gray-900 leading-snug line-clamp-2 tracking-tight">
            {task.title}
          </h2>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-gray-500 font-semibold">Budget</p>
          <p className="text-[15px] font-extrabold text-gray-900 tracking-tight">₦{task.price.toLocaleString()}</p>
          <p className="text-[10px] font-extrabold text-accent">cNGN</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-[11px] font-bold border border-black/5">
          <Tag className="w-3 h-3" />
          {task.category}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold border border-black/5",
            urgent ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
          )}
        >
          <Clock className="w-3 h-3" />
          {task.deadline}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-grind-accent-light text-accent px-3 py-1 text-[11px] font-bold">
          <Shield className="w-3 h-3" />
          Escrow protected
        </span>
      </div>

      <p className="mt-3 text-xs text-gray-600 leading-relaxed line-clamp-2">
        {task.description}
      </p>
    </div>
  );
}

export function PublicGigEntry({
  gigId,
  onLogin,
}: {
  gigId: number;
  onLogin: (user: UserData) => void;
}) {
  return (
    <Shell>
      <Login
        onLogin={onLogin}
        layout="card"
        context={{
          title: "Sign up to apply",
          subtitle: "See what you were sent, then create an account to apply.",
          prelude: <GigPreviewCard gigId={gigId} />,
        }}
      />
      <div className="px-6 pb-8">
        <div className="mt-2 rounded-2xl bg-grind-accent-light border border-accent/15 p-4 flex items-start gap-3">
          <Users className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">
            Grind connects students across different schools. Build your profile once and use it everywhere.
          </p>
        </div>
      </div>
    </Shell>
  );
}

export function PublicReferralEntry({
  ref,
  onLogin,
  stats,
}: {
  ref: string;
  onLogin: (user: UserData) => void;
  stats?: { activeGigs?: number; students?: number };
}) {
  const activeGigs = stats?.activeGigs ?? ALL_TASKS.length;
  const students = stats?.students ?? 1200;

  return (
    <Shell>
      <Login
        onLogin={onLogin}
        layout="card"
        context={{
          title: "You were invited to Grind",
          subtitle: `Join with referral code “${ref}”. Create an account to start earning.`,
          prelude: (
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-grind-primary to-grind-primary p-5 shadow-lg">
              <p className="text-white/80 text-xs font-bold uppercase tracking-wide">Quick intro</p>
              <p className="mt-2 text-white text-[15px] font-extrabold leading-snug tracking-tight">
                A trustless student gig marketplace, built for cross-campus work.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/90">
                  {activeGigs} active gigs
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/90">
                  {students.toLocaleString()} students
                </div>
                <div className="ml-auto text-white/80 text-[11px] font-semibold flex items-center gap-1">
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ),
        }}
      />
    </Shell>
  );
}

