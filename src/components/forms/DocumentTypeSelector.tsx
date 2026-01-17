"use client";

import { useState, useEffect } from "react";
import { useDocumentStore } from "@/store/documentStore";
import { FileText, ChevronDown, Clock } from "lucide-react";

const documentTypes = [
  "Letter of Recommendation",
  "Letter of Termination",
  "Letter of Employment",
  "Letter of Reference",
  "Letter of Introduction",
  "Letter of Resignation",
  "Letter of Acceptance",
  "Letter of Rejection",
  "Letter of Apology",
  "Letter of Complaint",
  "Letter of Inquiry",
  "Letter of Request",
  "Letter of Confirmation",
  "Letter of Agreement",
  "Letter of Authorization",
  "Custom Document",
];

interface DocumentTypeSelectorProps {
  theme?: "dark" | "light";
}

export default function DocumentTypeSelector({ theme = "dark" }: DocumentTypeSelectorProps) {
  const { documentType, setDocumentType } = useDocumentStore();
  const [recentTypes, setRecentTypes] = useState<string[]>([]);

  const bgElevated = theme === "light" ? "bg-[#f5f2ed]" : "bg-[--bg-elevated]";
  const borderColor = theme === "light" ? "border-[#e5e0d8]" : "border-[--border-default]";
  const textMuted = theme === "light" ? "text-[#8f897f]" : "text-[--text-muted]";

  // Load recent types from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recentDocTypes");
      if (saved) {
        try {
          setRecentTypes(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Update recent types when selection changes
  useEffect(() => {
    if (documentType && typeof window !== "undefined") {
      setRecentTypes((prev) => {
        const updated = [documentType, ...prev.filter((t) => t !== documentType)].slice(0, 5);
        localStorage.setItem("recentDocTypes", JSON.stringify(updated));
        return updated;
      });
    }
  }, [documentType]);

  const accentColors = [
    "border-[--color-accent] text-[--color-accent]",
    "border-pink-400 text-pink-400",
    "border-blue-400 text-blue-400",
    "border-amber-400 text-amber-400",
  ];

  return (
    <section className="form-section card p-5 rounded-xl">
      <label htmlFor="documentType" className="section-label mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-[--color-primary]" />
        Document Type
      </label>

      <div className="relative">
        <select
          id="documentType"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className={`w-full px-4 py-3 pr-10 rounded-xl appearance-none cursor-pointer ${bgElevated} border ${borderColor} focus:border-[--color-primary]`}
        >
          {documentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted} pointer-events-none`}
        />
      </div>

      {/* Recent Types */}
      {recentTypes.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`text-xs ${textMuted} flex items-center gap-1`}>
            <Clock className="w-3 h-3" />
            Recent:
          </span>
          {recentTypes.slice(1, 4).map((type, idx) => (
            <button
              key={type}
              onClick={() => setDocumentType(type)}
              className={`text-xs px-2.5 py-1 rounded-lg ${bgElevated} border transition-all hover:scale-105 ${accentColors[idx % accentColors.length]}`}
            >
              {type.replace("Letter of ", "")}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

