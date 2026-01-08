"use client";

import { useState, useEffect } from "react";

interface ScheduledDocument {
  id: string;
  documentType: string;
  bodyText: string;
  recipientName: string;
  scheduledFor: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

interface DocumentSchedulingProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocumentType: string;
  currentBodyText: string;
  currentRecipientName: string;
  onGenerate: () => void;
}

export function useScheduledDocuments() {
  const [documents, setDocuments] = useState<ScheduledDocument[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("scheduledDocuments");
    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading scheduled documents:", e);
      }
    }
  }, []);

  const saveDocuments = (updated: ScheduledDocument[]) => {
    setDocuments(updated);
    localStorage.setItem("scheduledDocuments", JSON.stringify(updated));
  };

  const addScheduledDocument = (doc: Omit<ScheduledDocument, "id" | "status" | "createdAt">) => {
    const newDoc: ScheduledDocument = {
      ...doc,
      id: `scheduled-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveDocuments([...documents, newDoc]);
    return newDoc;
  };

  const updateStatus = (id: string, status: ScheduledDocument["status"]) => {
    saveDocuments(documents.map(d => d.id === id ? { ...d, status } : d));
  };

  const deleteDocument = (id: string) => {
    saveDocuments(documents.filter(d => d.id !== id));
  };

  return { documents, addScheduledDocument, updateStatus, deleteDocument, mounted };
}

export default function DocumentScheduling({ 
  isOpen, 
  onClose, 
  currentDocumentType,
  currentBodyText,
  currentRecipientName,
  onGenerate
}: DocumentSchedulingProps) {
  const { documents, addScheduledDocument, updateStatus, deleteDocument } = useScheduledDocuments();
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [repeatOption, setRepeatOption] = useState<"none" | "daily" | "weekly" | "monthly">("none");

  // Check for due documents
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      documents.forEach(doc => {
        if (doc.status === "pending") {
          const scheduledTime = new Date(doc.scheduledFor);
          if (scheduledTime <= now) {
            // In a real app, this would generate the PDF
            console.log(`[Scheduler] Document ${doc.id} is due!`);
            updateStatus(doc.id, "completed");
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [documents, updateStatus]);

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) return;
    
    const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    
    addScheduledDocument({
      documentType: currentDocumentType,
      bodyText: currentBodyText,
      recipientName: currentRecipientName,
      scheduledFor,
    });
    
    setScheduleDate("");
    setScheduleTime("");
    setShowScheduleForm(false);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const formatScheduledTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getTimeUntil = (isoString: string) => {
    const now = new Date();
    const scheduled = new Date(isoString);
    const diff = scheduled.getTime() - now.getTime();
    
    if (diff < 0) return "Past due";
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `In ${days} day${days !== 1 ? "s" : ""}`;
    }
    if (hours > 0) {
      return `In ${hours}h ${minutes}m`;
    }
    return `In ${minutes}m`;
  };

  if (!isOpen) return null;

  const pendingDocs = documents.filter(d => d.status === "pending");
  const completedDocs = documents.filter(d => d.status === "completed");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">⏰ Document Scheduling</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Current Document Info */}
          <div className="mb-6 p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
            <h3 className="text-sm text-[#a0a0a0] mb-2">Current Document</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{currentDocumentType || "No type selected"}</p>
                <p className="text-sm text-[#666680]">
                  {currentBodyText ? `${currentBodyText.split(/\s+/).length} words` : "No content"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onGenerate}
                  className="px-4 py-2 rounded-lg bg-[#4ecdc4] text-[#0a0a12] text-sm"
                >
                  Generate Now
                </button>
                <button
                  onClick={() => setShowScheduleForm(true)}
                  disabled={!currentBodyText}
                  className="px-4 py-2 rounded-lg bg-[#a78bfa] text-white text-sm disabled:opacity-50"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Form */}
          {showScheduleForm && (
            <div className="mb-6 p-4 rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/30">
              <h3 className="text-white font-medium mb-4">Schedule Generation</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full px-4 py-2 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-white"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-[#a0a0a0] mb-1">Repeat</label>
                <select
                  value={repeatOption}
                  onChange={(e) => setRepeatOption(e.target.value as typeof repeatOption)}
                  className="w-full px-4 py-2 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-white"
                >
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1 py-2 rounded-lg bg-[#2a2a3a] text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!scheduleDate || !scheduleTime}
                  className="flex-1 py-2 rounded-lg bg-[#a78bfa] text-white disabled:opacity-50"
                >
                  Schedule
                </button>
              </div>
            </div>
          )}

          {/* Pending Documents */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#f0b866] mb-3">
              Pending ({pendingDocs.length})
            </h3>
            {pendingDocs.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-center text-[#666680]">
                No scheduled documents
              </div>
            ) : (
              <div className="space-y-2">
                {pendingDocs.map(doc => (
                  <div key={doc.id} className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{doc.documentType}</p>
                      <p className="text-sm text-[#666680]">{formatScheduledTime(doc.scheduledFor)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-[#f0b866]/20 text-[#f0b866]">
                        {getTimeUntil(doc.scheduledFor)}
                      </span>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="text-[#f87171] hover:text-[#fca5a5]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Documents */}
          {completedDocs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[#4ade80] mb-3">
                Completed ({completedDocs.length})
              </h3>
              <div className="space-y-2">
                {completedDocs.slice(0, 5).map(doc => (
                  <div key={doc.id} className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-between opacity-60">
                    <div>
                      <p className="text-white font-medium">{doc.documentType}</p>
                      <p className="text-sm text-[#666680]">Generated {formatScheduledTime(doc.scheduledFor)}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs bg-[#4ade80]/20 text-[#4ade80]">
                      ✓ Done
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

