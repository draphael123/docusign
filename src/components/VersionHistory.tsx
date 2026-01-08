"use client";

import { useState, useEffect } from "react";

interface DocumentVersion {
  id: string;
  timestamp: string;
  documentType: string;
  bodyText: string;
  wordCount: number;
}

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (bodyText: string) => void;
  currentBodyText: string;
  documentType: string;
}

const MAX_VERSIONS = 20;

export function useVersionHistory() {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("versionHistory");
    if (saved) {
      try {
        setVersions(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading version history:", e);
      }
    }
  }, []);

  const saveVersion = (documentType: string, bodyText: string) => {
    if (!bodyText.trim()) return;

    const wordCount = bodyText.trim().split(/\s+/).length;
    const newVersion: DocumentVersion = {
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
      documentType,
      bodyText,
      wordCount,
    };

    // Don't save if identical to most recent
    if (versions.length > 0 && versions[0].bodyText === bodyText) {
      return;
    }

    const updated = [newVersion, ...versions].slice(0, MAX_VERSIONS);
    setVersions(updated);
    localStorage.setItem("versionHistory", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setVersions([]);
    localStorage.removeItem("versionHistory");
  };

  return { versions, saveVersion, clearHistory, mounted };
}

export default function VersionHistory({ isOpen, onClose, onRestore, currentBodyText, documentType }: VersionHistoryProps) {
  const { versions, clearHistory } = useVersionHistory();
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  if (!isOpen) return null;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getPreview = (text: string) => {
    return text.slice(0, 150) + (text.length > 150 ? "..." : "");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-[#2a2a3a] shadow-2xl shadow-[#a78bfa]/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">📜 Version History</h2>
          <div className="flex items-center gap-2">
            {versions.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-1.5 rounded-lg text-sm text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
              >
                Clear All
              </button>
            )}
            <button onClick={onClose} className="text-[#666680] hover:text-white transition-colors text-2xl">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Version List */}
          <div className="w-1/3 border-r border-[#2a2a3a] overflow-auto">
            {versions.length === 0 ? (
              <div className="p-8 text-center text-[#666680]">
                <p>No versions saved yet.</p>
                <p className="text-sm mt-2">Versions are saved automatically when you generate documents.</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedVersion?.id === version.id
                        ? "bg-[#a78bfa]/20 border border-[#a78bfa]/30"
                        : "hover:bg-[#1a1a24]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{version.documentType}</span>
                      <span className="text-xs text-[#666680]">{formatDate(version.timestamp)}</span>
                    </div>
                    <div className="text-xs text-[#666680]">{version.wordCount} words</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-auto p-4">
            {selectedVersion ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-medium">{selectedVersion.documentType}</h3>
                    <p className="text-sm text-[#666680]">
                      {new Date(selectedVersion.timestamp).toLocaleString()} · {selectedVersion.wordCount} words
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDiff(!showDiff)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        showDiff
                          ? "bg-[#4ecdc4] text-[#0a0a12]"
                          : "bg-[#2a2a3a] text-[#a0a0a0] hover:bg-[#3a3a4a]"
                      }`}
                    >
                      Compare
                    </button>
                    <button
                      onClick={() => {
                        onRestore(selectedVersion.bodyText);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white"
                    >
                      Restore
                    </button>
                  </div>
                </div>

                {showDiff ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-[#f87171] mb-2">Current Version</div>
                      <div className="p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-sm text-[#a0a0a0] whitespace-pre-wrap max-h-[400px] overflow-auto">
                        {currentBodyText || "(empty)"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#4ade80] mb-2">Selected Version</div>
                      <div className="p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-sm text-[#a0a0a0] whitespace-pre-wrap max-h-[400px] overflow-auto">
                        {selectedVersion.bodyText}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-sm text-[#a0a0a0] whitespace-pre-wrap max-h-[500px] overflow-auto">
                    {selectedVersion.bodyText}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#666680]">
                Select a version to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

