"use client";

import { useState, useEffect } from "react";

interface ExpirationSettings {
  enabled: boolean;
  defaultDays: number;
  showWarning: boolean;
  warningDays: number;
}

const DEFAULT_EXPIRATION_SETTINGS: ExpirationSettings = {
  enabled: false,
  defaultDays: 30,
  showWarning: true,
  warningDays: 7,
};

interface DocumentWithExpiration {
  id: string;
  name: string;
  createdAt: string;
  expiresAt: string;
  status: "active" | "warning" | "expired";
}

export function useDocumentExpiration() {
  const [settings, setSettings] = useState<ExpirationSettings>(DEFAULT_EXPIRATION_SETTINGS);
  const [documents, setDocuments] = useState<DocumentWithExpiration[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedSettings = localStorage.getItem("expirationSettings");
    const savedDocs = localStorage.getItem("expiringDocuments");
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Error loading expiration settings:", e);
      }
    }
    
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs));
      } catch (e) {
        console.error("Error loading expiring documents:", e);
      }
    }
  }, []);

  const saveSettings = (newSettings: ExpirationSettings) => {
    setSettings(newSettings);
    localStorage.setItem("expirationSettings", JSON.stringify(newSettings));
  };

  const addDocument = (name: string, expirationDays?: number) => {
    const days = expirationDays || settings.defaultDays;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    const newDoc: DocumentWithExpiration = {
      id: `doc-${Date.now()}`,
      name,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: "active",
    };
    
    const updated = [...documents, newDoc];
    setDocuments(updated);
    localStorage.setItem("expiringDocuments", JSON.stringify(updated));
    
    return newDoc;
  };

  const updateDocumentStatus = () => {
    const now = new Date();
    const warningDate = new Date(now.getTime() + settings.warningDays * 24 * 60 * 60 * 1000);
    
    const updated = documents.map(doc => {
      const expires = new Date(doc.expiresAt);
      if (expires < now) {
        return { ...doc, status: "expired" as const };
      } else if (expires < warningDate) {
        return { ...doc, status: "warning" as const };
      }
      return { ...doc, status: "active" as const };
    });
    
    setDocuments(updated);
    localStorage.setItem("expiringDocuments", JSON.stringify(updated));
  };

  const removeDocument = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    localStorage.setItem("expiringDocuments", JSON.stringify(updated));
  };

  const extendExpiration = (id: string, additionalDays: number) => {
    const updated = documents.map(doc => {
      if (doc.id === id) {
        const newExpiry = new Date(new Date(doc.expiresAt).getTime() + additionalDays * 24 * 60 * 60 * 1000);
        return { ...doc, expiresAt: newExpiry.toISOString(), status: "active" as const };
      }
      return doc;
    });
    
    setDocuments(updated);
    localStorage.setItem("expiringDocuments", JSON.stringify(updated));
  };

  return { 
    settings, 
    saveSettings, 
    documents, 
    addDocument, 
    updateDocumentStatus, 
    removeDocument, 
    extendExpiration,
    mounted 
  };
}

interface DocumentExpirationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentExpiration({ isOpen, onClose }: DocumentExpirationProps) {
  const { settings, saveSettings, documents, removeDocument, extendExpiration, updateDocumentStatus } = useDocumentExpiration();
  const [activeTab, setActiveTab] = useState<"settings" | "documents">("documents");

