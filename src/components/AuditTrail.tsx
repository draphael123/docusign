"use client";

import { useState, useEffect } from "react";

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  documentType?: string;
  user?: string;
}

const STORAGE_KEY = "auditTrail";
const MAX_EVENTS = 500;

export function useAuditTrail() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadEvents();
  }, []);

  const loadEvents = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading audit trail:", e);
      }
    }
  };

  const logEvent = (action: string, details: string, documentType?: string) => {
    const event: AuditEvent = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      documentType,
    };

    const updated = [event, ...events].slice(0, MAX_EVENTS);
    setEvents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearEvents = () => {
    setEvents([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportEvents = () => {
    const csv = [
      "Timestamp,Action,Details,Document Type",
      ...events.map(e => `"${e.timestamp}","${e.action}","${e.details}","${e.documentType || ""}"`)
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { events, logEvent, clearEvents, exportEvents, mounted };
}

interface AuditTrailProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditTrail({ isOpen, onClose }: AuditTrailProps) {
  const { events, clearEvents, exportEvents } = useAuditTrail();
  const [filter, setFilter] = useState<string>("all");

  if (!isOpen) return null;

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create": return "📄";
      case "download": return "📥";
      case "preview": return "👁️";
      case "edit": return "✏️";
      case "delete": return "🗑️";
      case "template": return "📋";
      case "settings": return "⚙️";
      default: return "📌";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create": return "#4ade80";
      case "download": return "#60a5fa";
      case "preview": return "#a78bfa";
      case "edit": return "#f0b866";
      case "delete": return "#f87171";
      case "template": return "#4ecdc4";
      case "settings": return "#f472b6";
      default: return "#a0a0a0";
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredEvents = filter === "all" 
    ? events 
    : events.filter(e => e.action === filter);

  const actionTypes = Array.from(new Set(events.map(e => e.action)));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">📜 Audit Trail</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={exportEvents}
              className="px-3 py-1.5 rounded-lg text-sm text-[#4ecdc4] hover:bg-[#4ecdc4]/10 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={clearEvents}
              className="px-3 py-1.5 rounded-lg text-sm text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
            >
              Clear
            </button>
            <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 p-4 border-b border-[#2a2a3a] overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              filter === "all" ? "bg-[#a78bfa] text-white" : "text-[#666680] hover:text-white"
            }`}
          >
            All ({events.length})
          </button>
          {actionTypes.map(action => (
            <button
              key={action}
              onClick={() => setFilter(action)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                filter === action ? "text-white" : "text-[#666680] hover:text-white"
              }`}
              style={{ backgroundColor: filter === action ? getActionColor(action) : "transparent" }}
            >
              {getActionIcon(action)} {action}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-[#666680]">
              <p>No audit events recorded yet.</p>
              <p className="text-sm mt-2">Activities will appear here as you use the app.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] hover:border-[#3a3a4a] transition-colors">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${getActionColor(event.action)}20` }}
                  >
                    {getActionIcon(event.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium capitalize">{event.action}</span>
                      {event.documentType && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-[#2a2a3a] text-[#a0a0a0]">
                          {event.documentType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#a0a0a0] truncate">{event.details}</p>
                  </div>
                  <span className="text-xs text-[#666680] whitespace-nowrap">{formatDate(event.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="p-4 border-t border-[#2a2a3a] flex items-center justify-between">
          <span className="text-sm text-[#666680]">
            Showing {filteredEvents.length} of {events.length} events
          </span>
          <span className="text-xs text-[#666680]">
            Events are stored locally
          </span>
        </div>
      </div>
    </div>
  );
}

