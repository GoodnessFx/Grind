import React, { useState } from "react";
import { Search, MapPin, Sparkles, Filter, Users, Trophy, ChevronRight, GraduationCap } from "lucide-react";
import type { UserData, Tab } from "../App";
import { cn } from "../../lib/utils";

interface DiscoveryFeedProps {
  user: UserData;
  onNavigate: (tab: Tab) => void;
}

const SEEDED_STUDENTS = [
  { id: 1, name: "Goodness Iyamah", handle: "@goodness_grind", role: "Frontend Developer", school: "University of Lagos", skills: ["React", "UI/UX", "Tailwind"], score: 672, tier: "GOLD", mentor: true },
  { id: 2, name: "Emeka Ojukwu", handle: "@emeka_dev", role: "Smart Contract Dev", school: "Covenant University", skills: ["Solidity", "Web3", "Node.js"], score: 840, tier: "DIAMOND", mentor: true },
  { id: 3, name: "Fatimah Aliyu", handle: "@fatimah.writes", role: "Content Strategist", school: "Ahmadu Bello University", skills: ["Copywriting", "SEO", "Marketing"], score: 423, tier: "BRONZE", mentor: false },
  { id: 4, name: "Seun Ayodele", handle: "@seun_designs", role: "Product Designer", school: "Obafemi Awolowo University", skills: ["Figma", "Interaction", "Branding"], score: 847, tier: "DIAMOND", mentor: true },
  { id: 5, name: "Chisom Nnaji", handle: "@chisom.tutors", role: "Math Tutor", school: "University of Nigeria", skills: ["Calculus", "Physics", "Statistics"], score: 215, tier: "STARTER", mentor: false },
];

const tierColors: Record<string, string> = {
  STARTER: "#98A2B3",
  BRONZE: "#CD7F32",
  GOLD: "#F79009",
  DIAMOND: "#0BA5EC",
};

export function DiscoveryFeed({ user, onNavigate }: DiscoveryFeedProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"talent"|"mentors"|"challenges">("talent");

  const filtered = SEEDED_STUDENTS.filter(
    (s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.role.toLowerCase().includes(search.toLowerCase()) ||
                          s.school.toLowerCase().includes(search.toLowerCase()) ||
                          s.skills.some((skill) => skill.toLowerCase().includes(search.toLowerCase()));
      if (activeTab === "mentors") return matchSearch && s.mentor;
      return matchSearch;
    }
  );

  return (
    <div className="pb-28 min-h-full bg-background">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-20">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Discovery</h2>
        <p className="text-sm text-gray-500 mt-1">Connect across campuses</p>

        <div className="flex gap-2 overflow-x-auto mt-4 hide-scrollbar">
          {[
            { id: "talent", label: "Top Talent", icon: Users },
            { id: "mentors", label: "Find Mentors", icon: GraduationCap },
            { id: "challenges", label: "Challenges", icon: Trophy },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                  active ? "bg-gray-900 text-white shadow-md" : "bg-gray-50 text-gray-600 border border-gray-200"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeTab !== "challenges" && (
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === "mentors" ? "Search for mentors..." : "Search by skill, name, or school..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] transition-all"
              />
            </div>
          </div>
        )}

        {activeTab === "challenges" ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#0A2540] to-[#04111E] rounded-[28px] p-6 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  Live Challenge
                </div>
                <h3 className="text-2xl font-extrabold mb-1">UNILAG vs OAU Hackathon</h3>
                <p className="text-sm text-white/70 font-medium mb-4">Build a fintech solution for students. Top 3 teams share ₦500k.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent">Ends in 3 days</span>
                  <button className="bg-accent hover:bg-grind-accent-dark text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">Join Squad</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                Upcoming
              </div>
              <h3 className="text-[17px] font-extrabold text-gray-900 mb-1">Design Clash: Covenant vs Babcock</h3>
              <p className="text-sm text-gray-500 font-medium mb-4">Create the best landing page for a campus startup.</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">Starts Oct 12</span>
                <button className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors">Notify Me</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {filtered.map((student) => (
              <div key={student.id} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] transition-all flex flex-col gap-4 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-[1.2rem] bg-grind-accent-light flex items-center justify-center shrink-0 border border-accent/10">
                    <span className="text-xl font-black text-accent">{student.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] font-extrabold text-gray-900 leading-tight truncate">
                        {student.name}
                      </h3>
                      {student.mentor && (
                        <span className="shrink-0 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Mentor</span>
                      )}
                    </div>
                    <p className="text-[13px] font-semibold text-gray-600 mt-0.5 truncate">{student.role}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium truncate">{student.school}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tierColors[student.tier] }} />
                      <span className="text-[10px] font-black text-gray-700">{student.score}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-lg bg-gray-50 text-gray-600 text-[10px] font-bold border border-gray-200 uppercase tracking-wide">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                    {activeTab === "mentors" ? <GraduationCap className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    {activeTab === "mentors" ? "Request Mentorship" : "Request Collab"}
                  </span>
                  <button className="text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No students found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
