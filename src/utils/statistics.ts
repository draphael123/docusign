const STATS_KEY = "documentStats";

export interface DocumentStats {
  totalGenerated: number;
  documentTypeCounts: Record<string, number>;
  signatoryCounts: Record<string, number>;
  lastGenerated?: string;
  streakDays: number;
  achievements: string[];
}

export function getStats(): DocumentStats {
  if (typeof window === "undefined") {
    return {
      totalGenerated: 0,
      documentTypeCounts: {},
      signatoryCounts: {},
      streakDays: 0,
      achievements: [],
    };
  }

  const stored = localStorage.getItem(STATS_KEY);
  const defaultStats: DocumentStats = {
    totalGenerated: 0,
    documentTypeCounts: {},
    signatoryCounts: {},
    streakDays: 0,
    achievements: [],
  };

  if (!stored) return defaultStats;

  const stats = JSON.parse(stored);
  return { ...defaultStats, ...stats };
}

export function updateStats(documentType: string, signatoryName: string) {
  const stats = getStats();
  
  stats.totalGenerated += 1;
  stats.documentTypeCounts[documentType] = (stats.documentTypeCounts[documentType] || 0) + 1;
  stats.signatoryCounts[signatoryName] = (stats.signatoryCounts[signatoryName] || 0) + 1;
  stats.lastGenerated = new Date().toISOString();

  // Update streak
  const lastDate = stats.lastGenerated ? new Date(stats.lastGenerated) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (lastDate) {
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      stats.streakDays += 1;
    } else if (diffDays > 1) {
      stats.streakDays = 1;
    }
  } else {
    stats.streakDays = 1;
  }

  // Check achievements
  const newAchievements: string[] = [];
  if (stats.totalGenerated === 1 && !stats.achievements.includes("first-doc")) {
    newAchievements.push("first-doc");
  }
  if (stats.totalGenerated === 10 && !stats.achievements.includes("ten-docs")) {
    newAchievements.push("ten-docs");
  }
  if (stats.totalGenerated === 50 && !stats.achievements.includes("fifty-docs")) {
    newAchievements.push("fifty-docs");
  }
  if (stats.totalGenerated === 100 && !stats.achievements.includes("hundred-docs")) {
    newAchievements.push("hundred-docs");
  }
  if (stats.streakDays === 7 && !stats.achievements.includes("week-streak")) {
    newAchievements.push("week-streak");
  }

  stats.achievements = [...stats.achievements, ...newAchievements];

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return { stats, newAchievements };
}

export function getAchievementName(id: string): string {
  const names: Record<string, string> = {
    "first-doc": "First Document",
    "ten-docs": "Getting Started",
    "fifty-docs": "Power User",
    "hundred-docs": "Document Master",
    "week-streak": "Consistent Creator",
  };
  return names[id] || id;
}

