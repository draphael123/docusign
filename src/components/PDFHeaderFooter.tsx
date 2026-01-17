"use client";

import { useState, useEffect } from "react";
import {
  X,
  FileText,
  Image,
  Calendar,
  Hash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";

export interface HeaderFooterConfig {
  header: {
    enabled: boolean;
    left: string;
    center: string;
    right: string;
    showLogo: boolean;
    logoUrl?: string;
    height: number;
  };
  footer: {
    enabled: boolean;
    left: string;
    center: string;
    right: string;
    showPageNumbers: boolean;
    pageNumberFormat: "simple" | "detailed";
    height: number;
  };
  margins: {
    top: number;
    bottom: number;
  };
}

export const DEFAULT_HEADER_FOOTER_CONFIG: HeaderFooterConfig = {
  header: {
    enabled: false,
    left: "",
    center: "",
    right: "",
    showLogo: false,
    logoUrl: undefined,
    height: 50,
  },
  footer: {
    enabled: true,
    left: "",
    center: "Page {page} of {pages}",
    right: "",
    showPageNumbers: true,
    pageNumberFormat: "simple",
    height: 40,
  },
  margins: {
    top: 20,
    bottom: 20,
  },
};

// Placeholder tokens
const TOKENS = [
  { token: "{date}", label: "Current Date", icon: <Calendar className="w-3.5 h-3.5" /> },
  { token: "{page}", label: "Page Number", icon: <Hash className="w-3.5 h-3.5" /> },
  { token: "{pages}", label: "Total Pages", icon: <Hash className="w-3.5 h-3.5" /> },
  { token: "{title}", label: "Document Title", icon: <FileText className="w-3.5 h-3.5" /> },
];

interface PDFHeaderFooterProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeaderFooterConfig;
  onChange: (config: HeaderFooterConfig) => void;
}

