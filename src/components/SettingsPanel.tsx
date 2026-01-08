"use client";

import { useState, useEffect, useRef } from "react";

// Preset accent colors
const ACCENT_PRESETS = [
  { name: "Violet", color: "#a78bfa" },
  { name: "Teal", color: "#4ecdc4" },
  { name: "Pink", color: "#f472b6" },
  { name: "Gold", color: "#f0b866" },
  { name: "Blue", color: "#60a5fa" },
  { name: "Green", color: "#4ade80" },
  { name: "Red", color: "#f87171" },
  { name: "Orange", color: "#fb923c" },
];

// Font options
const FONT_OPTIONS = [
  { name: "DM Sans", value: "'DM Sans', sans-serif" },
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Merriweather", value: "'Merriweather', serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Source Sans Pro", value: "'Source Sans Pro', sans-serif" },
  { name: "Lato", value: "'Lato', sans-serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif" },
];

// Seasonal themes
const SEASONAL_THEMES = [
  { name: "Default", colors: { primary: "#a78bfa", secondary: "#4ecdc4", accent: "#f472b6" } },
  { name: "Spring", colors: { primary: "#86efac", secondary: "#fcd34d", accent: "#f9a8d4" } },
  { name: "Summer", colors: { primary: "#38bdf8", secondary: "#fbbf24", accent: "#fb923c" } },
  { name: "Autumn", colors: { primary: "#f97316", secondary: "#eab308", accent: "#dc2626" } },
  { name: "Winter", colors: { primary: "#93c5fd", secondary: "#c4b5fd", accent: "#e0e7ff" } },
  { name: "Ocean", colors: { primary: "#06b6d4", secondary: "#0ea5e9", accent: "#22d3ee" } },
  { name: "Forest", colors: { primary: "#22c55e", secondary: "#84cc16", accent: "#a3e635" } },
  { name: "Sunset", colors: { primary: "#f43f5e", secondary: "#fb7185", accent: "#fda4af" } },
];

// Page sizes
const PAGE_SIZES = [
  { name: "Letter (8.5 × 11 in)", value: "letter" },
  { name: "A4 (210 × 297 mm)", value: "a4" },
  { name: "Legal (8.5 × 14 in)", value: "legal" },
];

// Locale options
const LOCALE_OPTIONS = [
  { name: "English (US)", value: "en-US", dateFormat: "MM/DD/YYYY" },
  { name: "English (UK)", value: "en-GB", dateFormat: "DD/MM/YYYY" },
  { name: "German", value: "de-DE", dateFormat: "DD.MM.YYYY" },
  { name: "French", value: "fr-FR", dateFormat: "DD/MM/YYYY" },
  { name: "Spanish", value: "es-ES", dateFormat: "DD/MM/YYYY" },
];

export interface AppSettings {
  // Visual
  accentColor: string;
  documentFont: string;
  animatedBackground: boolean;
  compactMode: boolean;
  seasonalTheme: string;
  
  // Fun
  soundEffects: boolean;
  confettiEnabled: boolean;
  
  // Productivity
  focusMode: boolean;
  pomodoroEnabled: boolean;
  pomodoroMinutes: number;
  aiSuggestions: boolean;
  
  // Document
  watermark: string;
  watermarkEnabled: boolean;
  headerText: string;
  footerText: string;
  pageSize: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  letterheadUrl: string;
  
