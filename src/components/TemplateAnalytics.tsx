"use client";

import { useState, useEffect } from "react";

interface TemplateUsage {
  templateId: string;
  templateName: string;
  count: number;
  lastUsed: string;
}

interface AnalyticsData {
  templateUsage: TemplateUsage[];
  totalDocuments: number;
  totalTimeMinutes: number;
  averageTimeMinutes: number;
  documentsThisWeek: number;
  documentsThisMonth: number;
}

const STORAGE_KEY = "templateAnalytics";

export function useTemplateAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    templateUsage: [],
    totalDocuments: 0,
    totalTimeMinutes: 0,
    averageTimeMinutes: 0,
    documentsThisWeek: 0,
    documentsThisMonth: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAnalytics(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading analytics:", e);
      }
    }
  };

  const recordTemplateUse = (templateId: string, templateName: string, timeSpentMinutes: number) => {
    const updated = { ...analytics };
    
    // Update template usage
    const existingIndex = updated.templateUsage.findIndex(t => t.templateId === templateId);
    if (existingIndex >= 0) {
      updated.templateUsage[existingIndex].count += 1;
      updated.templateUsage[existingIndex].lastUsed = new Date().toISOString();
    } else {
      updated.templateUsage.push({
        templateId,
        templateName,
        count: 1,
        lastUsed: new Date().toISOString(),
      });
    }
    
    // Sort by count descending
    updated.templateUsage.sort((a, b) => b.count - a.count);
    
    // Update totals
    updated.totalDocuments += 1;
    updated.totalTimeMinutes += timeSpentMinutes;
    updated.averageTimeMinutes = Math.round(updated.totalTimeMinutes / updated.totalDocuments);
    
    // Update weekly/monthly counts
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Recalculate from history
    const history = JSON.parse(localStorage.getItem("documentHistory") || "[]");
    updated.documentsThisWeek = history.filter((h: any) => new Date(h.createdAt) > weekAgo).length + 1;
    updated.documentsThisMonth = history.filter((h: any) => new Date(h.createdAt) > monthAgo).length + 1;
    
    setAnalytics(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAnalytics = () => {
    const empty: AnalyticsData = {
      templateUsage: [],
      totalDocuments: 0,
      totalTimeMinutes: 0,
      averageTimeMinutes: 0,
      documentsThisWeek: 0,
      documentsThisMonth: 0,
    };
    setAnalytics(empty);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { analytics, recordTemplateUse, clearAnalytics, mounted };
}

interface TemplateAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateAnalytics({ isOpen, onClose }: TemplateAnalyticsProps) {
  const { analytics, clearAnalytics } = useTemplateAnalytics();

  if (!isOpen) return null;

  const maxCount = Math.max(...analytics.templateUsage.map(t => t.count), 1);
  const totalUsage = analytics.templateUsage.reduce((sum, t) => sum + t.count, 0);

  const colors = [
    "#a78bfa", "#4ecdc4", "#f472b6", "#f0b866", "#60a5fa", 
    "#4ade80", "#f87171", "#fb923c", "#c084fc", "#22d3ee"
  ];

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl shadow-[#a78bfa]/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">📊 Template Analytics</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAnalytics}
              className="px-3 py-1.5 rounded-lg text-sm text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
            >
              Reset
            </button>
            <button onClick={onClose} className="text-[#666680] hover:text-white transition-colors text-2xl">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#a78bfa]/20 to-[#a78bfa]/5 border border-[#a78bfa]/30">
              <div className="text-3xl font-bold text-[#a78bfa]">{analytics.totalDocuments}</div>
              <div className="text-sm text-[#a0a0a0]">Total Documents</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#4ecdc4]/20 to-[#4ecdc4]/5 border border-[#4ecdc4]/30">
              <div className="text-3xl font-bold text-[#4ecdc4]">{analytics.documentsThisWeek}</div>
              <div className="text-sm text-[#a0a0a0]">This Week</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#f472b6]/20 to-[#f472b6]/5 border border-[#f472b6]/30">
              <div className="text-3xl font-bold text-[#f472b6]">{formatTime(analytics.totalTimeMinutes)}</div>
              <div className="text-sm text-[#a0a0a0]">Total Time</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#f0b866]/20 to-[#f0b866]/5 border border-[#f0b866]/30">
              <div className="text-3xl font-bold text-[#f0b866]">{formatTime(analytics.averageTimeMinutes)}</div>
              <div className="text-sm text-[#a0a0a0]">Avg per Doc</div>
            </div>
          </div>

          {/* Most Used Templates */}
          <div className="mb-8">
            <h3 className="text-lg text-white mb-4">Most Used Templates</h3>
            {analytics.templateUsage.length === 0 ? (
              <div className="text-center py-8 text-[#666680]">
                <p>No template usage data yet.</p>
                <p className="text-sm mt-2">Start creating documents to see analytics!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.templateUsage.slice(0, 10).map((template, index) => {
                  const percentage = Math.round((template.count / totalUsage) * 100);
                  const barWidth = (template.count / maxCount) * 100;
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={template.templateId} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm truncate flex-1">{template.templateName}</span>
                        <span className="text-[#a0a0a0] text-sm ml-2">{template.count} ({percentage}%)</span>
                      </div>
                      <div className="h-8 rounded-lg bg-[#1a1a24] overflow-hidden relative">
                        <div 
                          className="h-full rounded-lg transition-all duration-500 flex items-center px-3"
                          style={{ 
                            width: `${barWidth}%`, 
                            backgroundColor: color,
                            minWidth: '40px'
                          }}
                        >
                          <span className="text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {template.count} uses
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pie Chart */}
          {analytics.templateUsage.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg text-white mb-4">Distribution</h3>
              <div className="flex items-center gap-8">
                {/* Simple CSS Pie Chart */}
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {analytics.templateUsage.slice(0, 8).reduce((acc, template, index) => {
                      const percentage = (template.count / totalUsage) * 100;
                      const previousOffset = acc.offset;
                      acc.offset += percentage;
                      acc.elements.push(
                        <circle
                          key={template.templateId}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={colors[index % colors.length]}
                          strokeWidth="20"
                          strokeDasharray={`${percentage * 2.51} ${251 - percentage * 2.51}`}
                          strokeDashoffset={-previousOffset * 2.51}
                          className="transition-all duration-500"
                        />
                      );
                      return acc;
                    }, { elements: [] as JSX.Element[], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{analytics.templateUsage.length}</div>
                      <div className="text-xs text-[#666680]">templates</div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {analytics.templateUsage.slice(0, 8).map((template, index) => (
                    <div key={template.templateId} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-sm text-[#a0a0a0] truncate">{template.templateName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {analytics.templateUsage.length > 0 && (
            <div>
              <h3 className="text-lg text-white mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {analytics.templateUsage
                  .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
                  .slice(0, 5)
                  .map((template) => {
                    const lastUsed = new Date(template.lastUsed);
                    const now = new Date();
                    const diff = now.getTime() - lastUsed.getTime();
                    let timeAgo = "";
                    if (diff < 60000) timeAgo = "Just now";
                    else if (diff < 3600000) timeAgo = `${Math.floor(diff / 60000)}m ago`;
                    else if (diff < 86400000) timeAgo = `${Math.floor(diff / 3600000)}h ago`;
                    else timeAgo = `${Math.floor(diff / 86400000)}d ago`;
                    
                    return (
                      <div key={template.templateId} className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                        <span className="text-white">{template.templateName}</span>
                        <span className="text-sm text-[#666680]">{timeAgo}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

