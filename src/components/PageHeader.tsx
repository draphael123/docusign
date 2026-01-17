"use client";

import { useUIStore, useDocumentStore } from "@/store/documentStore";
import { Sun, Moon, Settings, Command, Save, Trash2, Eye, Flame, Timer } from "lucide-react";
import AutoSaveIndicator from "./AutoSaveIndicator";
import LanguageSelector from "./LanguageSelector";
import { IconButton, ButtonGroup } from "./Button";
import UserMenu from "./UserMenu";

interface PageHeaderProps {
  isTracking?: boolean;
  currentSessionSeconds?: number;
  formatTime?: (seconds: number) => string;
  onSave: () => void;
  onClear: () => void;
  onTogglePreview: () => void;
  showPreview?: boolean;
  onShowStreaks: () => void;
  onShowSettings: () => void;
  isSaving?: boolean;
  onShowAuth?: () => void;
  onShowMyTemplates?: () => void;
}

export default function PageHeader({
  isTracking = false,
  currentSessionSeconds = 0,
  formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`,
  onSave,
  onClear,
  onTogglePreview,
  showPreview = false,
  onShowStreaks,
  onShowSettings,
  isSaving = false,
  onShowAuth,
  onShowMyTemplates,
}: PageHeaderProps) {
  const { theme, setTheme, toggleCommandPalette } = useUIStore();
  const { hasUnsavedChanges, lastSaved } = useDocumentStore();

  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-1">
            <span className="text-gradient">Document Generator</span>
          </h1>
          <p className="text-sm text-[--text-muted]">
            Professional documents, ready for signature
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AutoSaveIndicator
            lastSaved={lastSaved}
            isSaving={isSaving}
            hasChanges={hasUnsavedChanges}
          />
          <LanguageSelector compact />
          <IconButton
            icon={theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            variant="secondary"
            tooltip={theme === "dark" ? "Light mode" : "Dark mode"}
          />
          <IconButton
            icon={<Settings className="w-5 h-5" />}
            onClick={onShowSettings}
            variant="ghost"
            tooltip="Settings"
          />
          {/* User Menu */}
          <UserMenu
            onShowAuth={onShowAuth || (() => {})}
            onShowMyTemplates={onShowMyTemplates || (() => {})}
            onShowSettings={onShowSettings}
          />
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-[--border-default]">
        {/* Command Palette Trigger */}
        <button
          onClick={toggleCommandPalette}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-primary]/50 transition-all text-[--text-muted] hover:text-[--text-primary]"
        >
          <Command className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Search commands...</span>
          <kbd className="kbd text-xs ml-2">⌘K</kbd>
        </button>

        {/* Time Tracker */}
        {isTracking && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[--color-primary]/10 border border-[--color-primary]/30">
            <Timer className="w-4 h-4 text-[--color-primary]" />
            <span className="text-sm font-mono text-[--color-primary]">
              {formatTime(currentSessionSeconds)}
            </span>
          </div>
        )}

        <div className="flex-1" />

        <ButtonGroup>
          <IconButton
            icon={<Flame className="w-5 h-5" />}
            onClick={onShowStreaks}
            variant="ghost"
            tooltip="View streak"
          />
          <IconButton
            icon={<Eye className="w-5 h-5" />}
            onClick={onTogglePreview}
            variant={showPreview ? "primary" : "ghost"}
            tooltip={showPreview ? "Hide preview" : "Live preview"}
          />
        </ButtonGroup>

        <div className="h-6 w-px bg-[--border-default]" />

        <ButtonGroup>
          <IconButton
            icon={<Save className="w-4 h-4" />}
            onClick={onSave}
            variant="ghost"
            tooltip="Save draft (⌘S)"
          />
          <IconButton
            icon={<Trash2 className="w-4 h-4" />}
            onClick={onClear}
            variant="ghost"
            tooltip="Clear document"
          />
        </ButtonGroup>
      </div>
    </header>
  );
}

