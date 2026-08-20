import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Splash } from "./components/Splash";
import { Login } from "./components/Login";
import { Home } from "./components/Home";
import { TaskBoard } from "./components/TaskBoard";
import { TaskDetail } from "./components/TaskDetail";
import { PostTask } from "./components/PostTask";
import { Wallet } from "./components/Wallet";
import { Profile } from "./components/Profile";
import { BottomNav } from "./components/BottomNav";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showPostTask, setShowPostTask] = useState(false);

  useEffect(() => {
    // Handle Referral Tracking
    const urlParams = new URLSearchParams(window.location.search);
    const refHandle = urlParams.get('ref');
    if (refHandle) {
      console.log(`[REFERRAL] Tracking referral for @${refHandle}`);
      // In a real app, this would hit an API to increment the referrer's count
      toast.info(`You were referred by @${refHandle}! Enjoy your bonus.`);
    }

    const savedUser = localStorage.getItem("oui_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem("oui_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("oui_user");
    setActiveTab("home");
  };

  const updateUser = (updates: any) => {
    const newUser = { ...user, ...updates };
    setUser(newUser);
    localStorage.setItem("oui_user", JSON.stringify(newUser));
  };

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const handleTabChange = (tab: string) => {
    if (tab === "post") {
      setShowPostTask(true);
    } else {
      setActiveTab(tab);
      setSelectedTask(null);
      setShowPostTask(false);
    }
  };

  const handlePostTask = () => {
    setShowPostTask(true);
  };

  const handleTaskClick = (taskId: number) => {
    // Enhanced task mock for better UX
    const categories: Record<string, string> = {
      1: "Writing",
      2: "Design",
      3: "Tutoring",
      4: "Delivery",
      5: "Coding"
    };
    
    setSelectedTask({
      id: taskId,
      category: categories[taskId] || "General",
      price: taskId === 1 ? 3500 : taskId === 2 ? 5000 : taskId === 3 ? 8500 : 2000,
      title: taskId === 1 ? "Business Law Essay" : taskId === 2 ? "Faculty Flyer" : "Campus Task " + taskId,
      description: "Complete professional task requirements for " + (categories[taskId] || "General") + " category. Must follow all campus safety guidelines and smart contract terms.",
      posterHandle: "@unilag_poster",
      posterTier: taskId % 2 === 0 ? "GOLD" : "BRONZE",
      posterScore: taskId % 2 === 0 ? 672 : 420,
      deadline: "Due in 3 days",
    });
  };

  const handlePostSuccess = (taskData: any) => {
    toast.success("Task posted successfully!");
    // In a real app, we'd add this to a database
    // For now, we'll just close the modal
    setShowPostTask(false);
  };

  if (showPostTask) {
    return (
      <div className="min-h-screen bg-grind-neutral-50">
        <PostTask 
          onBack={() => setShowPostTask(false)} 
          onPostSuccess={handlePostSuccess}
        />
      </div>
    );
  }

  if (selectedTask) {
    return (
      <div className="min-h-screen bg-grind-neutral-50">
        <TaskDetail task={selectedTask} onBack={() => setSelectedTask(null)} />
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grind-neutral-50">
      <Toaster position="top-center" />
      {activeTab === "home" && (
        <Home 
          userName={user.userName} 
          userHandle={user.handle}
          notifications={user.notifications || []}
          onNavigate={handleTabChange} 
          onPostTask={handlePostTask}
          onTaskClick={handleTaskClick} 
        />
      )}
      {activeTab === "tasks" && <TaskBoard onTaskClick={handleTaskClick} />}
      {activeTab === "wallet" && (
        <Wallet 
          balance={user.walletBalance || 0} 
          transactions={user.transactions || []} 
          score={user.score || 0}
          tier={user.tier || "STARTER"}
        />
      )}
      {activeTab === "profile" && (
        <Profile
          userName={user.userName}
          handle={user.handle}
          school={user.school}
          level={user.level}
          score={user.score}
          tier={user.tier}
          onLogout={handleLogout}
          onUpdate={updateUser}
        />
      )}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}