export default function PDFHeaderFooter({
  isOpen,
  onClose,
  config,
  onChange,
}: PDFHeaderFooterProps) {
  const [localConfig, setLocalConfig] = useState<HeaderFooterConfig>(config);
  const [activeSection, setActiveSection] = useState<"header" | "footer">("header");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  const updateHeader = (updates: Partial<HeaderFooterConfig["header"]>) => {
    setLocalConfig((prev) => ({
      ...prev,
      header: { ...prev.header, ...updates },
    }));
  };

  const updateFooter = (updates: Partial<HeaderFooterConfig["footer"]>) => {
    setLocalConfig((prev) => ({
      ...prev,
      footer: { ...prev.footer, ...updates },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 500000) {
      toast.error("Image must be less than 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      updateHeader({ logoUrl: event.target?.result as string, showLogo: true });
    };
    reader.readAsDataURL(file);
  };

  const insertToken = (token: string, field: "left" | "center" | "right") => {
    const section = activeSection === "header" ? localConfig.header : localConfig.footer;
    const currentValue = section[field];
    const updatedValue = currentValue ? `${currentValue} ${token}` : token;

    if (activeSection === "header") {
      updateHeader({ [field]: updatedValue });
    } else {
      updateFooter({ [field]: updatedValue });
    }
  };

  const handleSave = () => {
    onChange(localConfig);
    toast.success("Header/Footer settings saved");
    onClose();
  };

  if (!isOpen) return null;

  const currentSection = activeSection === "header" ? localConfig.header : localConfig.footer;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[--color-primary]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[--color-primary]" />
              </div>
              <div>
                <h2 className="text-lg font-bold">PDF Header & Footer</h2>
                <p className="text-sm text-[--text-muted]">Customize document headers and footers</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[--bg-elevated] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveSection("header")}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
                activeSection === "header"
                  ? "bg-[--color-primary] text-white"
                  : "bg-[--bg-elevated] hover:bg-[--bg-overlay]"
              }`}
            >
              Header
            </button>
            <button
              onClick={() => setActiveSection("footer")}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
                activeSection === "footer"
                  ? "bg-[--color-primary] text-white"
                  : "bg-[--bg-elevated] hover:bg-[--bg-overlay]"
              }`}
            >
              Footer
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
            <div>
              <div className="font-medium">Enable {activeSection === "header" ? "Header" : "Footer"}</div>
              <div className="text-sm text-[--text-muted]">
                Show on every page of the document
              </div>
            </div>
            <button
              onClick={() => {
                if (activeSection === "header") {
                  updateHeader({ enabled: !localConfig.header.enabled });
                } else {
                  updateFooter({ enabled: !localConfig.footer.enabled });
                }
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                currentSection.enabled ? "bg-[--color-primary]" : "bg-[--bg-overlay]"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  currentSection.enabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          {currentSection.enabled && (
            <>
              {/* Logo Upload (Header only) */}
              {activeSection === "header" && (
                <div className="p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Logo
                    </div>
                    <button
                      onClick={() => updateHeader({ showLogo: !localConfig.header.showLogo })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        localConfig.header.showLogo ? "bg-[--color-primary]" : "bg-[--bg-overlay]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          localConfig.header.showLogo ? "left-7" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  {localConfig.header.showLogo && (
                    <div className="flex items-center gap-3">
                      {localConfig.header.logoUrl ? (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={localConfig.header.logoUrl}
                            alt="Logo preview"
                            className="h-12 object-contain rounded-lg border border-[--border-default]"
                          />
                          <button
                            onClick={() => updateHeader({ logoUrl: undefined })}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[--bg-overlay] border border-dashed border-[--border-default] cursor-pointer hover:border-[--color-primary] transition-colors">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">Upload Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Content Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Content</h3>
                  <div className="flex gap-1">
                    {TOKENS.map((t) => (
                      <button
                        key={t.token}
                        onClick={() => insertToken(t.token, "center")}
                        className="px-2 py-1 rounded-lg bg-[--bg-overlay] text-xs flex items-center gap-1 hover:bg-[--border-default] transition-colors"
                        title={`Insert ${t.label}`}
                      >
                        {t.icon}
                        {t.token}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-[--text-muted] mb-1.5 flex items-center gap-1">
                      <AlignLeft className="w-3.5 h-3.5" />
                      Left
                    </label>
                    <input
                      type="text"
                      value={currentSection.left}
                      onChange={(e) => {
                        if (activeSection === "header") {
                          updateHeader({ left: e.target.value });
                        } else {
                          updateFooter({ left: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[--bg-surface] border border-[--border-default] text-sm"
                      placeholder="Left content..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-muted] mb-1.5 flex items-center gap-1">
                      <AlignCenter className="w-3.5 h-3.5" />
                      Center
                    </label>
                    <input
                      type="text"
                      value={currentSection.center}
                      onChange={(e) => {
                        if (activeSection === "header") {
                          updateHeader({ center: e.target.value });
                        } else {
                          updateFooter({ center: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[--bg-surface] border border-[--border-default] text-sm"
                      placeholder="Center content..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--text-muted] mb-1.5 flex items-center gap-1">
                      <AlignRight className="w-3.5 h-3.5" />
                      Right
                    </label>
                    <input
                      type="text"
                      value={currentSection.right}
                      onChange={(e) => {
                        if (activeSection === "header") {
                          updateHeader({ right: e.target.value });
                        } else {
                          updateFooter({ right: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-[--bg-surface] border border-[--border-default] text-sm"
                      placeholder="Right content..."
                    />
                  </div>
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm text-[--text-muted] mb-2">
                  Height: {currentSection.height}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={currentSection.height}
                  onChange={(e) => {
                    if (activeSection === "header") {
                      updateHeader({ height: Number(e.target.value) });
                    } else {
                      updateFooter({ height: Number(e.target.value) });
                    }
                  }}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Preview */}
          <div className="p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 text-black text-xs">
              {/* Header Preview */}
              {localConfig.header.enabled && (
                <div
                  className="border-b border-gray-200 pb-2 mb-4 flex items-center justify-between"
                  style={{ minHeight: `${localConfig.header.height / 2}px` }}
                >
                  <div>{localConfig.header.left || <span className="text-gray-300">Left</span>}</div>
                  <div>{localConfig.header.center || <span className="text-gray-300">Center</span>}</div>
                  <div>{localConfig.header.right || <span className="text-gray-300">Right</span>}</div>
                </div>
              )}
              
              {/* Document Body Placeholder */}
              <div className="h-20 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded">
                Document Content
              </div>

              {/* Footer Preview */}
              {localConfig.footer.enabled && (
                <div
                  className="border-t border-gray-200 pt-2 mt-4 flex items-center justify-between"
                  style={{ minHeight: `${localConfig.footer.height / 2}px` }}
                >
                  <div>{localConfig.footer.left || <span className="text-gray-300">Left</span>}</div>
                  <div>{localConfig.footer.center || <span className="text-gray-300">Page 1 of 1</span>}</div>
                  <div>{localConfig.footer.right || <span className="text-gray-300">Right</span>}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[--border-default] flex gap-3">
          <button
            onClick={() => setLocalConfig(DEFAULT_HEADER_FOOTER_CONFIG)}
            className="px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] font-medium hover:bg-[--bg-overlay] transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] font-medium hover:bg-[--bg-overlay] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-[--color-primary] text-white font-semibold hover:bg-[--color-primary-hover] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

