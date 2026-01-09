"use client";

import { useState, useEffect } from "react";
import { DocumentHistoryItem, getHistory } from "@/utils/documentHistory";

interface QuickDuplicateProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (doc: DocumentHistoryItem, newRecipient: { name: string; title: string; address: string }) => void;
}

export default function QuickDuplicate({ isOpen, onClose, onDuplicate }: QuickDuplicateProps) {
  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentHistoryItem | null>(null);
  const [newRecipient, setNewRecipient] = useState({ name: "", title: "", address: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
      setSelectedDoc(null);
      setNewRecipient({ name: "", title: "", address: "" });
    }
  }, [isOpen]);

  const filteredHistory = history.filter(doc => 
    doc.documentType.toLowerCase().includes(search.toLowerCase()) ||
    doc.recipientName?.toLowerCase().includes(search.toLowerCase()) ||
    doc.bodyText?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDuplicate = () => {
    if (selectedDoc) {
      onDuplicate(selectedDoc, newRecipient);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-[--border-default]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[--text-primary]">Quick Duplicate</h2>
            <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">✕</button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search previous documents..."
            className="w-full px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] placeholder:text-[--text-muted]"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedDoc ? (
            <div className="p-4">
              <h3 className="text-sm font-medium text-[--text-secondary] mb-3">Select a document to duplicate</h3>
              {filteredHistory.length === 0 ? (
                <p className="text-center py-8 text-[--text-muted]">No documents found</p>
              ) : (
                <div className="space-y-2">
                  {filteredHistory.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="w-full text-left p-4 rounded-lg bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-primary] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-[--text-primary]">{doc.documentType}</span>
                        <span className="text-xs text-[--text-muted]">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.recipientName && (
                        <p className="text-sm text-[--text-secondary]">To: {doc.recipientName}</p>
                      )}
                      <p className="text-sm text-[--text-muted] truncate mt-1">
                        {doc.bodyText?.substring(0, 100) || doc.preview || "No preview"}...
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5">
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-sm text-[--color-primary] hover:underline mb-4"
              >
                ← Choose different document
              </button>
              
              <div className="p-4 rounded-lg bg-[--bg-elevated] border border-[--border-default] mb-4">
                <h4 className="font-medium text-[--text-primary] mb-1">{selectedDoc.documentType}</h4>
                <p className="text-sm text-[--text-muted]">
                  Original recipient: {selectedDoc.recipientName || "None"}
                </p>
              </div>

              <h3 className="text-sm font-medium text-[--text-secondary] mb-3">New Recipient Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[--text-muted] mb-1">Name</label>
                  <input
                    type="text"
                    value={newRecipient.name}
                    onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                    placeholder="Recipient name"
                    className="w-full px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[--text-muted] mb-1">Title</label>
                  <input
                    type="text"
                    value={newRecipient.title}
                    onChange={(e) => setNewRecipient({ ...newRecipient, title: e.target.value })}
                    placeholder="Recipient title"
                    className="w-full px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[--text-muted] mb-1">Address</label>
                  <textarea
                    value={newRecipient.address}
                    onChange={(e) => setNewRecipient({ ...newRecipient, address: e.target.value })}
                    placeholder="Recipient address"
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[--border-default] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:bg-[--bg-overlay]"
          >
            Cancel
          </button>
          <button
            onClick={handleDuplicate}
            disabled={!selectedDoc}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[--color-primary] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Duplicate Document
          </button>
        </div>
      </div>
    </div>
  );
}

