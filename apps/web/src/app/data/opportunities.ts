export type OpportunityCategory = "Internships" | "Scholarships" | "Hackathons" | "Freelance";

export interface Opportunity {
  id: string;
  category: OpportunityCategory;
  title: string;
  companyOrOrg: string;
  location: string;
  deadline?: string;
  link: string;
  tags: string[];
  description: string;
  curatedNote?: string;
}

export const CURATED_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-001",
    category: "Internships",
    title: "Junior Frontend Internship (React)",
    companyOrOrg: "Partner company (curated)",
    location: "Remote / Nigeria",
    deadline: "Rolling",
    link: "https://example.com",
    tags: ["React", "UI", "Portfolio"],
    description:
      "A beginner-friendly internship path focused on building small UI features and learning code review habits.",
    curatedNote: "Curated by Grind team. Not auto-scraped.",
  },
  {
    id: "opp-002",
    category: "Scholarships",
    title: "STEM Student Support Grant",
    companyOrOrg: "Education fund (curated)",
    location: "Nigeria",
    deadline: "Sept 30",
    link: "https://example.com",
    tags: ["STEM", "Undergraduate"],
    description:
      "Support grant for students with strong academic performance and demonstrated community impact.",
    curatedNote: "Curated by Grind team. Not auto-scraped.",
  },
  {
    id: "opp-003",
    category: "Hackathons",
    title: "Campus Builder Sprint (48h)",
    companyOrOrg: "Community hackathon (curated)",
    location: "Hybrid",
    deadline: "Oct 12",
    link: "https://example.com",
    tags: ["Team", "Prizes", "Mentors"],
    description:
      "Build something useful for students. Ship in 48 hours, present to judges, and win prizes.",
    curatedNote: "Curated by Grind team. Not auto-scraped.",
  },
  {
    id: "opp-004",
    category: "Freelance",
    title: "Content Writer (student-friendly)",
    companyOrOrg: "Small business (curated)",
    location: "Remote",
    deadline: "Rolling",
    link: "https://example.com",
    tags: ["Writing", "Consistent work"],
    description:
      "Write short blog posts and product descriptions. Clear briefs and weekly payouts.",
    curatedNote: "Curated by Grind team. Not auto-scraped.",
  },
];

