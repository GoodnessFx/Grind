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
import { LiveStream } from "./components/LiveStream";
import { BottomNav } from "./components/BottomNav";

export type Tab = "home" | "gigs" | "live" | "wallet" | "profile";

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
  | { name: "main"; tab: Tab }
  | { name: "task-detail"; taskId: number }
  | { name: "post-task" }
  | { name: "settings" };

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

  const handleSplashComplete = useCallback(() => {
    const savedUser = localStorage.getItem("grind_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setScreen({ name: "main", tab: "home" });
      } catch {
        setScreen({ name: "login" });
      }
    } else {
      setScreen({ name: "login" });
    }
  }, []);

  const handleLogin = useCallback((userData: UserData) => {
    setUser(userData);
    localStorage.setItem("grind_user", JSON.stringify(userData));
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
          />
        )}
        {tab === "gigs" && (
          <TaskBoard
            user={user}
            onTaskClick={openTaskDetail}
            onPostTask={openPostTask}
          />
        )}
        {tab === "live" && (
          <LiveStream user={user} onUpdateUser={updateUser} />
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
