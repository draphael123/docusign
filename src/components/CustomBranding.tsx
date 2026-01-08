"use client";

import { useState, useEffect, useRef } from "react";

export interface BrandingSettings {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  headerText: string;
  footerText: string;
  showLogo: boolean;
  logoPosition: "left" | "center" | "right";
}

const DEFAULT_BRANDING: BrandingSettings = {
  companyName: "",
  logoUrl: "",
  primaryColor: "#a78bfa",
  headerText: "",
  footerText: "Page {page}",
  showLogo: false,
  logoPosition: "left",
};

interface CustomBrandingProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingSettings;
  onBrandingChange: (branding: BrandingSettings) => void;
}

export function useBranding() {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("brandingSettings");
    if (saved) {
      try {
        setBranding({ ...DEFAULT_BRANDING, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Error loading branding:", e);
      }
    }
  }, []);

  const saveBranding = (newBranding: BrandingSettings) => {
    setBranding(newBranding);
    localStorage.setItem("brandingSettings", JSON.stringify(newBranding));
  };

  return { branding, saveBranding, mounted };
}

export default function CustomBranding({ isOpen, onClose, branding, onBrandingChange }: CustomBrandingProps) {
  const [localBranding, setLocalBranding] = useState<BrandingSettings>(branding);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalBranding(branding);
  }, [branding]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateBranding("logoUrl", event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBranding = <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) => {
    const updated = { ...localBranding, [key]: value };
    setLocalBranding(updated);
    onBrandingChange(updated);
  };

  const resetBranding = () => {
    setLocalBranding(DEFAULT_BRANDING);
    onBrandingChange(DEFAULT_BRANDING);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">🎨 Custom Branding</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-[#a78bfa] mb-2">Company Name</label>
            <input
              type="text"
              value={localBranding.companyName}
              onChange={(e) => updateBranding("companyName", e.target.value)}
              placeholder="Your Company"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white focus:border-[#a78bfa]"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-[#4ecdc4] mb-2">Company Logo</label>
            <div className="flex gap-4 items-start">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#4ecdc4] hover:border-[#4ecdc4] transition-colors"
              >
                Upload Logo
              </button>
              {localBranding.logoUrl && (
                <div className="flex items-center gap-3">
                  <img src={localBranding.logoUrl} alt="Logo preview" className="h-12 rounded" />
                  <button
                    onClick={() => updateBranding("logoUrl", "")}
                    className="text-[#f87171] hover:text-[#fca5a5] text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {localBranding.logoUrl && (
              <div className="mt-3 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localBranding.showLogo}
                    onChange={(e) => updateBranding("showLogo", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-[#a0a0a0]">Show logo in PDF</span>
                </label>

                <select
                  value={localBranding.logoPosition}
                  onChange={(e) => updateBranding("logoPosition", e.target.value as "left" | "center" | "right")}
                  className="px-3 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}
          </div>

          {/* Brand Color */}
          <div>
            <label className="block text-sm font-medium text-[#f472b6] mb-2">Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={localBranding.primaryColor}
                onChange={(e) => updateBranding("primaryColor", e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-[#2a2a3a]"
              />
              <input
                type="text"
                value={localBranding.primaryColor}
                onChange={(e) => updateBranding("primaryColor", e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white font-mono"
                placeholder="#a78bfa"
              />
            </div>
          </div>

          {/* Header Text */}
          <div>
            <label className="block text-sm font-medium text-[#f0b866] mb-2">Header Text</label>
            <input
              type="text"
              value={localBranding.headerText}
              onChange={(e) => updateBranding("headerText", e.target.value)}
              placeholder="Appears at the top of each page"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white focus:border-[#f0b866]"
            />
          </div>

          {/* Footer Text */}
          <div>
            <label className="block text-sm font-medium text-[#60a5fa] mb-2">Footer Text</label>
            <input
              type="text"
              value={localBranding.footerText}
              onChange={(e) => updateBranding("footerText", e.target.value)}
              placeholder="Use {page} for page number"
              className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white focus:border-[#60a5fa]"
            />
            <p className="mt-1 text-xs text-[#666680]">Use {"{page}"} for page number, {"{date}"} for current date</p>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-[#a0a0a0] mb-2">Preview</label>
            <div className="p-6 rounded-lg bg-white text-black">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: localBranding.primaryColor }}>
                {localBranding.showLogo && localBranding.logoUrl && (
                  <img 
                    src={localBranding.logoUrl} 
                    alt="Logo" 
                    className="h-8"
                    style={{ 
                      marginLeft: localBranding.logoPosition === "center" ? "auto" : localBranding.logoPosition === "right" ? "auto" : 0,
                      marginRight: localBranding.logoPosition === "center" ? "auto" : localBranding.logoPosition === "left" ? "auto" : 0,
                    }}
                  />
                )}
                {localBranding.headerText && (
                  <span style={{ color: localBranding.primaryColor }}>{localBranding.headerText}</span>
                )}
              </div>
              
              {/* Body placeholder */}
              <div className="h-24 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400">
                Document content...
              </div>

              {/* Footer */}
              {localBranding.footerText && (
                <div className="text-center text-sm text-gray-500 border-t pt-3" style={{ borderColor: localBranding.primaryColor }}>
                  {localBranding.footerText.replace("{page}", "1").replace("{date}", new Date().toLocaleDateString())}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#2a2a3a]">
          <button onClick={resetBranding} className="text-sm text-[#f87171] hover:text-[#fca5a5]">
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_BRANDING };

