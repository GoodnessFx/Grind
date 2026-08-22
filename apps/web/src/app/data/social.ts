export type Tier = "STARTER" | "BRONZE" | "GOLD" | "DIAMOND";

export type SkillCategory =
  | "Writing"
  | "Design"
  | "Coding"
  | "Tutoring"
  | "Delivery"
  | "Research"
  | "Video"
  | "Other";

export interface ProfileLink {
  label: string;
  url: string;
}

export interface CompletedGig {
  id: number;
  title: string;
  category: SkillCategory;
  price: number;
  completedAt: string;
  rating: number; // 1–5
}

export interface PublicStudent {
  id: string;
  displayName: string;
  handle: string;
  bio: string;
  school?: string;
  level?: string;
  showSchoolTag?: boolean;
  tier: Tier;
  score: number;
  rating: number;
  completedGigs: CompletedGig[];
  skills: SkillCategory[];
  links?: ProfileLink[];
  avatarUrl?: string;
  coverUrl?: string;
}

export interface VerifiedBadge {
  category: SkillCategory;
  label: string;
  requirement: string;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function getVerifiedBadges(student: Pick<PublicStudent, "completedGigs">): VerifiedBadge[] {
  const byCategory = student.completedGigs.reduce<Record<string, { count: number; avg: number }>>((acc, g) => {
    const prev = acc[g.category] ?? { count: 0, avg: 0 };
    const nextCount = prev.count + 1;
    const nextAvg = (prev.avg * prev.count + g.rating) / nextCount;
    acc[g.category] = { count: nextCount, avg: nextAvg };
    return acc;
  }, {});

  const badges: VerifiedBadge[] = [];
  (Object.keys(byCategory) as SkillCategory[]).forEach((cat) => {
    const stat = byCategory[cat];
    // "Verified" threshold — intentionally conservative and explainable.
    if (stat.count >= 5 && stat.avg >= 4.2) {
      badges.push({
        category: cat,
        label: `Verified ${cat}`,
        requirement: "5+ completed gigs (4.2★+ avg)",
      });
    }
  });

  return badges;
}

