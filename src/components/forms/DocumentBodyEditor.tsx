"use client";

import { useRef, useState, useCallback } from "react";
import { useDocumentStore } from "@/store/documentStore";
import { toast } from "react-hot-toast";
import {
  FileText,
  Calendar,
  Minus,
  SeparatorHorizontal,
  PenLine,
  Search,
  Copy,
  Undo2,
  Type,
  Target,
  Sparkles,
} from "lucide-react";

interface DocumentBodyEditorProps {
  theme?: "dark" | "light";
  spellCheckEnabled?: boolean;
  onOpenAI?: () => void;
  onOpenFindReplace?: () => void;
}

export default function DocumentBodyEditor({
  theme = "dark",
  spellCheckEnabled = true,
  onOpenAI,
  onOpenFindReplace,
}: DocumentBodyEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCountGoal, setWordCountGoal] = useState(0);
  const [autoCapitalize, setAutoCapitalize] = useState(false);

  const { bodyText, setBodyText, undo } = useDocumentStore();

  const bgElevated = theme === "light" ? "bg-[#f5f2ed]" : "bg-[--bg-elevated]";
  const borderColor = theme === "light" ? "border-[#e5e0d8]" : "border-[--border-default]";
  const textMuted = theme === "light" ? "text-[#8f897f]" : "text-[--text-muted]";

  const wordCount = bodyText.trim() ? bodyText.trim().split(/\s+/).length : 0;
  const characterCount = bodyText.length;

  // Insert text at cursor position
  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        setBodyText(bodyText + text);
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = bodyText.substring(0, start) + text + bodyText.substring(end);
      setBodyText(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    },
    [bodyText, setBodyText]
  );

  const insertDate = () =>
    insertAtCursor(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

  const insertHorizontalLine = () =>
    insertAtCursor("\n─────────────────────────────────────────\n");

  const insertPageBreak = () => insertAtCursor("\n\n--- PAGE BREAK ---\n\n");

  const insertSignatureBlock = () => {
    const block = `\n\n─────────────────────────────────────────\n\nSIGNATURE\n\nSign: ___________________________\n\nPrint Name: _____________________\n\nTitle: __________________________\n\nDate: ___________________________\n\n─────────────────────────────────────────`;
    insertAtCursor(block);
  };

  const findNextPlaceholder = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const regex = /\[[^\]]+\]/g;
    const matches: { index: number; text: string }[] = [];
    let match;
    while ((match = regex.exec(bodyText)) !== null) {
      matches.push({ index: match.index, text: match[0] });
    }
    if (matches.length === 0) {
      toast("No placeholders found", { icon: "ℹ️" });
      return;
    }
    const currentPos = textarea.selectionEnd;
    const nextMatch = matches.find((m) => m.index >= currentPos) || matches[0];
    if (nextMatch) {
      textarea.focus();
      textarea.setSelectionRange(nextMatch.index, nextMatch.index + nextMatch.text.length);
    }
  };

  const handleCopyText = () => {
    if (bodyText.trim()) {
      navigator.clipboard.writeText(bodyText);
      toast.success("Copied to clipboard");
    }
  };

  const handleUndo = () => {
    const result = undo();
    if (result !== null) {
      toast.success("Undone");
    } else {
      toast("Nothing to undo", { icon: "ℹ️" });
    }
  };

  const handleBodyTextChange = (value: string) => {
    if (autoCapitalize && value.length > bodyText.length) {
      const diff = value.substring(bodyText.length);
      if (diff === " " || diff === "\n") {
        const sentences = value.split(/([.!?]\s+)/);
        const capitalized = sentences
          .map((s, i) => {
            if (i % 2 === 0 && s.length > 0) {
              return s.charAt(0).toUpperCase() + s.slice(1);
            }
            return s;
          })
          .join("");
        setBodyText(capitalized);
        return;
      }
    }
    setBodyText(value);
  };

  const setGoal = (goal: number) => {
    setWordCountGoal(goal);
    if (goal > 0) {
      toast.success(`Word goal set to ${goal}`);
    }
  };

  const goalProgress = wordCountGoal > 0 ? Math.min(100, (wordCount / wordCountGoal) * 100) : 0;

  return (
    <section className="form-section card p-5 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <label htmlFor="bodyText" className="section-label flex items-center gap-2">
          <FileText className="w-4 h-4 text-[--color-primary]" />
          Document Body
        </label>
        <div className="flex items-center gap-4">
          {wordCountGoal > 0 && (
            <div className="flex items-center gap-2">
              <div className={`w-20 h-1.5 rounded-full ${bgElevated} overflow-hidden`}>
                <div
                  className="h-full bg-gradient-to-r from-[--color-primary] to-[--color-accent] transition-all duration-300"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <span className={`text-xs font-mono ${textMuted}`}>
                {wordCount}/{wordCountGoal}
              </span>
            </div>
          )}
          <span className={`text-xs font-mono ${textMuted}`}>
            {wordCount} words · {characterCount} chars
          </span>
        </div>
      </div>

      {/* Quick Insert Toolbar */}
      <div
        className={`flex flex-wrap gap-1 mb-3 p-2 rounded-xl ${bgElevated} border ${borderColor}`}
      >
        <ToolbarButton
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Date"
          onClick={insertDate}
          color="text-blue-400"
        />
        <ToolbarButton
          icon={<Minus className="w-3.5 h-3.5" />}
          label="Line"
          onClick={insertHorizontalLine}
          color="text-teal-400"
        />
        <ToolbarButton
          icon={<SeparatorHorizontal className="w-3.5 h-3.5" />}
          label="Page Break"
          onClick={insertPageBreak}
          color="text-violet-400"
        />
        <ToolbarButton
          icon={<PenLine className="w-3.5 h-3.5" />}
          label="Signature"
          onClick={insertSignatureBlock}
          color="text-pink-400"
        />

        <div className={`w-px h-5 ${borderColor} mx-1 self-center`} />

        <ToolbarButton
          icon={<Search className="w-3.5 h-3.5" />}
          label="Find [...]"
          onClick={findNextPlaceholder}
          color="text-amber-400"
        />
        <ToolbarButton
          icon={<Copy className="w-3.5 h-3.5" />}
          label="Copy"
          onClick={handleCopyText}
          color="text-emerald-400"
        />
        <ToolbarButton
          icon={<Undo2 className="w-3.5 h-3.5" />}
          label="Undo"
          onClick={handleUndo}
          color="text-red-400"
        />

        <div className="flex-1" />

        {onOpenFindReplace && (
          <ToolbarButton
            icon={<Search className="w-3.5 h-3.5" />}
            label="Find"
            onClick={onOpenFindReplace}
            color="text-blue-400"
            tooltip="Ctrl+F"
          />
        )}

        {onOpenAI && (
          <ToolbarButton
            icon={<Sparkles className="w-3.5 h-3.5" />}
            label="AI"
            onClick={onOpenAI}
            color="text-violet-400"
            tooltip="AI Writing Assistant"
          />
        )}

        <ToolbarButton
          icon={<Type className="w-3.5 h-3.5" />}
          label="Aa"
          onClick={() => setAutoCapitalize(!autoCapitalize)}
          active={autoCapitalize}
          tooltip="Auto-capitalize sentences"
        />
        <ToolbarButton
          icon={<Target className="w-3.5 h-3.5" />}
          label="Goal"
          onClick={() => {
            const goal = prompt("Word count goal (0 to disable):", wordCountGoal.toString());
            if (goal !== null) setGoal(parseInt(goal) || 0);
          }}
          color="text-teal-400"
          tooltip="Set word count goal"
        />
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="bodyText"
          value={bodyText}
          onChange={(e) => handleBodyTextChange(e.target.value)}
          rows={14}
          className={`w-full px-4 py-3 rounded-xl resize-y ${
            bodyText.trim() && wordCount < 20 ? "border-red-400/50 focus:border-red-400" : ""
          }`}
          placeholder="Start writing your document...&#10;&#10;Use [brackets] for placeholders that can be easily found and replaced."
          spellCheck={spellCheckEnabled}
        />

        {/* Empty state overlay */}
        {!bodyText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <FileText className={`w-16 h-16 mb-4 ${textMuted} opacity-20`} />
            <p className={`${textMuted} opacity-50 text-center`}>
              Start typing or select a template from the sidebar
            </p>
          </div>
        )}
      </div>

      {/* Warning for short content */}
      {bodyText.trim() && wordCount < 20 && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Consider adding more content for a professional document.
        </p>
      )}
    </section>
  );
}

// Toolbar button component
interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
  active?: boolean;
  tooltip?: string;
}

function ToolbarButton({
  icon,
  label,
  onClick,
  color = "text-[--text-muted]",
  active = false,
  tooltip,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 ${
        active
          ? "bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white"
          : `${color} hover:bg-white/10`
      }`}
      title={tooltip || label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

