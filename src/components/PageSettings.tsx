"use client";

import { useState } from "react";

export interface PageConfig {
  pageBreaks: boolean;
  showPageNumbers: boolean;
  pageNumberPosition: "bottom-center" | "bottom-right" | "top-right";
  headerText: string;
  footerText: string;
  showHeader: boolean;
  showFooter: boolean;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  pageBreaks: true,
  showPageNumbers: true,
  pageNumberPosition: "bottom-center",
  headerText: "",
  footerText: "",
  showHeader: false,
  showFooter: false,
  margins: { top: 1, bottom: 1, left: 1, right: 1 },
};

interface PageSettingsProps {
  config: PageConfig;
  onChange: (config: PageConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function PageSettings({ config, onChange, isOpen, onClose }: PageSettingsProps) {
  const [localConfig, setLocalConfig] = useState<PageConfig>(config);

  const handleSave = () => {
    onChange(localConfig);
    onClose();
  };

  const updateConfig = (updates: Partial<PageConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
  };

  const updateMargins = (key: keyof PageConfig["margins"], value: number) => {
    setLocalConfig(prev => ({
      ...prev,
      margins: { ...prev.margins, [key]: value }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-2xl w-full max-w-md">
        <div className="p-5 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[--text-primary]">Page Settings</h2>
            <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">✕</button>
          </div>
        </div>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Page Numbers */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localConfig.showPageNumbers}
                onChange={(e) => updateConfig({ showPageNumbers: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-[--text-primary]">Show page numbers</span>
            </label>
            {localConfig.showPageNumbers && (
              <select
                value={localConfig.pageNumberPosition}
                onChange={(e) => updateConfig({ pageNumberPosition: e.target.value as PageConfig["pageNumberPosition"] })}
                className="mt-2 w-full px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
              >
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="top-right">Top Right</option>
              </select>
            )}
          </div>

          {/* Header */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={localConfig.showHeader}
                onChange={(e) => updateConfig({ showHeader: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-[--text-primary]">Show header on each page</span>
            </label>
            {localConfig.showHeader && (
              <input
                type="text"
                value={localConfig.headerText}
                onChange={(e) => updateConfig({ headerText: e.target.value })}
                placeholder="Header text..."
                className="w-full px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
              />
            )}
          </div>

          {/* Footer */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={localConfig.showFooter}
                onChange={(e) => updateConfig({ showFooter: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-[--text-primary]">Show footer on each page</span>
            </label>
            {localConfig.showFooter && (
              <input
                type="text"
                value={localConfig.footerText}
                onChange={(e) => updateConfig({ footerText: e.target.value })}
                placeholder="Footer text..."
                className="w-full px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
              />
            )}
          </div>

          {/* Margins */}
          <div>
            <h3 className="text-sm font-medium text-[--text-secondary] mb-3">Margins (inches)</h3>
            <div className="grid grid-cols-2 gap-3">
              {(["top", "bottom", "left", "right"] as const).map((side) => (
                <div key={side}>
                  <label className="block text-xs text-[--text-muted] mb-1 capitalize">{side}</label>
                  <input
                    type="number"
                    min="0.25"
                    max="2"
                    step="0.25"
                    value={localConfig.margins[side]}
                    onChange={(e) => updateMargins(side, parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Page Break Hint */}
          <div className="p-3 rounded-lg bg-[--bg-elevated] border border-[--border-default]">
            <p className="text-sm text-[--text-secondary]">
              <strong>Tip:</strong> Type <code className="px-1.5 py-0.5 bg-[--bg-overlay] rounded text-xs">---pagebreak---</code> in your document to insert a manual page break.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-[--border-default] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:bg-[--bg-overlay]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[--color-primary] text-white hover:opacity-90"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

