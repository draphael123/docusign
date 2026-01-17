"use client";

import { useState, useEffect } from "react";
import {
  X,
  Accessibility,
  Eye,
  Type,
  Contrast,
  Moon,
  Zap,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react";

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccessibilityOptions {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  focusIndicators: boolean;
  soundEnabled: boolean;
}

const DEFAULT_OPTIONS: AccessibilityOptions = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderOptimized: false,
  focusIndicators: true,
  soundEnabled: true,
};

export default function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const [options, setOptions] = useState<AccessibilityOptions>(DEFAULT_OPTIONS);

  // Load saved options
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("accessibilityOptions");
      if (saved) {
        try {
          setOptions(JSON.parse(saved));
        } catch {
          // ignore
        }
      }

      // Check system preferences
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches;

      if (prefersReducedMotion || prefersHighContrast) {
        setOptions((prev) => ({
          ...prev,
          reducedMotion: prefersReducedMotion || prev.reducedMotion,
          highContrast: prefersHighContrast || prev.highContrast,
        }));
      }
    }
  }, []);

  // Apply options
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;

      // High contrast
      root.classList.toggle("high-contrast", options.highContrast);

      // Large text
      root.classList.toggle("large-text", options.largeText);

      // Reduced motion
      root.classList.toggle("reduced-motion", options.reducedMotion);

      // Focus indicators
      root.classList.toggle("enhanced-focus", options.focusIndicators);

      // Save to localStorage
      localStorage.setItem("accessibilityOptions", JSON.stringify(options));
    }
  }, [options]);

  const updateOption = (key: keyof AccessibilityOptions, value: boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Accessibility className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Accessibility</h2>
                <p className="text-sm text-[--text-muted]">Customize your experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[--bg-elevated] text-[--text-muted] hover:text-[--text-primary] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* High Contrast */}
          <SettingToggle
            icon={<Contrast className="w-5 h-5" />}
            title="High Contrast"
            description="Increase color contrast for better visibility"
            enabled={options.highContrast}
            onChange={(v) => updateOption("highContrast", v)}
            color="text-yellow-500"
          />

          {/* Large Text */}
          <SettingToggle
            icon={<Type className="w-5 h-5" />}
            title="Large Text"
            description="Increase font sizes throughout the app"
            enabled={options.largeText}
            onChange={(v) => updateOption("largeText", v)}
            color="text-blue-500"
          />

          {/* Reduced Motion */}
          <SettingToggle
            icon={<Zap className="w-5 h-5" />}
            title="Reduced Motion"
            description="Minimize animations and transitions"
            enabled={options.reducedMotion}
            onChange={(v) => updateOption("reducedMotion", v)}
            color="text-green-500"
          />

          {/* Focus Indicators */}
          <SettingToggle
            icon={<Eye className="w-5 h-5" />}
            title="Enhanced Focus"
            description="Show stronger focus indicators when navigating"
            enabled={options.focusIndicators}
            onChange={(v) => updateOption("focusIndicators", v)}
            color="text-purple-500"
          />

          {/* Sound Effects */}
          <SettingToggle
            icon={options.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            title="Sound Effects"
            description="Play sounds for actions and notifications"
            enabled={options.soundEnabled}
            onChange={(v) => updateOption("soundEnabled", v)}
            color="text-pink-500"
          />

          {/* Keyboard Shortcuts */}
          <div className="p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
            <h4 className="font-medium mb-3">Quick Keyboard Shortcuts</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[--text-muted]">Save draft</span>
                <kbd className="kbd">⌘S</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[--text-muted]">Command palette</span>
                <kbd className="kbd">⌘K</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[--text-muted]">Find & replace</span>
                <kbd className="kbd">⌘F</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[--text-muted]">Preview PDF</span>
                <kbd className="kbd">⌘P</kbd>
              </div>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => setOptions(DEFAULT_OPTIONS)}
            className="w-full text-center text-sm text-[--text-muted] hover:text-[--color-primary] transition-colors"
          >
            Reset to defaults
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[--border-default]">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Toggle component
function SettingToggle({
  icon,
  title,
  description,
  enabled,
  onChange,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
      <div className="flex items-center gap-3">
        <span className={color}>{icon}</span>
        <div>
          <span className="font-medium">{title}</span>
          <p className="text-xs text-[--text-muted]">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors relative ${
          enabled ? "bg-[--color-primary]" : "bg-[--bg-overlay]"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

// CSS to inject for accessibility modes
export const accessibilityStyles = `
/* High Contrast Mode */
.high-contrast {
  --bg-base: #000000;
  --bg-surface: #0a0a0a;
  --bg-elevated: #141414;
  --text-primary: #ffffff;
  --text-secondary: #e0e0e0;
  --text-muted: #b0b0b0;
  --border-default: #404040;
  --color-primary: #ff6b6b;
  --color-accent: #4ecdc4;
}

.high-contrast .card,
.high-contrast input,
.high-contrast textarea,
.high-contrast select {
  border-width: 2px;
}

.high-contrast a,
.high-contrast button {
  text-decoration: underline;
}

/* Large Text Mode */
.large-text {
  font-size: 18px;
}

.large-text h1 { font-size: 2.5rem !important; }
.large-text h2 { font-size: 2rem !important; }
.large-text h3 { font-size: 1.5rem !important; }
.large-text .text-sm { font-size: 1rem !important; }
.large-text .text-xs { font-size: 0.875rem !important; }

.large-text input,
.large-text textarea,
.large-text select {
  font-size: 1.125rem !important;
  padding: 1rem !important;
}

/* Reduced Motion */
.reduced-motion *,
.reduced-motion *::before,
.reduced-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Enhanced Focus */
.enhanced-focus :focus-visible {
  outline: 3px solid var(--color-primary) !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 6px rgba(224, 122, 95, 0.3) !important;
}
`;