  // Advanced
  locale: string;
  offlineMode: boolean;
  versionHistoryEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  accentColor: "#a78bfa",
  documentFont: "'DM Sans', sans-serif",
  animatedBackground: true,
  compactMode: false,
  seasonalTheme: "Default",
  soundEffects: false,
  confettiEnabled: true,
  focusMode: false,
  pomodoroEnabled: false,
  pomodoroMinutes: 25,
  aiSuggestions: false,
  watermark: "",
  watermarkEnabled: false,
  headerText: "",
  footerText: "",
  pageSize: "letter",
  marginTop: 1,
  marginBottom: 1,
  marginLeft: 1,
  marginRight: 1,
  letterheadUrl: "",
  locale: "en-US",
  offlineMode: false,
  versionHistoryEnabled: true,
};

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export default function SettingsPanel({ isOpen, onClose, settings, onSettingsChange }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "fun" | "productivity" | "document" | "advanced">("visual");
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const letterheadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleLetterheadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateSetting("letterheadUrl", event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "visual", label: "Visual", icon: "🎨" },
    { id: "fun", label: "Fun", icon: "🎮" },
    { id: "productivity", label: "Productivity", icon: "⚡" },
    { id: "document", label: "Document", icon: "📄" },
    { id: "advanced", label: "Advanced", icon: "🔧" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl shadow-[#a78bfa]/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">Settings</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white transition-colors text-2xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-[#2a2a3a] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 text-sm rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white"
                  : "text-[#666680] hover:text-white hover:bg-[#1a1a24]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Visual Settings */}
          {activeTab === "visual" && (
            <div className="space-y-6">
              {/* Accent Color */}
              <div>
                <label className="block text-sm font-medium text-[#a78bfa] mb-3">Accent Color</label>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateSetting("accentColor", preset.color)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        localSettings.accentColor === preset.color
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#12121a] scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                  <input
                    type="color"
                    value={localSettings.accentColor}
                    onChange={(e) => updateSetting("accentColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Document Font */}
              <div>
                <label className="block text-sm font-medium text-[#4ecdc4] mb-3">Document Font</label>
                <select
                  value={localSettings.documentFont}
                  onChange={(e) => updateSetting("documentFont", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white focus:border-[#4ecdc4]"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seasonal Theme */}
              <div>
                <label className="block text-sm font-medium text-[#f472b6] mb-3">Seasonal Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {SEASONAL_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => updateSetting("seasonalTheme", theme.name)}
                      className={`p-3 rounded-lg border transition-all text-xs ${
                        localSettings.seasonalTheme === theme.name
                          ? "border-[#f472b6] bg-[#f472b6]/10"
                          : "border-[#2a2a3a] hover:border-[#3a3a4a]"
                      }`}
                    >
                      <div className="flex gap-1 mb-1 justify-center">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                      </div>
                      <span className="text-[#a0a0a0]">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                  <span className="text-white">Animated Background</span>
                  <button
                    onClick={() => updateSetting("animatedBackground", !localSettings.animatedBackground)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      localSettings.animatedBackground ? "bg-[#4ecdc4]" : "bg-[#3a3a4a]"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      localSettings.animatedBackground ? "left-7" : "left-1"
                    }`} />
                  </button>
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                  <span className="text-white">Compact Mode</span>
                  <button
                    onClick={() => updateSetting("compactMode", !localSettings.compactMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      localSettings.compactMode ? "bg-[#4ecdc4]" : "bg-[#3a3a4a]"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      localSettings.compactMode ? "left-7" : "left-1"
                    }`} />
                  </button>
                </label>
              </div>
            </div>
          )}

          {/* Fun Settings */}
          {activeTab === "fun" && (
            <div className="space-y-6">
              {/* Sound Effects */}
              <label className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div>
                  <span className="text-white block">🔊 Sound Effects</span>
                  <span className="text-[#666680] text-sm">Typewriter clicks, success sounds</span>
                </div>
                <button
                  onClick={() => updateSetting("soundEffects", !localSettings.soundEffects)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    localSettings.soundEffects ? "bg-[#a78bfa]" : "bg-[#3a3a4a]"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    localSettings.soundEffects ? "left-7" : "left-1"
                  }`} />
                </button>
              </label>

              {/* Confetti */}
              <label className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div>
                  <span className="text-white block">🎊 Confetti Celebrations</span>
                  <span className="text-[#666680] text-sm">Celebrate achievements with confetti</span>
                </div>
                <button
                  onClick={() => updateSetting("confettiEnabled", !localSettings.confettiEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    localSettings.confettiEnabled ? "bg-[#f472b6]" : "bg-[#3a3a4a]"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    localSettings.confettiEnabled ? "left-7" : "left-1"
                  }`} />
                </button>
              </label>

              {/* Streak Display */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#a78bfa]/20 to-[#f472b6]/20 border border-[#a78bfa]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white block text-lg">🔥 Document Streak</span>
                    <span className="text-[#a0a0a0] text-sm">Keep creating documents daily!</span>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text">0</div>
                    <div className="text-xs text-[#666680]">days</div>
                  </div>
                </div>
              </div>

              {/* Achievements Preview */}
              <div>
                <label className="block text-sm font-medium text-[#f0b866] mb-3">🏆 Recent Achievements</label>
                <div className="grid grid-cols-3 gap-2">
                  {["First Document", "Speed Writer", "Template Master"].map((badge) => (
                    <div key={badge} className="p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-center opacity-50">
                      <div className="text-2xl mb-1">🔒</div>
                      <div className="text-xs text-[#666680]">{badge}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Productivity Settings */}
          {activeTab === "productivity" && (
            <div className="space-y-6">
              {/* Focus Mode */}
              <label className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div>
                  <span className="text-white block">🎯 Focus Mode</span>
                  <span className="text-[#666680] text-sm">Hide all UI except the editor</span>
                </div>
                <button
                  onClick={() => updateSetting("focusMode", !localSettings.focusMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    localSettings.focusMode ? "bg-[#4ecdc4]" : "bg-[#3a3a4a]"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    localSettings.focusMode ? "left-7" : "left-1"
                  }`} />
                </button>
              </label>

              {/* Pomodoro Timer */}
              <div className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white block">🍅 Pomodoro Timer</span>
                    <span className="text-[#666680] text-sm">Stay focused with timed sessions</span>
                  </div>
                  <button
                    onClick={() => updateSetting("pomodoroEnabled", !localSettings.pomodoroEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      localSettings.pomodoroEnabled ? "bg-[#f87171]" : "bg-[#3a3a4a]"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      localSettings.pomodoroEnabled ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>
                {localSettings.pomodoroEnabled && (
                  <div className="flex items-center gap-3">
                    <label className="text-[#a0a0a0] text-sm">Duration:</label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={localSettings.pomodoroMinutes}
                      onChange={(e) => updateSetting("pomodoroMinutes", parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-white w-16 text-right">{localSettings.pomodoroMinutes} min</span>
                  </div>
                )}
              </div>

              {/* AI Suggestions */}
              <label className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div>
                  <span className="text-white block">✨ AI Writing Suggestions</span>
                  <span className="text-[#666680] text-sm">Get smart phrase suggestions (coming soon)</span>
                </div>
                <button
                  onClick={() => updateSetting("aiSuggestions", !localSettings.aiSuggestions)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    localSettings.aiSuggestions ? "bg-[#a78bfa]" : "bg-[#3a3a4a]"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    localSettings.aiSuggestions ? "left-7" : "left-1"
                  }`} />
                </button>
              </label>

              {/* Keyboard Shortcuts */}
              <div>
                <label className="block text-sm font-medium text-[#60a5fa] mb-3">⌨️ Keyboard Shortcuts</label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { keys: "Ctrl + S", action: "Save draft" },
                    { keys: "Ctrl + P", action: "Preview PDF" },
                    { keys: "Ctrl + Z", action: "Undo" },
                    { keys: "Ctrl + B", action: "Bold (in editor)" },
                    { keys: "Esc", action: "Close modal" },
                    { keys: "Tab", action: "Next field" },
                  ].map((shortcut) => (
                    <div key={shortcut.keys} className="flex items-center justify-between p-2 rounded bg-[#1a1a24] border border-[#2a2a3a]">
                      <kbd className="px-2 py-0.5 rounded bg-[#2a2a3a] text-[#a78bfa] text-xs">{shortcut.keys}</kbd>
                      <span className="text-[#a0a0a0]">{shortcut.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Document Settings */}
          {activeTab === "document" && (
            <div className="space-y-6">
              {/* Watermark */}
              <div className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white">💧 Watermark</span>
                  <button
                    onClick={() => updateSetting("watermarkEnabled", !localSettings.watermarkEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      localSettings.watermarkEnabled ? "bg-[#4ecdc4]" : "bg-[#3a3a4a]"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      localSettings.watermarkEnabled ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>
                {localSettings.watermarkEnabled && (
                  <div className="flex gap-2">
                    {["DRAFT", "CONFIDENTIAL", "COPY"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => updateSetting("watermark", preset)}
                        className={`px-3 py-1.5 rounded text-sm transition-colors ${
                          localSettings.watermark === preset
                            ? "bg-[#4ecdc4] text-[#0a0a12]"
                            : "bg-[#2a2a3a] text-[#a0a0a0] hover:bg-[#3a3a4a]"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                    <input
                      type="text"
                      value={localSettings.watermark}
                      onChange={(e) => updateSetting("watermark", e.target.value)}
                      placeholder="Custom..."
                      className="flex-1 px-3 py-1.5 rounded bg-[#2a2a3a] border border-[#3a3a4a] text-white text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Header/Footer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#a78bfa] mb-2">Header Text</label>
                  <input
                    type="text"
                    value={localSettings.headerText}
                    onChange={(e) => updateSetting("headerText", e.target.value)}
                    placeholder="Company Name"
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#a78bfa] mb-2">Footer Text</label>
                  <input
                    type="text"
                    value={localSettings.footerText}
                    onChange={(e) => updateSetting("footerText", e.target.value)}
                    placeholder="Page {page} of {pages}"
                    className="w-full px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
                  />
                </div>
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-sm font-medium text-[#f472b6] mb-2">📏 Page Size</label>
                <div className="flex gap-2">
                  {PAGE_SIZES.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => updateSetting("pageSize", size.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                        localSettings.pageSize === size.value
                          ? "bg-[#f472b6] text-white"
                          : "bg-[#1a1a24] border border-[#2a2a3a] text-[#a0a0a0] hover:border-[#f472b6]"
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div>
                <label className="block text-sm font-medium text-[#4ecdc4] mb-3">📐 Margins (inches)</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { key: "marginTop", label: "Top" },
                    { key: "marginBottom", label: "Bottom" },
                    { key: "marginLeft", label: "Left" },
                    { key: "marginRight", label: "Right" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs text-[#666680] block mb-1">{label}</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="2"
                        value={localSettings[key as keyof AppSettings] as number}
                        onChange={(e) => updateSetting(key as keyof AppSettings, parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Letterhead */}
              <div>
                <label className="block text-sm font-medium text-[#f0b866] mb-2">🏢 Letterhead</label>
                <div className="flex gap-3 items-center">
                  <input
                    ref={letterheadInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLetterheadUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => letterheadInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#f0b866] hover:border-[#f0b866] transition-colors"
                  >
                    Upload Image
                  </button>
                  {localSettings.letterheadUrl && (
                    <>
                      <img src={localSettings.letterheadUrl} alt="Letterhead preview" className="h-10 rounded" />
                      <button
                        onClick={() => updateSetting("letterheadUrl", "")}
                        className="text-[#f87171] hover:text-[#fca5a5]"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              {/* Locale */}
              <div>
                <label className="block text-sm font-medium text-[#60a5fa] mb-2">🌐 Language & Locale</label>
                <select
                  value={localSettings.locale}
                  onChange={(e) => updateSetting("locale", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white focus:border-[#60a5fa]"
                >
                  {LOCALE_OPTIONS.map((locale) => (
                    <option key={locale.value} value={locale.value}>
                      {locale.name} ({locale.dateFormat})
                    </option>
                  ))}
                </select>
              </div>

              {/* Version History */}
              <label className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div>
                  <span className="text-white block">📜 Version History</span>
                  <span className="text-[#666680] text-sm">Keep track of document changes</span>
                </div>
                <button
                  onClick={() => updateSetting("versionHistoryEnabled", !localSettings.versionHistoryEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    localSettings.versionHistoryEnabled ? "bg-[#4ecdc4]" : "bg-[#3a3a4a]"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    localSettings.versionHistoryEnabled ? "left-7" : "left-1"
                  }`} />
                </button>
              </label>

              {/* Offline Mode Indicator */}
              <div className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white block">📴 Offline Mode</span>
                    <span className="text-[#666680] text-sm">Work without internet connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${navigator.onLine ? "bg-[#4ade80]" : "bg-[#f87171]"}`} />
                    <span className="text-sm text-[#a0a0a0]">{navigator.onLine ? "Online" : "Offline"}</span>
                  </div>
                </div>
              </div>

              {/* Cloud Backup */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#60a5fa]/10 to-[#a78bfa]/10 border border-[#60a5fa]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white block">☁️ Cloud Backup</span>
                    <span className="text-[#666680] text-sm">Sync with Google Drive or Dropbox</span>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-[#60a5fa] text-white text-sm hover:bg-[#3b82f6] transition-colors">
                    Connect
                  </button>
                </div>
              </div>

              {/* Collaboration */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#f472b6]/10 to-[#f0b866]/10 border border-[#f472b6]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white block">👥 Collaboration</span>
                    <span className="text-[#666680] text-sm">Share documents with team members</span>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-[#f472b6] text-white text-sm hover:bg-[#ec4899] transition-colors">
                    Invite
                  </button>
                </div>
              </div>

              {/* Reset */}
              <div className="pt-4 border-t border-[#2a2a3a]">
                <button
                  onClick={() => {
                    setLocalSettings(DEFAULT_SETTINGS);
                    onSettingsChange(DEFAULT_SETTINGS);
                  }}
                  className="px-4 py-2 rounded-lg border border-[#f87171] text-[#f87171] hover:bg-[#f87171] hover:text-white transition-colors"
                >
                  Reset All Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_SETTINGS };

