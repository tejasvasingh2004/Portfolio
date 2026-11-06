export type Achievement = {
  id: string;
  event: string;
  /** The headline result, e.g. a rank or "Finalist". */
  result: string;
  detail?: string;
  year?: string;
};

/** Most notable first. */
export const achievements: Achievement[] = [
  {
    id: "amazon-ml-2026",
    event: "Amazon ML Challenge",
    result: "All-India Rank 507",
    detail: "Among 34,000+ teams (top 1.5%), with an evaluation score of 98.4%.",
    year: "2026",
  },
  {
    id: "mastercard-cfc-3",
    event: "Mastercard Code for Change 3.0",
    result: "Finalist",
  },
  {
    id: "sih",
    event: "Smart India Hackathon",
    result: "Top 5 in the college-level round",
    detail: "Cleared the college-level selection round in 2025.",
    year: "2026",
  },
  {
    id: "problem-solving",
    event: "Problem solving",
    result: "200+ problems solved",
    detail: "Across LeetCode, CodeChef and GeeksforGeeks.",
  },
];
