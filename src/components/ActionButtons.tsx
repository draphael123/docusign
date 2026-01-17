"use client";

import { Download, Eye, FileText } from "lucide-react";

interface ActionButtonsProps {
  onPreview: () => void;
  onDownload: () => void;
  onExportWord: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export default function ActionButtons({
  onPreview,
  onDownload,
  onExportWord,
  isGenerating,
  disabled,
}: ActionButtonsProps) {
  return (
    <section className="flex flex-col sm:flex-row gap-3 pt-4">
      <button
        onClick={onPreview}
        disabled={isGenerating || disabled}
        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[--text-primary] bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-primary] hover-lift disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all"
      >
        <Eye className="w-5 h-5" />
        {isGenerating ? "Working..." : "Preview"}
      </button>

      <button
        onClick={onDownload}
        disabled={isGenerating || disabled}
        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white bg-[--color-primary] hover:bg-[--color-primary-hover] disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all shadow-lg shadow-[--color-primary]/20 hover:shadow-xl hover:shadow-[--color-primary]/30 hover:-translate-y-0.5 animate-pulse-glow"
      >
        <Download className="w-5 h-5" />
        {isGenerating ? "Generating..." : "Download PDF"}
      </button>

      <button
        onClick={onExportWord}
        disabled={isGenerating || disabled}
        className="px-5 py-3 rounded-xl text-[--text-primary] bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-accent] hover-lift disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2"
      >
        <FileText className="w-5 h-5" />
        Word
      </button>
    </section>
  );
}

