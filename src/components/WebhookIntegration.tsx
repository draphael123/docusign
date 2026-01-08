"use client";

import { useState, useEffect } from "react";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  lastTriggered?: string;
}

const AVAILABLE_EVENTS = [
  { id: "document.created", label: "Document Created" },
  { id: "document.downloaded", label: "Document Downloaded" },
  { id: "template.created", label: "Template Created" },
  { id: "template.deleted", label: "Template Deleted" },
];

interface WebhookIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("webhooks");
    if (saved) {
      try {
        setWebhooks(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading webhooks:", e);
      }
    }
  }, []);

  const saveWebhooks = (updated: Webhook[]) => {
    setWebhooks(updated);
    localStorage.setItem("webhooks", JSON.stringify(updated));
  };

  const addWebhook = (webhook: Omit<Webhook, "id">) => {
    const newWebhook = { ...webhook, id: `webhook-${Date.now()}` };
    saveWebhooks([...webhooks, newWebhook]);
  };

  const updateWebhook = (id: string, updates: Partial<Webhook>) => {
    saveWebhooks(webhooks.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWebhook = (id: string) => {
    saveWebhooks(webhooks.filter(w => w.id !== id));
  };

  const triggerWebhook = async (eventType: string, data: Record<string, unknown>) => {
    const matchingWebhooks = webhooks.filter(w => w.enabled && w.events.includes(eventType));
    
    for (const webhook of matchingWebhooks) {
      try {
        // In a real app, this would make actual HTTP requests
        console.log(`[Webhook] Triggering ${webhook.name} for ${eventType}`, data);
        updateWebhook(webhook.id, { lastTriggered: new Date().toISOString() });
      } catch (error) {
        console.error(`[Webhook] Error triggering ${webhook.name}:`, error);
      }
    }
  };

  return { webhooks, addWebhook, updateWebhook, deleteWebhook, triggerWebhook, mounted };
}

export default function WebhookIntegration({ isOpen, onClose }: WebhookIntegrationProps) {
  const { webhooks, addWebhook, updateWebhook, deleteWebhook } = useWebhooks();
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCreate = () => {
    if (!formName || !formUrl) return;
    
    addWebhook({
      name: formName,
      url: formUrl,
      events: formEvents,
      enabled: true,
    });
    
    setFormName("");
    setFormUrl("");
    setFormEvents([]);
    setShowCreate(false);
  };

  const handleTest = async (webhook: Webhook) => {
    setTestResult(null);
    
    // Simulate webhook test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real app, this would actually ping the webhook URL
    setTestResult({
      success: true,
      message: `Test payload sent to ${webhook.url}`,
    });
    
    setTimeout(() => setTestResult(null), 3000);
  };

  const toggleEvent = (eventId: string) => {
    setFormEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">🔗 Webhook Integration</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Info Banner */}
          <div className="mb-6 p-4 rounded-lg bg-[#4ecdc4]/10 border border-[#4ecdc4]/30">
            <p className="text-sm text-[#a0a0a0]">
              <strong className="text-[#4ecdc4]">Webhooks</strong> allow you to send real-time notifications to external services when events occur. 
              Connect to Zapier, Make, or your own endpoints.
            </p>
          </div>

          {/* Create Webhook Form */}
          {showCreate ? (
            <div className="mb-6 p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
              <h3 className="text-white font-medium mb-4">New Webhook</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-1">Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Zapier Integration"
                    className="w-full px-4 py-2 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-1">Endpoint URL</label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/..."
                    className="w-full px-4 py-2 rounded-lg bg-[#12121a] border border-[#2a2a3a] text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Events</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_EVENTS.map(event => (
                      <button
                        key={event.id}
                        onClick={() => toggleEvent(event.id)}
                        className={`p-2 rounded-lg text-sm text-left transition-colors ${
                          formEvents.includes(event.id)
                            ? "bg-[#a78bfa]/20 border border-[#a78bfa] text-white"
                            : "bg-[#12121a] border border-[#2a2a3a] text-[#a0a0a0]"
                        }`}
                      >
                        {event.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2 rounded-lg bg-[#2a2a3a] text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!formName || !formUrl}
                    className="flex-1 py-2 rounded-lg bg-[#a78bfa] text-white disabled:opacity-50"
                  >
                    Create Webhook
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full mb-6 p-4 rounded-lg border-2 border-dashed border-[#2a2a3a] text-[#a78bfa] hover:border-[#a78bfa] transition-colors"
            >
              + Add New Webhook
            </button>
          )}

          {/* Test Result */}
          {testResult && (
            <div className={`mb-4 p-3 rounded-lg ${testResult.success ? "bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80]" : "bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171]"}`}>
              {testResult.message}
            </div>
          )}

          {/* Webhooks List */}
          <div className="space-y-3">
            {webhooks.length === 0 ? (
              <div className="text-center py-8 text-[#666680]">
                <p>No webhooks configured yet.</p>
                <p className="text-sm mt-1">Create one to start receiving notifications.</p>
              </div>
            ) : (
              webhooks.map(webhook => (
                <div key={webhook.id} className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{webhook.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${webhook.enabled ? "bg-[#4ade80]/20 text-[#4ade80]" : "bg-[#666680]/20 text-[#666680]"}`}>
                          {webhook.enabled ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <p className="text-sm text-[#666680] mt-1 font-mono">{webhook.url}</p>
                      <div className="flex gap-1 mt-2">
                        {webhook.events.map(event => (
                          <span key={event} className="px-2 py-0.5 rounded text-xs bg-[#2a2a3a] text-[#a0a0a0]">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTest(webhook)}
                        className="px-3 py-1 rounded text-sm text-[#4ecdc4] hover:bg-[#4ecdc4]/10"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => updateWebhook(webhook.id, { enabled: !webhook.enabled })}
                        className="px-3 py-1 rounded text-sm text-[#a0a0a0] hover:bg-[#2a2a3a]"
                      >
                        {webhook.enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => deleteWebhook(webhook.id)}
                        className="px-3 py-1 rounded text-sm text-[#f87171] hover:bg-[#f87171]/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {webhook.lastTriggered && (
                    <p className="text-xs text-[#4a4a5a] mt-2">
                      Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

