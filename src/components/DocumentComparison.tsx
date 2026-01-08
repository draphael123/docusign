"use client";

import { useState, useMemo } from "react";

interface DocumentComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
}

interface Diff {
  type: "added" | "removed" | "unchanged";
  text: string;
}

export default function DocumentComparison({ isOpen, onClose, currentText }: DocumentComparisonProps) {
  const [compareText, setCompareText] = useState("");
  const [showDiff, setShowDiff] = useState(false);

  const computeDiff = (text1: string, text2: string): Diff[] => {
    const words1 = text1.split(/(\s+)/);
    const words2 = text2.split(/(\s+)/);
    const result: Diff[] = [];
    
    let i = 0, j = 0;
    
    while (i < words1.length || j < words2.length) {
      if (i >= words1.length) {
        result.push({ type: "added", text: words2[j] });
        j++;
      } else if (j >= words2.length) {
        result.push({ type: "removed", text: words1[i] });
        i++;
      } else if (words1[i] === words2[j]) {
        result.push({ type: "unchanged", text: words1[i] });
        i++;
        j++;
      } else {
        // Look ahead for match
        let foundI = -1, foundJ = -1;
        for (let k = 1; k <= 5; k++) {
          if (i + k < words1.length && words1[i + k] === words2[j]) {
            foundI = i + k;
            break;
          }
          if (j + k < words2.length && words1[i] === words2[j + k]) {
            foundJ = j + k;
            break;
          }
        }
        
        if (foundI !== -1 && (foundJ === -1 || foundI - i <= foundJ - j)) {
          while (i < foundI) {
            result.push({ type: "removed", text: words1[i] });
            i++;
          }
        } else if (foundJ !== -1) {
          while (j < foundJ) {
            result.push({ type: "added", text: words2[j] });
            j++;
          }
        } else {
          result.push({ type: "removed", text: words1[i] });
          result.push({ type: "added", text: words2[j] });
          i++;
          j++;
        }
      }
    }
    
    return result;
  };

  const diff = useMemo(() => {
    if (!showDiff || !compareText) return [];
    return computeDiff(compareText, currentText);
  }, [compareText, currentText, showDiff]);

  const stats = useMemo(() => {
    if (!showDiff) return { added: 0, removed: 0, unchanged: 0 };
    return {
      added: diff.filter(d => d.type === "added" && d.text.trim()).length,
      removed: diff.filter(d => d.type === "removed" && d.text.trim()).length,
      unchanged: diff.filter(d => d.type === "unchanged" && d.text.trim()).length,
    };
  }, [diff, showDiff]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">📊 Document Comparison</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {!showDiff ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/30">
                <p className="text-[#a0a0a0] text-sm">
                  Paste older version of your document below to compare with current version.
                </p>
              </div>

              <div>
                <label className="block text-sm text-[#a0a0a0] mb-2">Previous Version (paste here)</label>
                <textarea
                  value={compareText}
                  onChange={(e) => setCompareText(e.target.value)}
                  placeholder="Paste the older version of your document..."
                  className="w-full h-64 px-4 py-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white resize-none focus:border-[#a78bfa]"
                />
              </div>

              <button
                onClick={() => setShowDiff(true)}
                disabled={!compareText.trim()}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white hover:opacity-90 disabled:opacity-50"
              >
                Compare Documents
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex gap-4">
                <div className="px-4 py-2 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/30">
                  <span className="text-[#4ade80]">+{stats.added} added</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30">
                  <span className="text-[#f87171]">-{stats.removed} removed</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-[#2a2a3a]">
                  <span className="text-[#a0a0a0]">{stats.unchanged} unchanged</span>
                </div>
                <button
                  onClick={() => setShowDiff(false)}
                  className="ml-auto text-sm text-[#a78bfa] hover:text-[#c4b5fd]"
                >
                  ← Back to input
                </button>
              </div>

              {/* Diff view */}
              <div className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] min-h-[300px] max-h-[500px] overflow-auto">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {diff.map((d, i) => (
                    <span
                      key={i}
                      className={`${
                        d.type === "added" 
                          ? "bg-[#4ade80]/20 text-[#4ade80]" 
                          : d.type === "removed" 
                            ? "bg-[#f87171]/20 text-[#f87171] line-through" 
                            : "text-white"
                      }`}
                    >
                      {d.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-4 text-sm text-[#666680]">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#4ade80]/20"></span>
                  Added
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-[#f87171]/20"></span>
                  Removed
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

