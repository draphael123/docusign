"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SessionData {
  startTime: string;
  documentType: string;
  duration: number; // in seconds
}

interface TimeStats {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  sessions: SessionData[];
}

const STORAGE_KEY = "timeTrackerData";

export function useTimeTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);
  const [timeStats, setTimeStats] = useState<TimeStats>({
    todayMinutes: 0,
    weekMinutes: 0,
    monthMinutes: 0,
    sessions: [],
  });
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  // Load stats on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        recalculateStats(data.sessions || []);
      } catch (e) {
        console.error("Error loading time stats:", e);
      }
    }
  }, []);

  const recalculateStats = (sessions: SessionData[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let todaySeconds = 0;
    let weekSeconds = 0;
    let monthSeconds = 0;

    sessions.forEach((session) => {
      const sessionDate = new Date(session.startTime);
      if (sessionDate >= todayStart) {
        todaySeconds += session.duration;
      }
      if (sessionDate >= weekStart) {
        weekSeconds += session.duration;
      }
      if (sessionDate >= monthStart) {
        monthSeconds += session.duration;
      }
    });

    setTimeStats({
      todayMinutes: Math.round(todaySeconds / 60),
      weekMinutes: Math.round(weekSeconds / 60),
      monthMinutes: Math.round(monthSeconds / 60),
      sessions,
    });
  };

  const startTracking = useCallback(() => {
    if (isTracking) return;
    
    setIsTracking(true);
    sessionStartRef.current = new Date();
    setCurrentSessionSeconds(0);
    
    intervalRef.current = setInterval(() => {
      setCurrentSessionSeconds((prev) => prev + 1);
    }, 1000);
  }, [isTracking]);

  const stopTracking = useCallback((documentType: string) => {
    if (!isTracking || !sessionStartRef.current) return 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const duration = currentSessionSeconds;
    const session: SessionData = {
      startTime: sessionStartRef.current.toISOString(),
      documentType,
      duration,
    };
    
    const newSessions = [...timeStats.sessions, session].slice(-100); // Keep last 100 sessions
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions: newSessions }));
    recalculateStats(newSessions);
    
    setIsTracking(false);
    setCurrentSessionSeconds(0);
    sessionStartRef.current = null;
    
    return Math.round(duration / 60); // Return minutes
  }, [isTracking, currentSessionSeconds, timeStats.sessions]);

  const pauseTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resumeTracking = useCallback(() => {
    if (!isTracking || intervalRef.current) return;
    
    intervalRef.current = setInterval(() => {
      setCurrentSessionSeconds((prev) => prev + 1);
    }, 1000);
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    currentSessionSeconds,
    timeStats,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    formatTime,
    formatMinutes,
    mounted,
  };
}

interface TimeTrackerDisplayProps {
  currentSessionSeconds: number;
  isTracking: boolean;
  formatTime: (seconds: number) => string;
  compact?: boolean;
}

export function TimeTrackerDisplay({ currentSessionSeconds, isTracking, formatTime, compact = false }: TimeTrackerDisplayProps) {
  if (!isTracking) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4ecdc4]/20 border border-[#4ecdc4]/30">
        <span className="w-2 h-2 rounded-full bg-[#4ecdc4] animate-pulse" />
        <span className="text-[#4ecdc4] font-mono text-sm">{formatTime(currentSessionSeconds)}</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="px-6 py-3 rounded-xl bg-[#12121a]/90 backdrop-blur-md border border-[#4ecdc4]/30 shadow-lg shadow-[#4ecdc4]/10 flex items-center gap-4">
        <span className="w-2 h-2 rounded-full bg-[#4ecdc4] animate-pulse" />
        <span className="text-white">Session Time:</span>
        <span className="text-2xl font-mono text-[#4ecdc4]">{formatTime(currentSessionSeconds)}</span>
      </div>
    </div>
  );
}

interface TimeStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeStats: TimeStats;
  formatMinutes: (minutes: number) => string;
}

export function TimeStatsModal({ isOpen, onClose, timeStats, formatMinutes }: TimeStatsModalProps) {
  if (!isOpen) return null;

  // Calculate daily breakdown for the week
  const dailyData: { day: string; minutes: number }[] = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const dayMinutes = timeStats.sessions
      .filter((s) => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      })
      .reduce((sum, s) => sum + Math.round(s.duration / 60), 0);
    
    dailyData.push({
      day: i === 0 ? "Today" : i === 1 ? "Yest" : days[date.getDay()],
      minutes: dayMinutes,
    });
  }

  const maxDailyMinutes = Math.max(...dailyData.map(d => d.minutes), 1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-lg w-full border border-[#2a2a3a] shadow-2xl shadow-[#4ecdc4]/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">⏱️ Time Tracking</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white transition-colors text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#4ecdc4]/20 to-[#4ecdc4]/5 border border-[#4ecdc4]/30 text-center">
              <div className="text-2xl font-bold text-[#4ecdc4]">{formatMinutes(timeStats.todayMinutes)}</div>
              <div className="text-sm text-[#a0a0a0]">Today</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#a78bfa]/20 to-[#a78bfa]/5 border border-[#a78bfa]/30 text-center">
              <div className="text-2xl font-bold text-[#a78bfa]">{formatMinutes(timeStats.weekMinutes)}</div>
              <div className="text-sm text-[#a0a0a0]">This Week</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#f472b6]/20 to-[#f472b6]/5 border border-[#f472b6]/30 text-center">
              <div className="text-2xl font-bold text-[#f472b6]">{formatMinutes(timeStats.monthMinutes)}</div>
              <div className="text-sm text-[#a0a0a0]">This Month</div>
            </div>
          </div>

          {/* Weekly Chart */}
          <div>
            <h3 className="text-sm font-medium text-[#a0a0a0] mb-3">Last 7 Days</h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {dailyData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex-1 flex items-end">
                    <div 
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#4ecdc4] to-[#a78bfa] transition-all duration-500"
                      style={{ 
                        height: `${Math.max(4, (day.minutes / maxDailyMinutes) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#666680]">{day.day}</span>
                  {day.minutes > 0 && (
                    <span className="text-xs text-[#a0a0a0]">{day.minutes}m</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          {timeStats.sessions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-[#a0a0a0] mb-3">Recent Sessions</h3>
              <div className="space-y-2 max-h-32 overflow-auto">
                {timeStats.sessions
                  .slice(-5)
                  .reverse()
                  .map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a24]">
                      <span className="text-sm text-white truncate">{session.documentType}</span>
                      <span className="text-sm text-[#4ecdc4]">{formatMinutes(Math.round(session.duration / 60))}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

