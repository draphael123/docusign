"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface PrivacySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacySettings({ isOpen, onClose }: PrivacySettingsProps) {
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("privateMode") === "true";
    }
    return false;
  });

  const handleTogglePrivateMode = () => {
    const newMode = !isPrivateMode;
    setIsPrivateMode(newMode);
    localStorage.setItem("privateMode", newMode.toString());
    toast.success(newMode ? "Private mode enabled 🔒" : "Private mode disabled");
  };

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to clear ALL data? This will delete:\n\n" +
      "• Document drafts\n" +
      "• Document history\n" +
      "• Statistics\n" +
      "• Favorites\n" +
      "• Last used settings\n" +
      "• Theme preferences\n\n" +
      "This action cannot be undone!"
    );

    if (confirmed) {
      const itemsToKeep = ["theme"]; // Keep theme preference
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!itemsToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      toast.success("All data cleared successfully!");
      onClose();
      window.location.reload(); // Reload to reflect changes
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem("documentHistory");
    toast.success("Document history cleared!");
  };

  const handleClearStatistics = () => {
    localStorage.removeItem("documentStats");
    toast.success("Statistics cleared!");
  };

  const handleClearFavorites = () => {
    localStorage.removeItem("favoriteSettings");
    toast.success("Favorites cleared!");
  };

  const handleExportData = () => {
    const data = {
      documentDraft: localStorage.getItem("documentDraft"),
      documentHistory: localStorage.getItem("documentHistory"),
      documentStats: localStorage.getItem("documentStats"),
      favoriteSettings: localStorage.getItem("favoriteSettings"),
      lastUsedSettings: localStorage.getItem("lastUsedSettings"),
      lastSaved: localStorage.getItem("lastSaved"),
      theme: localStorage.getItem("theme"),
      exportedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `document-generator-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const getStorageSize = (): string => {
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    const sizeInKB = (totalSize / 1024).toFixed(2);
    return sizeInKB;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              🔒 Privacy & Data Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Control your data and privacy settings
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Privacy Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-2">
              <span>ℹ️</span> Data Storage Notice
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              All your data is stored locally in your browser (localStorage). We do not collect, store, or transmit any personal information to external servers. Your documents, drafts, and settings stay on your device only.
            </p>
          </div>

          {/* Storage Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Storage Usage
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Current storage: <span className="font-bold">{getStorageSize()} KB</span> of local data
            </p>
          </div>

          {/* Private Mode */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <span>🕵️</span> Private Mode
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                  When enabled, history and statistics won't be saved
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivateMode}
                  onChange={handleTogglePrivateMode}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>

          {/* Clear Data Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Clear Data
            </h3>
            
            <button
              onClick={handleClearHistory}
              className="w-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 py-3 px-4 rounded-xl font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all text-left flex items-center justify-between"
            >
              <span>Clear Document History</span>
              <span>🗑️</span>
            </button>

            <button
              onClick={handleClearStatistics}
              className="w-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 py-3 px-4 rounded-xl font-semibold hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all text-left flex items-center justify-between"
            >
              <span>Clear Statistics</span>
              <span>🗑️</span>
            </button>

            <button
              onClick={handleClearFavorites}
              className="w-full bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 py-3 px-4 rounded-xl font-semibold hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-all text-left flex items-center justify-between"
            >
              <span>Clear Favorites</span>
              <span>🗑️</span>
            </button>

            <button
              onClick={handleClearAllData}
              className="w-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 py-3 px-4 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-left flex items-center justify-between"
            >
              <span>⚠️ Clear ALL Data</span>
              <span>🗑️</span>
            </button>
          </div>

          {/* Export Data */}
          <div>
            <button
              onClick={handleExportData}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg flex items-center justify-between"
            >
              <span>📦 Export All Data (JSON)</span>
              <span>⬇️</span>
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Download a backup of all your data
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

