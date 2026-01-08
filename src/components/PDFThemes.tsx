"use client";

import { useState, useEffect } from "react";

export interface PDFTheme {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  headerStyle: "classic" | "modern" | "minimal" | "bold";
  accentColor: string;
  paperStyle: "white" | "cream" | "blue-tint";
}

const PRESET_THEMES: PDFTheme[] = [
  {
    id: "classic",
    name: "Classic",
    fontFamily: "Times New Roman",
    fontSize: 12,
    lineHeight: 1.5,
    headerStyle: "classic",
    accentColor: "#1a1a1a",
    paperStyle: "white",
  },
  {
    id: "modern",
    name: "Modern",
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
    headerStyle: "modern",
    accentColor: "#3b82f6",
    paperStyle: "white",
  },
  {
    id: "elegant",
    name: "Elegant",
    fontFamily: "Georgia",
    fontSize: 11,
    lineHeight: 1.7,
    headerStyle: "minimal",
    accentColor: "#6b7280",
    paperStyle: "cream",
  },
  {
    id: "professional",
    name: "Professional",
    fontFamily: "Arial",
    fontSize: 11,
    lineHeight: 1.5,
    headerStyle: "bold",
    accentColor: "#1e40af",
    paperStyle: "white",
  },
  {
    id: "creative",
    name: "Creative",
    fontFamily: "Verdana",
    fontSize: 10,
    lineHeight: 1.6,
    headerStyle: "modern",
    accentColor: "#8b5cf6",
    paperStyle: "blue-tint",
  },
  {
    id: "legal",
    name: "Legal",
    fontFamily: "Times New Roman",
    fontSize: 12,
    lineHeight: 2.0,
    headerStyle: "classic",
    accentColor: "#1a1a1a",
    paperStyle: "white",
  },
];

interface PDFThemesProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTheme: PDFTheme;
  onThemeChange: (theme: PDFTheme) => void;
}

export function usePDFThemes() {
  const [selectedTheme, setSelectedTheme] = useState<PDFTheme>(PRESET_THEMES[0]);
  const [customThemes, setCustomThemes] = useState<PDFTheme[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("selectedPDFTheme");
    const savedCustom = localStorage.getItem("customPDFThemes");
    
    if (savedTheme) {
      try {
        setSelectedTheme(JSON.parse(savedTheme));
      } catch (e) {
        console.error("Error loading theme:", e);
      }
    }
    
    if (savedCustom) {
      try {
        setCustomThemes(JSON.parse(savedCustom));
      } catch (e) {
        console.error("Error loading custom themes:", e);
      }
    }
  }, []);

  const selectTheme = (theme: PDFTheme) => {
    setSelectedTheme(theme);
    localStorage.setItem("selectedPDFTheme", JSON.stringify(theme));
  };

  const saveCustomTheme = (theme: PDFTheme) => {
    const updated = [...customThemes, { ...theme, id: `custom-${Date.now()}` }];
    setCustomThemes(updated);
    localStorage.setItem("customPDFThemes", JSON.stringify(updated));
  };

  const deleteCustomTheme = (id: string) => {
    const updated = customThemes.filter(t => t.id !== id);
    setCustomThemes(updated);
    localStorage.setItem("customPDFThemes", JSON.stringify(updated));
  };

  return { selectedTheme, selectTheme, customThemes, saveCustomTheme, deleteCustomTheme, allThemes: [...PRESET_THEMES, ...customThemes], mounted };
}

export default function PDFThemes({ isOpen, onClose, selectedTheme, onThemeChange }: PDFThemesProps) {
  const { allThemes, saveCustomTheme, deleteCustomTheme } = usePDFThemes();
  const [showCustomize, setShowCustomize] = useState(false);
  const [customTheme, setCustomTheme] = useState<PDFTheme>(selectedTheme);

  if (!isOpen) return null;

  const handleSaveCustom = () => {
    const theme = { ...customTheme, id: `custom-${Date.now()}`, name: customTheme.name || "Custom Theme" };
    saveCustomTheme(theme);
    onThemeChange(theme);
    setShowCustomize(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">🎨 PDF Themes</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="px-3 py-1.5 rounded-lg text-sm text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-colors"
            >
              {showCustomize ? "View Themes" : "Customize"}
            </button>
            <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {showCustomize ? (
            /* Custom Theme Editor */
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-[#a0a0a0] mb-2">Theme Name</label>
                <input
                  type="text"
                  value={customTheme.name}
                  onChange={(e) => setCustomTheme({ ...customTheme, name: e.target.value })}
                  placeholder="My Custom Theme"
                  className="w-full px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Font Family</label>
                  <select
                    value={customTheme.fontFamily}
                    onChange={(e) => setCustomTheme({ ...customTheme, fontFamily: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
                  >
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Font Size: {customTheme.fontSize}pt</label>
                  <input
                    type="range"
                    min="9"
                    max="14"
                    value={customTheme.fontSize}
                    onChange={(e) => setCustomTheme({ ...customTheme, fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Line Height: {customTheme.lineHeight.toFixed(1)}</label>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.1"
                    value={customTheme.lineHeight}
                    onChange={(e) => setCustomTheme({ ...customTheme, lineHeight: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Header Style</label>
                  <select
                    value={customTheme.headerStyle}
                    onChange={(e) => setCustomTheme({ ...customTheme, headerStyle: e.target.value as PDFTheme["headerStyle"] })}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
                  >
                    <option value="classic">Classic</option>
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Accent Color</label>
                  <input
                    type="color"
                    value={customTheme.accentColor}
                    onChange={(e) => setCustomTheme({ ...customTheme, accentColor: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Paper Style</label>
                  <select
                    value={customTheme.paperStyle}
                    onChange={(e) => setCustomTheme({ ...customTheme, paperStyle: e.target.value as PDFTheme["paperStyle"] })}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
                  >
                    <option value="white">White</option>
                    <option value="cream">Cream</option>
                    <option value="blue-tint">Blue Tint</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveCustom}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white hover:opacity-90"
              >
                Save Custom Theme
              </button>
            </div>
          ) : (
            /* Theme Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allThemes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTheme.id === theme.id
                      ? "border-[#a78bfa] bg-[#a78bfa]/10"
                      : "border-[#2a2a3a] hover:border-[#3a3a4a]"
                  }`}
                >
                  {/* Preview */}
                  <div 
                    className="mb-3 p-3 rounded-lg text-xs"
                    style={{ 
                      backgroundColor: theme.paperStyle === "cream" ? "#f5f5dc" : theme.paperStyle === "blue-tint" ? "#f0f8ff" : "#fff",
                      fontFamily: theme.fontFamily,
                      color: "#1a1a1a",
                      lineHeight: theme.lineHeight,
                    }}
                  >
                    <div className="font-bold mb-1" style={{ color: theme.accentColor }}>Sample Header</div>
                    <div style={{ fontSize: `${theme.fontSize * 0.6}px` }}>Lorem ipsum dolor sit amet...</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{theme.name}</span>
                    {theme.id.startsWith("custom-") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomTheme(theme.id);
                        }}
                        className="text-[#f87171] hover:text-[#fca5a5] text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-[#666680] mt-1">
                    {theme.fontFamily} • {theme.fontSize}pt
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { PRESET_THEMES };

