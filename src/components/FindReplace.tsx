"use client";

import { useState, useEffect, useCallback } from "react";

interface FindReplaceProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  onTextChange: (newText: string) => void;
}

export default function FindReplace({ isOpen, onClose, text, onTextChange }: FindReplaceProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);

  // Count matches
  useEffect(() => {
    if (!findText) {
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }

    const flags = matchCase ? "g" : "gi";
    const regex = new RegExp(escapeRegex(findText), flags);
    const matches = text.match(regex);
    setMatchCount(matches ? matches.length : 0);
    setCurrentMatch(matches ? 1 : 0);
  }, [findText, text, matchCase]);

  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const handleReplaceOne = () => {
    if (!findText || matchCount === 0) return;

    const flags = matchCase ? "" : "i";
    const regex = new RegExp(escapeRegex(findText), flags);
    const newText = text.replace(regex, replaceText);
    onTextChange(newText);
  };

  const handleReplaceAll = () => {
    if (!findText || matchCount === 0) return;

    const flags = matchCase ? "g" : "gi";
    const regex = new RegExp(escapeRegex(findText), flags);
    const newText = text.replace(regex, replaceText);
    onTextChange(newText);
  };

  // Keyboard shortcut to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-80 bg-[#12121a]/95 backdrop-blur-md rounded-xl border border-[#2a2a3a] shadow-2xl shadow-[#a78bfa]/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Find & Replace</h3>
        <button onClick={onClose} className="text-[#666680] hover:text-white">×</button>
      </div>

      <div className="space-y-3">
        {/* Find */}
        <div>
          <label className="text-xs text-[#666680] block mb-1">Find</label>
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Search text..."
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm focus:border-[#a78bfa]"
            autoFocus
          />
        </div>

        {/* Replace */}
        <div>
          <label className="text-xs text-[#666680] block mb-1">Replace with</label>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replacement text..."
            className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm focus:border-[#4ecdc4]"
          />
        </div>

        {/* Options */}
        <label className="flex items-center gap-2 text-sm text-[#a0a0a0]">
          <input
            type="checkbox"
            checked={matchCase}
            onChange={(e) => setMatchCase(e.target.checked)}
            className="rounded"
          />
          Match case
        </label>

        {/* Match count */}
        <div className="text-sm text-[#666680]">
          {findText ? (
            matchCount > 0 ? (
              <span className="text-[#4ade80]">{matchCount} match{matchCount !== 1 ? "es" : ""} found</span>
            ) : (
              <span className="text-[#f87171]">No matches found</span>
            )
          ) : (
            "Enter text to search"
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleReplaceOne}
            disabled={matchCount === 0}
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-[#4ecdc4] text-[#0a0a12] hover:bg-[#3dbdb5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={matchCount === 0}
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}

