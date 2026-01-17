"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  FileText,
  TrendingUp,
  Clock,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { getStats } from "@/utils/statistics";
import { getHistory } from "@/utils/documentHistory";

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (section: string) => void;
}

export default function Dashboard({ isOpen, onClose, onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  useEffect(() => {
    if (isOpen) {
      setStats(getStats());
      setHistory(getHistory());
    }
  }, [isOpen]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!stats || !history) return null;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = history.filter((h) => new Date(h.timestamp) > weekAgo);
    const lastWeek = history.filter((h) => {
      const date = new Date(h.timestamp);
      return date > new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && date <= weekAgo;
    });

    const weekChange = lastWeek.length > 0 
      ? ((thisWeek.length - lastWeek.length) / lastWeek.length) * 100 
      : thisWeek.length > 0 ? 100 : 0;

    // Calculate most productive day
    const dayCount: Record<number, number> = {};
    history.forEach((h) => {
      const day = new Date(h.timestamp).getDay();
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const mostProductiveDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Calculate document type distribution
    const typeCount: Record<string, number> = {};
    history.forEach((h) => {
      typeCount[h.documentType] = (typeCount[h.documentType] || 0) + 1;
    });
    const topTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalDocuments: stats.totalDocuments || 0,
      thisWeekCount: thisWeek.length,
      weekChange,
      avgPerWeek: history.length > 0 ? (history.length / Math.max(1, Math.ceil((now.getTime() - new Date(history[history.length - 1]?.timestamp || now).getTime()) / (7 * 24 * 60 * 60 * 1000)))).toFixed(1) : "0",
      mostProductiveDay: mostProductiveDay ? days[parseInt(mostProductiveDay[0])] : "N/A",
      streak: stats.streak || 0,
      topTypes,
      achievements: stats.achievements || [],
      dayCount,
    };
  }, [stats, history]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[85vh] bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--color-primary] to-[--color-accent] flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-sm text-[--text-muted]">Your productivity overview</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 rounded-xl bg-[--bg-elevated] border border-[--border-default] text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[--bg-elevated] text-[--text-muted] hover:text-[--text-primary] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {metrics && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<FileText className="w-5 h-5" />}
                  label="Total Documents"
                  value={metrics.totalDocuments.toString()}
                  color="#e07a5f"
                />
                <StatCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="This Week"
                  value={metrics.thisWeekCount.toString()}
                  change={metrics.weekChange}
                  color="#81b29a"
                />
                <StatCard
                  icon={<Activity className="w-5 h-5" />}
                  label="Avg per Week"
                  value={metrics.avgPerWeek}
                  color="#f2cc8f"
                />
                <StatCard
                  icon={<Zap className="w-5 h-5" />}
                  label="Current Streak"
                  value={`${metrics.streak} days`}
                  color="#6b7fd7"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Activity */}
                <div className="p-5 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[--color-primary]" />
                    Weekly Activity
                  </h3>
                  <div className="h-40 flex items-end justify-between gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => {
                      const count = metrics.dayCount[i] || 0;
                      const maxCount = Math.max(...Object.values(metrics.dayCount as Record<string, number>), 1);
                      const height = (count / maxCount) * 100;
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col justify-end h-32">
                            <div
                              className="w-full rounded-t-lg transition-all duration-500"
                              style={{
                                height: `${Math.max(height, 4)}%`,
                                background: `linear-gradient(to top, var(--color-primary), var(--color-accent))`,
                                opacity: height > 0 ? 1 : 0.2,
                              }}
                            />
                          </div>
                          <span className="text-xs text-[--text-muted]">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-[--text-muted] mt-4 text-center">
                    Most productive: <span className="text-[--color-primary] font-medium">{metrics.mostProductiveDay}</span>
                  </p>
                </div>

                {/* Document Types */}
                <div className="p-5 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-[--color-accent]" />
                    Top Document Types
                  </h3>
                  <div className="space-y-3">
                    {metrics.topTypes.length === 0 ? (
                      <p className="text-[--text-muted] text-center py-8">
                        No documents created yet
                      </p>
                    ) : (
                      metrics.topTypes.map(([type, count], i) => {
                        const total = metrics.topTypes.reduce((sum: number, [, c]: [string, number]) => sum + c, 0);
                        const percentage = (count / total) * 100;
                        const colors = ["#e07a5f", "#81b29a", "#f2cc8f", "#6b7fd7", "#3d405b"];
                        return (
                          <div key={type}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="truncate">{type.replace("Letter of ", "")}</span>
                              <span className="text-[--text-muted]">{count}</span>
                            </div>
                            <div className="h-2 bg-[--bg-overlay] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: colors[i % colors.length],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {metrics.achievements.length > 0 && (
                <div className="p-5 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[--color-warning]" />
                    Achievements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {metrics.achievements.map((achievement: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-[--color-warning]/10 text-[--color-warning] text-sm font-medium"
                      >
                        🏆 {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <QuickAction
                  icon={<FileText className="w-5 h-5" />}
                  label="New Document"
                  onClick={() => {
                    onClose();
                    onNavigate?.("templates");
                  }}
                />
                <QuickAction
                  icon={<Clock className="w-5 h-5" />}
                  label="History"
                  onClick={() => {
                    onClose();
                    onNavigate?.("history");
                  }}
                />
                <QuickAction
                  icon={<Star className="w-5 h-5" />}
                  label="Favorites"
                  onClick={() => {
                    onClose();
                    onNavigate?.("favorites");
                  }}
                />
                <QuickAction
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Full Stats"
                  onClick={() => {
                    onClose();
                    onNavigate?.("statistics");
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: number;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <span className="text-sm text-[--text-muted]">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold">{value}</span>
        {change !== undefined && (
          <span
            className={`flex items-center text-sm ${
              change >= 0 ? "text-[--color-success]" : "text-[--color-error]"
            }`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {Math.abs(change).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

// Quick Action Button
function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-primary] transition-all flex flex-col items-center gap-2 group"
    >
      <span className="text-[--text-muted] group-hover:text-[--color-primary] transition-colors">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
