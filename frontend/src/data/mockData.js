export const dashboardStats = {
  screeningsToday: 1284,
  flaggedDocuments: 37,
  highRiskCases: 8,
  averageScreeningTime: "8.4 sec",
};

export const recentScreenings = [
  {
    id: "VG-2026-10482",
    name: "Rahul Sharma",
    document: "Passport",
    country: "India",
    status: "Verified",
    risk: "Low",
    time: "2 min ago",
  },
  {
    id: "VG-2026-10481",
    name: "Daniel Wilson",
    document: "Visa",
    country: "United Kingdom",
    status: "Review",
    risk: "Medium",
    time: "6 min ago",
  },
  {
    id: "VG-2026-10480",
    name: "Aisha Khan",
    document: "Passport",
    country: "India",
    status: "Flagged",
    risk: "High",
    time: "11 min ago",
  },
  {
    id: "VG-2026-10479",
    name: "Michael Brown",
    document: "Passport",
    country: "United States",
    status: "Verified",
    risk: "Low",
    time: "18 min ago",
  },
  {
    id: "VG-2026-10478",
    name: "Sofia Martinez",
    document: "Visa",
    country: "Spain",
    status: "Verified",
    risk: "Low",
    time: "24 min ago",
  },
];

export const alerts = [
  {
    id: 1,
    title: "Possible document tampering",
    description: "Visual inconsistency detected in passport photograph region.",
    severity: "High",
    time: "8 min ago",
  },
  {
    id: 2,
    title: "Visa validity requires review",
    description: "Stay duration does not match the extracted visa information.",
    severity: "Medium",
    time: "17 min ago",
  },
  {
    id: 3,
    title: "Watchlist similarity detected",
    description: "Identity information requires secondary verification.",
    severity: "High",
    time: "31 min ago",
  },
];

export const riskDistribution = [
  {
    name: "Low",
    value: 72,
  },
  {
    name: "Medium",
    value: 21,
  },
  {
    name: "High",
    value: 7,
  },
];

export const screeningTrend = [
  { day: "Mon", screenings: 820 },
  { day: "Tue", screenings: 940 },
  { day: "Wed", screenings: 1080 },
  { day: "Thu", screenings: 1010 },
  { day: "Fri", screenings: 1180 },
  { day: "Sat", screenings: 1284 },
  { day: "Sun", screenings: 1130 },
];