import React, { useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { cn } from "../../lib/utils";

const categories = [
  "All",
  "Writing",
  "Design",
  "Coding",
  "Tutoring",
  "Delivery",
  "Research",
];

const mockTasks = [
  {
    id: 1,
    category: "Writing",
    price: 3500,
    title: "Write my BUS 301 Business Law essay (1500 words)",
    description: "Need a well-researched essay on corporate governance. Due Friday before 5pm.",
    posterHandle: "@emeka_dev",
    posterTier: "GOLD" as const,
    posterScore: 672,
    deadline: "Due in 2 days",
  },
  {
    id: 2,
    category: "Design",
    price: 5000,
    title: "Design my event flyer for Faculty Week",
    description: "Looking for a creative flyer design for our upcoming Faculty Week event.",
    posterHandle: "@fatimah.writes",
    posterTier: "BRONZE" as const,
    posterScore: 423,
    deadline: "Due in 4 days",
  },
  {
    id: 3,
    category: "Tutoring",
    price: 8500,
    title: "Tutor me in Calculus before my exam on Friday",
    description: "Need help with integration and differentiation. 3 sessions needed.",
    posterHandle: "@seun_designs",
    posterTier: "DIAMOND" as const,
    posterScore: 847,
    deadline: "Due in 3 days",
  },
  {
    id: 4,
    category: "Delivery",
    price: 2000,
    title: "Help me move my things from Akoka to Yaba",
    description: "Need someone with a bike to help move some boxes and bags.",
    posterHandle: "@chidi_codes",
    posterTier: "STARTER" as const,
    posterScore: 312,
    deadline: "Due in 1 day",
  },
  {
    id: 5,
    category: "Coding",
    price: 12000,
    title: "Build a simple portfolio website",
    description: "Need a React developer to build a clean portfolio website with 4-5 pages.",
    posterHandle: "@ada_tech",
    posterTier: "GOLD" as const,
    posterScore: 701,
    deadline: "Due in 7 days",
  },
];

interface TaskBoardProps {
  onTaskClick?: (taskId: number) => void;
}

export function TaskBoard({ onTaskClick }: TaskBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = mockTasks.filter((task) => {
    const matchesCategory = selectedCategory === "All" || task.category === selectedCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24 px-4 max-w-[600px] mx-auto">
      <div className="pt-6 pb-4 sticky top-0 bg-grind-neutral-50 z-20">
        <h2 className="text-2xl font-black text-grind-neutral-900 mb-4 tracking-tight">Available Gigs</h2>
        
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-grind-neutral-400 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-grind-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all shadow-sm font-medium text-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-3.5 rounded-2xl border transition-all shadow-sm",
              showFilters ? "bg-accent border-accent text-white" : "bg-white border-grind-neutral-100 text-grind-neutral-700"
            )}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className={cn(
          "overflow-hidden transition-all duration-300",
          showFilters ? "max-h-20 mt-4" : "max-h-0"
        )}>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                  selectedCategory === cat
                    ? "bg-accent border-accent text-white shadow-lg"
                    : "bg-white border-grind-neutral-100 text-grind-neutral-500 hover:border-grind-neutral-200"
                )}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-2">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} {...task} onClick={() => onTaskClick?.(task.id)} />
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-grind-neutral-200 rounded-[32px]">
            <div className="w-16 h-16 bg-grind-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-grind-neutral-300" />
            </div>
            <p className="text-grind-neutral-500 font-bold uppercase tracking-widest text-xs">No tasks found matching your criteria</p>
            <button 
              onClick={() => {setSearchQuery(""); setSelectedCategory("All");}}
              className="text-accent font-black mt-4 hover:underline uppercase tracking-tighter flex items-center justify-center gap-2 mx-auto"
            >
              Clear all filters <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