  useEffect(() => {
    if (isOpen) {
      updateDocumentStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString();
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const activeDocuments = documents.filter(d => d.status === "active");
  const warningDocuments = documents.filter(d => d.status === "warning");
  const expiredDocuments = documents.filter(d => d.status === "expired");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">⏳ Document Expiration</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a3a]">
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 py-3 text-sm transition-colors ${
              activeTab === "documents"
                ? "text-[#a78bfa] border-b-2 border-[#a78bfa]"
                : "text-[#666680] hover:text-white"
            }`}
          >
            Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 text-sm transition-colors ${
              activeTab === "settings"
                ? "text-[#a78bfa] border-b-2 border-[#a78bfa]"
                : "text-[#666680] hover:text-white"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "documents" ? (
            <div className="space-y-6">
              {/* Warning Banner */}
              {warningDocuments.length > 0 && (
                <div className="p-4 rounded-lg bg-[#f0b866]/10 border border-[#f0b866]/30">
                  <p className="text-[#f0b866] font-medium">
                    ⚠️ {warningDocuments.length} document{warningDocuments.length !== 1 ? "s" : ""} expiring soon
                  </p>
                </div>
              )}

              {/* Expired */}
              {expiredDocuments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#f87171] mb-3">Expired ({expiredDocuments.length})</h3>
                  <div className="space-y-2">
                    {expiredDocuments.map(doc => (
                      <div key={doc.id} className="p-3 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 flex items-center justify-between">
                        <div>
                          <p className="text-white">{doc.name}</p>
                          <p className="text-xs text-[#f87171]">Expired {formatDate(doc.expiresAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => extendExpiration(doc.id, 30)}
                            className="px-3 py-1 rounded text-sm bg-[#4ecdc4] text-[#0a0a12]"
                          >
                            Extend 30d
                          </button>
                          <button
                            onClick={() => removeDocument(doc.id)}
                            className="px-3 py-1 rounded text-sm text-[#f87171] hover:bg-[#f87171]/10"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning */}
              {warningDocuments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#f0b866] mb-3">Expiring Soon ({warningDocuments.length})</h3>
                  <div className="space-y-2">
                    {warningDocuments.map(doc => (
                      <div key={doc.id} className="p-3 rounded-lg bg-[#f0b866]/10 border border-[#f0b866]/30 flex items-center justify-between">
                        <div>
                          <p className="text-white">{doc.name}</p>
                          <p className="text-xs text-[#f0b866]">{getDaysRemaining(doc.expiresAt)} days remaining</p>
                        </div>
                        <button
                          onClick={() => extendExpiration(doc.id, 30)}
                          className="px-3 py-1 rounded text-sm bg-[#4ecdc4] text-[#0a0a12]"
                        >
                          Extend 30d
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active */}
              {activeDocuments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[#4ade80] mb-3">Active ({activeDocuments.length})</h3>
                  <div className="space-y-2">
                    {activeDocuments.map(doc => (
                      <div key={doc.id} className="p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-between">
                        <div>
                          <p className="text-white">{doc.name}</p>
                          <p className="text-xs text-[#666680]">Expires {formatDate(doc.expiresAt)} ({getDaysRemaining(doc.expiresAt)} days)</p>
                        </div>
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="text-[#666680] hover:text-[#f87171]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {documents.length === 0 && (
                <div className="text-center py-12 text-[#666680]">
                  <p>No documents with expiration tracking.</p>
                  <p className="text-sm mt-2">Enable expiration in settings and generate new documents.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enable/Disable */}
              <label className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div>
                  <p className="text-white font-medium">Enable Document Expiration</p>
                  <p className="text-sm text-[#666680]">Track when documents should be reviewed or renewed</p>
                </div>
                <button
                  onClick={() => saveSettings({ ...settings, enabled: !settings.enabled })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.enabled ? "bg-[#4ade80]" : "bg-[#2a2a3a]"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.enabled ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </label>

              {/* Default Days */}
              <div>
                <label className="block text-sm text-[#a0a0a0] mb-2">Default Expiration (days)</label>
                <input
                  type="number"
                  value={settings.defaultDays}
                  onChange={(e) => saveSettings({ ...settings, defaultDays: parseInt(e.target.value) || 30 })}
                  min={1}
                  max={365}
                  className="w-full px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
                />
              </div>

              {/* Warning Settings */}
              <label className="flex items-center justify-between p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div>
                  <p className="text-white font-medium">Show Warning</p>
                  <p className="text-sm text-[#666680]">Alert before documents expire</p>
                </div>
                <button
                  onClick={() => saveSettings({ ...settings, showWarning: !settings.showWarning })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showWarning ? "bg-[#f0b866]" : "bg-[#2a2a3a]"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.showWarning ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </label>

              {settings.showWarning && (
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Warning Days Before Expiration</label>
                  <input
                    type="number"
                    value={settings.warningDays}
                    onChange={(e) => saveSettings({ ...settings, warningDays: parseInt(e.target.value) || 7 })}
                    min={1}
                    max={30}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

