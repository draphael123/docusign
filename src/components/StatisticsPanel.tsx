"use client";

import { getStats, getAchievementName, DocumentStats } from "@/utils/statistics";
import { useState, useEffect } from "react";

interface StatisticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatisticsPanel({ isOpen, onClose }: StatisticsPanelProps) {
  const [stats, setStats] = useState<DocumentStats | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStats(getStats());
    }
  }, [isOpen]);

  if (!isOpen || !stats) return null;

  const topDocumentType = Object.entries(stats.documentTypeCounts).sort((a, b) => b[1] - a[1])[0];
  const topSignatory = Object.entries(stats.signatoryCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            📊 Your Statistics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 p-4 rounded-xl">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {stats.totalGenerated}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Total Documents</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-4 rounded-xl">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {stats.streakDays}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Day Streak</div>
            </div>
          </div>

          {topDocumentType && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Most Used Document Type</h3>
              <div className="text-lg text-gray-700 dark:text-gray-300">
                {topDocumentType[0]} ({topDocumentType[1]} times)
              </div>
            </div>
          )}

          {topSignatory && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Most Used Signatory</h3>
              <div className="text-lg text-gray-700 dark:text-gray-300">
                {topSignatory[0]} ({topSignatory[1]} times)
              </div>
            </div>
          )}

          {stats.achievements.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 p-4 rounded-xl">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">🏆 Achievements</h3>
              <div className="grid grid-cols-2 gap-2">
                {stats.achievements.map((achievement) => (
                  <div
                    key={achievement}
                    className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {getAchievementName(achievement)}
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

