"use client";

import { useState, useEffect } from "react";
import { DocumentTemplate } from "@/data/templates";

interface QuickTemplatesProps {
  templates: DocumentTemplate[];
  onSelectTemplate: (template: DocumentTemplate) => void;
}

export function usePinnedTemplates() {
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("pinnedTemplates");
    if (saved) {
      try {
        setPinnedIds(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading pinned templates:", e);
      }
    }
  }, []);

  const togglePin = (templateId: string) => {
    const newPinned = pinnedIds.includes(templateId)
      ? pinnedIds.filter((id) => id !== templateId)
      : [...pinnedIds, templateId].slice(0, 5); // Max 5 pinned
    
    setPinnedIds(newPinned);
    localStorage.setItem("pinnedTemplates", JSON.stringify(newPinned));
  };

  const isPinned = (templateId: string) => pinnedIds.includes(templateId);

  return { pinnedIds, togglePin, isPinned, mounted };
}

export default function QuickTemplates({ templates, onSelectTemplate }: QuickTemplatesProps) {
  const { pinnedIds, mounted } = usePinnedTemplates();

  if (!mounted || pinnedIds.length === 0) return null;

  const pinnedTemplates = templates.filter((t) => pinnedIds.includes(t.id));

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-xs text-[#666680] mb-2">
        <span>📌</span>
        <span>Quick Access</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {pinnedTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#a78bfa]/20 to-[#f472b6]/20 border border-[#a78bfa]/30 text-[#a78bfa] text-sm hover:border-[#a78bfa] transition-all"
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>
  );
}

