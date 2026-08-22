import React, { useState, useEffect, useCallback } from "react";
import { Toaster } from "sonner";
import { Splash } from "./components/Splash";
import { Login } from "./components/Login";
import { Home } from "./components/Home";
import { TaskBoard } from "./components/TaskBoard";
import { TaskDetail } from "./components/TaskDetail";
import { PostTask } from "./components/PostTask";
import { Wallet } from "./components/Wallet";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { DiscoveryFeed } from "./components/DiscoveryFeed";
import { LiveStream } from "./components/LiveStream";
import { BottomNav } from "./components/BottomNav";
import { PublicGigEntry, PublicReferralEntry } from "./components/PublicEntry";

export type Tab = "home" | "gigs" | "discovery" | "wallet" | "profile";

export interface UserData {
  id: string;
  userName: string;
  handle: string;
  email: string;
  school: string;
  level: string;
  score: number;
  tier: "STARTER" | "BRONZE" | "GOLD" | "DIAMOND";
  walletBalance: number;
  isCreator: boolean;
  transactions: Transaction[];
  notifications: Notification[];
  referrals: number;
  bio?: string;
  phone?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  skills?: string[];
  portfolio?: Array<{title: string, url: string}>;
  showSchool?: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: string;
  type?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

type Screen =
  | { name: "splash" }
  | { name: "login" }
  | { name: "public-gig"; gigId: number }
  | { name: "public-referral"; ref: string }
  | { name: "main"; tab: Tab }
  | { name: "task-detail"; taskId: number }
  | { name: "post-task" }
  | { name: "settings" }
  | { name: "live" };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "splash" });
  const [user, setUser] = useState<UserData | null>(null);

  // On mount: check saved session
  useEffect(() => {
    const savedUser = localStorage.getItem("grind_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("grind_user");
      }
    }
  }, []);

  // Handle referral tracking on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      sessionStorage.setItem("referrer", ref);
    }
  }, []);

  const getPublicIntent = useCallback(() => {
    const path = window.location.pathname || "/";
    const gigMatch = path.match(/^\/gig\/(\d+)\/?$/);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (gigMatch?.[1]) {
      const gigId = Number(gigMatch[1]);
      if (Number.isFinite(gigId)) return { kind: "gig" as const, gigId };
    }
    if (ref) return { kind: "ref" as const, ref };
    return { kind: "none" as const };
  }, []);

  const handleSplashComplete = useCallback(() => {
    const savedUser = localStorage.getItem("grind_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);

        const intent = getPublicIntent();
        if (intent.kind === "gig") {
          sessionStorage.removeItem("post_login_gig");
          setScreen({ name: "task-detail", taskId: intent.gigId });
          window.history.replaceState({}, "", "/");
          return;
        }

        setScreen({ name: "main", tab: "home" });
      } catch {
        const intent = getPublicIntent();
        if (intent.kind === "gig") {
          sessionStorage.setItem("post_login_gig", String(intent.gigId));
          setScreen({ name: "public-gig", gigId: intent.gigId });
        } else if (intent.kind === "ref") {
          setScreen({ name: "public-referral", ref: intent.ref });
        } else {
          setScreen({ name: "login" });
        }
      }
    } else {
      const intent = getPublicIntent();
      if (intent.kind === "gig") {
        sessionStorage.setItem("post_login_gig", String(intent.gigId));
        setScreen({ name: "public-gig", gigId: intent.gigId });
      } else if (intent.kind === "ref") {
        setScreen({ name: "public-referral", ref: intent.ref });
      } else {
        setScreen({ name: "login" });
      }
    }
  }, [getPublicIntent]);

  const handleLogin = useCallback((userData: UserData) => {
    setUser(userData);
    localStorage.setItem("grind_user", JSON.stringify(userData));
    const pendingGig = sessionStorage.getItem("post_login_gig");
    if (pendingGig) {
      const gigId = Number(pendingGig);
      sessionStorage.removeItem("post_login_gig");
      setScreen({ name: "task-detail", taskId: gigId });
      window.history.replaceState({}, "", "/");
      return;
    }
    setScreen({ name: "main", tab: "home" });
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("grind_user");
    setScreen({ name: "login" });
  }, []);

  const updateUser = useCallback((updates: Partial<UserData>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem("grind_user", JSON.stringify(next));
      return next;
    });
  }, []);

  const navigate = useCallback((tab: Tab) => {
    setScreen({ name: "main", tab });
  }, []);

  const openPostTask = useCallback(() => {
    setScreen({ name: "post-task" });
  }, []);

  const openSettings = useCallback(() => {
    setScreen({ name: "settings" });
  }, []);

  const openLive = useCallback(() => {
    setScreen({ name: "live" });
  }, []);

  const openTaskDetail = useCallback((taskId: number) => {
    setScreen({ name: "task-detail", taskId });
  }, []);

  const goBack = useCallback(() => {
    setScreen({ name: "main", tab: "home" });
  }, []);

  // ── Splash ──────────────────────────────────────────────────────────────────
  if (screen.name === "splash") {
    return <Splash onComplete={handleSplashComplete} />;
  }

  // ── Public Gig Deep Link (logged out) ───────────────────────────────────────
  if (screen.name === "public-gig") {
    return (
      <>
        <Toaster position="top-center" richColors />
        <PublicGigEntry gigId={screen.gigId} onLogin={handleLogin} />
      </>
    );
  }

  // ── Public Referral Deep Link (logged out) ──────────────────────────────────
  if (screen.name === "public-referral") {
    return (
      <>
        <Toaster position="top-center" richColors />
        <PublicReferralEntry ref={screen.ref} onLogin={handleLogin} />
      </>
    );
  }

  // ── Login ───────────────────────────────────────────────────────────────────
  if (screen.name === "login" || !user) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  // ── Post Task ───────────────────────────────────────────────────────────────
  if (screen.name === "post-task") {
    return (
      <div className="h-full bg-white overflow-y-auto">
        <Toaster position="top-center" richColors />
        <PostTask
          onBack={() => setScreen({ name: "main", tab: "gigs" })}
          onPostSuccess={() => setScreen({ name: "main", tab: "gigs" })}
        />
      </div>
    );
  }

  // ── Settings ────────────────────────────────────────────────────────────────
  if (screen.name === "settings") {
    return (
      <div className="h-full bg-background overflow-y-auto">
        <Toaster position="top-center" richColors />
        <Settings
          user={user}
          onBack={() => setScreen({ name: "main", tab: "profile" })}
          onLogout={handleLogout}
          onUpdate={updateUser}
        />
      </div>
    );
  }

  // ── Live Stream ─────────────────────────────────────────────────────────────
  if (screen.name === "live") {
    return (
      <div className="h-full bg-white overflow-y-auto">
        <Toaster position="top-center" richColors />
        <LiveStream
          user={user}
          onUpdateUser={updateUser}
          onBack={() => setScreen({ name: "main", tab: "home" })}
        />
      </div>
    );
  }

  // ── Task Detail ─────────────────────────────────────────────────────────────
  if (screen.name === "task-detail") {
    return (
      <div className="h-full bg-white overflow-y-auto">
        <Toaster position="top-center" richColors />
        <TaskDetail
          taskId={screen.taskId}
          user={user}
          onBack={() => setScreen({ name: "main", tab: "gigs" })}
        />
      </div>
    );
  }

  // ── Main App (tabbed) ───────────────────────────────────────────────────────
  const tab = screen.name === "main" ? screen.tab : "home";

  return (
    <div className="h-full flex flex-col bg-background">
      <Toaster position="top-center" richColors />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {tab === "home" && (
          <Home
            user={user}
            onNavigate={navigate}
            onPostTask={openPostTask}
            onTaskClick={openTaskDetail}
            onUpdateUser={updateUser}
            onGoLive={openLive}
          />
        )}
        {tab === "gigs" && (
          <TaskBoard
            user={user}
            onTaskClick={openTaskDetail}
            onPostTask={openPostTask}
          />
        )}
        {tab === "discovery" && (
          <DiscoveryFeed user={user} onNavigate={navigate} />
        )}
        {tab === "wallet" && (
          <Wallet
            user={user}
            onUpdateUser={updateUser}
          />
        )}
        {tab === "profile" && (
          <Profile
            user={user}
            onLogout={handleLogout}
            onUpdate={updateUser}
            onOpenSettings={openSettings}
          />
        )}
      </div>

      {/* Fixed bottom navigation */}
      <BottomNav
        activeTab={tab}
        onTabChange={navigate}
        onPostTask={openPostTask}
      />
    </div>
  );
}
