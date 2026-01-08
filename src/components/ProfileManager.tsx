"use client";

import { useState, useEffect } from "react";

export interface SenderProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  isDefault: boolean;
}

export interface RecipientProfile {
  id: string;
  name: string;
  title: string;
  address: string;
  company: string;
}

interface ProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSender: (profile: SenderProfile) => void;
  onSelectRecipient: (profile: RecipientProfile) => void;
}

export function useProfiles() {
  const [senderProfiles, setSenderProfiles] = useState<SenderProfile[]>([]);
  const [recipientProfiles, setRecipientProfiles] = useState<RecipientProfile[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedSenders = localStorage.getItem("senderProfiles");
    const savedRecipients = localStorage.getItem("recipientProfiles");
    
    if (savedSenders) {
      try {
        setSenderProfiles(JSON.parse(savedSenders));
      } catch (e) {
        console.error("Error loading sender profiles:", e);
      }
    }
    
    if (savedRecipients) {
      try {
        setRecipientProfiles(JSON.parse(savedRecipients));
      } catch (e) {
        console.error("Error loading recipient profiles:", e);
      }
    }
  }, []);

  const saveSenderProfile = (profile: Omit<SenderProfile, "id">) => {
    const newProfile = { ...profile, id: `sender-${Date.now()}` };
    const updated = [...senderProfiles, newProfile];
    setSenderProfiles(updated);
    localStorage.setItem("senderProfiles", JSON.stringify(updated));
    return newProfile;
  };

  const saveRecipientProfile = (profile: Omit<RecipientProfile, "id">) => {
    const newProfile = { ...profile, id: `recipient-${Date.now()}` };
    const updated = [...recipientProfiles, newProfile];
    setRecipientProfiles(updated);
    localStorage.setItem("recipientProfiles", JSON.stringify(updated));
    return newProfile;
  };

  const deleteSenderProfile = (id: string) => {
    const updated = senderProfiles.filter((p) => p.id !== id);
    setSenderProfiles(updated);
    localStorage.setItem("senderProfiles", JSON.stringify(updated));
  };

  const deleteRecipientProfile = (id: string) => {
    const updated = recipientProfiles.filter((p) => p.id !== id);
    setRecipientProfiles(updated);
    localStorage.setItem("recipientProfiles", JSON.stringify(updated));
  };

  const setDefaultSender = (id: string) => {
    const updated = senderProfiles.map((p) => ({ ...p, isDefault: p.id === id }));
    setSenderProfiles(updated);
    localStorage.setItem("senderProfiles", JSON.stringify(updated));
  };

  const getDefaultSender = () => senderProfiles.find((p) => p.isDefault);

  return {
    senderProfiles,
    recipientProfiles,
    saveSenderProfile,
    saveRecipientProfile,
    deleteSenderProfile,
    deleteRecipientProfile,
    setDefaultSender,
    getDefaultSender,
    mounted,
  };
}

export default function ProfileManager({ isOpen, onClose, onSelectSender, onSelectRecipient }: ProfileManagerProps) {
  const { senderProfiles, recipientProfiles, saveSenderProfile, saveRecipientProfile, deleteSenderProfile, deleteRecipientProfile, setDefaultSender } = useProfiles();
  const [activeTab, setActiveTab] = useState<"sender" | "recipient">("sender");
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    company: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (activeTab === "sender") {
      saveSenderProfile({
        name: formData.name,
        title: formData.title,
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
        isDefault: senderProfiles.length === 0,
      });
    } else {
      saveRecipientProfile({
        name: formData.name,
        title: formData.title,
        company: formData.company,
        address: formData.address,
      });
    }
    
    setFormData({ name: "", title: "", company: "", phone: "", email: "", address: "" });
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-[#2a2a3a] shadow-2xl shadow-[#a78bfa]/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">Profiles</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white transition-colors text-2xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 border-b border-[#2a2a3a]">
          <button
            onClick={() => { setActiveTab("sender"); setShowForm(false); }}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === "sender"
                ? "bg-[#a78bfa] text-white"
                : "text-[#666680] hover:text-white hover:bg-[#1a1a24]"
            }`}
          >
            👤 Sender Profiles
          </button>
          <button
            onClick={() => { setActiveTab("recipient"); setShowForm(false); }}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === "recipient"
                ? "bg-[#4ecdc4] text-white"
                : "text-[#666680] hover:text-white hover:bg-[#1a1a24]"
            }`}
          >
            📬 Recipient Profiles
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white"
          >
            + Add New
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {showForm ? (
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-white mb-4">New {activeTab === "sender" ? "Sender" : "Recipient"} Profile</h3>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name *"
                className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
              />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title"
                className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
              />
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company"
                className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
              />
              {activeTab === "sender" ? (
                <>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white"
                  />
                </>
              ) : (
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Address"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white resize-none"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white"
                >
                  Save Profile
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#2a2a3a] text-[#a0a0a0]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {activeTab === "sender" ? (
                senderProfiles.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-[#666680]">
                    No sender profiles yet. Create one to auto-fill your details!
                  </div>
                ) : (
                  senderProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={`p-4 rounded-xl border transition-all ${
                        profile.isDefault
                          ? "bg-[#a78bfa]/10 border-[#a78bfa]/30"
                          : "bg-[#1a1a24] border-[#2a2a3a] hover:border-[#3a3a4a]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-white font-medium">{profile.name}</div>
                          <div className="text-sm text-[#666680]">{profile.title}</div>
                        </div>
                        {profile.isDefault && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#a78bfa] text-white">Default</span>
                        )}
                      </div>
                      <div className="text-xs text-[#666680] mb-3">
                        {profile.company && <div>{profile.company}</div>}
                        {profile.email && <div>{profile.email}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onSelectSender(profile);
                            onClose();
                          }}
                          className="flex-1 px-3 py-1.5 rounded text-xs bg-[#a78bfa] text-white hover:bg-[#9575f0]"
                        >
                          Use
                        </button>
                        {!profile.isDefault && (
                          <button
                            onClick={() => setDefaultSender(profile.id)}
                            className="px-3 py-1.5 rounded text-xs bg-[#2a2a3a] text-[#a0a0a0] hover:bg-[#3a3a4a]"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => deleteSenderProfile(profile.id)}
                          className="px-3 py-1.5 rounded text-xs text-[#f87171] hover:bg-[#f87171]/10"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                recipientProfiles.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-[#666680]">
                    No recipient profiles yet. Save frequent recipients for quick access!
                  </div>
                ) : (
                  recipientProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="p-4 rounded-xl bg-[#1a1a24] border border-[#2a2a3a] hover:border-[#3a3a4a] transition-all"
                    >
                      <div className="mb-2">
                        <div className="text-white font-medium">{profile.name}</div>
                        <div className="text-sm text-[#666680]">{profile.title}</div>
                      </div>
                      <div className="text-xs text-[#666680] mb-3">
                        {profile.company && <div>{profile.company}</div>}
                        {profile.address && <div className="truncate">{profile.address}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onSelectRecipient(profile);
                            onClose();
                          }}
                          className="flex-1 px-3 py-1.5 rounded text-xs bg-[#4ecdc4] text-[#0a0a12] hover:bg-[#3dbdb5]"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => deleteRecipientProfile(profile.id)}
                          className="px-3 py-1.5 rounded text-xs text-[#f87171] hover:bg-[#f87171]/10"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

