"use client";

import { useDocumentStore } from "@/store/documentStore";
import { Sliders, Type, AlignJustify } from "lucide-react";

interface FormattingOptionsProps {
  theme?: "dark" | "light";
}

export default function FormattingOptions({ theme = "dark" }: FormattingOptionsProps) {
  const { formatting, setFormatting } = useDocumentStore();

  const textMuted = theme === "light" ? "text-[#8f897f]" : "text-[--text-muted]";

  return (
    <section className="form-section card p-5 rounded-xl">
      <h2 className="section-label mb-4 flex items-center gap-2">
        <Sliders className="w-4 h-4 text-[--color-accent]" />
        Formatting
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fontSize" className={`flex items-center gap-2 text-sm ${textMuted} mb-3`}>
            <Type className="w-4 h-4" />
            Font Size:{" "}
            <span className="text-[--color-primary] font-mono font-medium">
              {formatting.fontSize}pt
            </span>
          </label>
          <input
            type="range"
            id="fontSize"
            min="9"
            max="14"
            value={formatting.fontSize}
            onChange={(e) => setFormatting({ fontSize: Number(e.target.value) })}
            className="w-full accent-[--color-primary]"
          />
          <div className={`flex justify-between text-xs ${textMuted} mt-1`}>
            <span>9pt</span>
            <span>14pt</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="lineSpacing"
            className={`flex items-center gap-2 text-sm ${textMuted} mb-3`}
          >
            <AlignJustify className="w-4 h-4" />
            Line Spacing:{" "}
            <span className="text-[--color-accent] font-mono font-medium">
              {formatting.lineSpacing.toFixed(1)}
            </span>
          </label>
          <input
            type="range"
            id="lineSpacing"
            min="1"
            max="2.5"
            step="0.1"
            value={formatting.lineSpacing}
            onChange={(e) => setFormatting({ lineSpacing: Number(e.target.value) })}
            className="w-full accent-[--color-accent]"
          />
          <div className={`flex justify-between text-xs ${textMuted} mt-1`}>
            <span>1.0</span>
            <span>2.5</span>
          </div>
        </div>
      </div>
    </section>
  );
}

