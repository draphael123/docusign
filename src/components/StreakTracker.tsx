"use client";

import { useState, useEffect } from "react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastDocumentDate: string | null;
  totalDocuments: number;
  achievements: string[];
}

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastDocumentDate: null,
  totalDocuments: 0,
  achievements: [],
};

const ACHIEVEMENTS = [
  { id: "first_doc", name: "First Document", description: "Create your first document", icon: "📄", requirement: (data: StreakData) => data.totalDocuments >= 1 },
  { id: "streak_3", name: "Getting Started", description: "3 day streak", icon: "🔥", requirement: (data: StreakData) => data.currentStreak >= 3 },
  { id: "streak_7", name: "Week Warrior", description: "7 day streak", icon: "⚡", requirement: (data: StreakData) => data.currentStreak >= 7 },
  { id: "streak_30", name: "Month Master", description: "30 day streak", icon: "🏆", requirement: (data: StreakData) => data.currentStreak >= 30 },
  { id: "docs_10", name: "Prolific Writer", description: "Create 10 documents", icon: "✍️", requirement: (data: StreakData) => data.totalDocuments >= 10 },
  { id: "docs_50", name: "Document Pro", description: "Create 50 documents", icon: "📚", requirement: (data: StreakData) => data.totalDocuments >= 50 },
  { id: "docs_100", name: "Century Club", description: "Create 100 documents", icon: "💯", requirement: (data: StreakData) => data.totalDocuments >= 100 },
];

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(DEFAULT_STREAK);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("streakData");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Check if streak should be reset
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (data.lastDocumentDate) {
          const lastDate = new Date(data.lastDocumentDate).toDateString();
          if (lastDate !== today && lastDate !== yesterday) {
            // Streak broken
            data.currentStreak = 0;
          }
        }
        setStreak(data);
      } catch (e) {
        console.error("Error loading streak:", e);
      }
    }
  }, []);

  const recordDocument = () => {
    const today = new Date().toDateString();
    const newStreak = { ...streak };
    
    if (newStreak.lastDocumentDate) {
      const lastDate = new Date(newStreak.lastDocumentDate).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (lastDate === today) {
        // Already recorded today
        newStreak.totalDocuments += 1;
      } else if (lastDate === yesterday) {
        // Continue streak
        newStreak.currentStreak += 1;
        newStreak.totalDocuments += 1;
      } else {
        // Streak broken, start new
        newStreak.currentStreak = 1;
        newStreak.totalDocuments += 1;
      }
    } else {
      // First document
      newStreak.currentStreak = 1;
      newStreak.totalDocuments = 1;
    }
    
    newStreak.lastDocumentDate = new Date().toISOString();
    newStreak.longestStreak = Math.max(newStreak.longestStreak, newStreak.currentStreak);
    
    // Check for new achievements
    const newAchievements: string[] = [];
    ACHIEVEMENTS.forEach((achievement) => {
      if (achievement.requirement(newStreak) && !newStreak.achievements.includes(achievement.id)) {
        newStreak.achievements.push(achievement.id);
        newAchievements.push(achievement.name);
      }
    });
    
    setStreak(newStreak);
    localStorage.setItem("streakData", JSON.stringify(newStreak));
    
    return newAchievements;
  };

  return { streak, recordDocument, mounted, ACHIEVEMENTS };
}

interface StreakDisplayProps {
  compact?: boolean;
}

export default function StreakDisplay({ compact = false }: StreakDisplayProps) {
  const { streak, mounted, ACHIEVEMENTS } = useStreak();

  if (!mounted) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#f87171]/20 to-[#f0b866]/20 border border-[#f87171]/30">
        <span className="text-lg">🔥</span>
        <span className="text-white font-bold">{streak.currentStreak}</span>
        <span className="text-[#a0a0a0] text-sm">day streak</span>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-[#12121a] border border-[#2a2a3a]">
      {/* Streak Info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg text-white mb-1">Document Streak</h3>
          <p className="text-sm text-[#666680]">Keep creating documents daily!</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold gradient-text">{streak.currentStreak}</div>
          <div className="text-xs text-[#666680]">current</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-[#1a1a24]">
          <div className="text-xl font-bold text-[#f0b866]">{streak.longestStreak}</div>
          <div className="text-xs text-[#666680]">Best Streak</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-[#1a1a24]">
          <div className="text-xl font-bold text-[#4ecdc4]">{streak.totalDocuments}</div>
          <div className="text-xs text-[#666680]">Total Docs</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-[#1a1a24]">
          <div className="text-xl font-bold text-[#a78bfa]">{streak.achievements.length}</div>
          <div className="text-xs text-[#666680]">Badges</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-sm font-medium text-[#a78bfa] mb-3">Achievements</h4>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = streak.achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`p-2 rounded-lg text-center transition-all ${
                  unlocked
                    ? "bg-gradient-to-br from-[#a78bfa]/20 to-[#f472b6]/20 border border-[#a78bfa]/30"
                    : "bg-[#1a1a24] border border-[#2a2a3a] opacity-50"
                }`}
                title={`${achievement.name}: ${achievement.description}`}
              >
                <div className="text-2xl mb-1">{unlocked ? achievement.icon : "🔒"}</div>
                <div className="text-[10px] text-[#a0a0a0] truncate">{achievement.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

