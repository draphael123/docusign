"use client";

import { useState, useEffect, useMemo } from "react";

export interface Revision {
  id: string;
  documentId: string;
  version: number;
  content: string;
  changes: string;
  createdAt: string;
  createdBy: string;
}

interface DocumentRevisionsProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentContent: string;
  onRestoreRevision: (content: string) => void;
}

// Compute diff between two strings
function computeDiff(oldText: string, newText: string): { added: number; removed: number; summary: string } {
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);
  
  const oldSet = new Set(oldWords);
  const newSet = new Set(newWords);
  
  let added = 0;
  let removed = 0;
  
  for (const word of newWords) {
    if (!oldSet.has(word)) added++;
  }
  for (const word of oldWords) {
    if (!newSet.has(word)) removed++;
  }
  
  if (added === 0 && removed === 0) return { added, removed, summary: "No changes" };
  
  const parts = [];
  if (added > 0) parts.push(`+${added} words`);
  if (removed > 0) parts.push(`-${removed} words`);
  
  return { added, removed, summary: parts.join(", ") };
}

export default function DocumentRevisions({ 
  isOpen, 
  onClose, 
  documentId, 
  currentContent,
  onRestoreRevision 
}: DocumentRevisionsProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRevisions();
    }
  }, [isOpen, documentId]);

  const loadRevisions = () => {
    const saved = localStorage.getItem(`revisions-${documentId}`);
    if (saved) {
      try {
        setRevisions(JSON.parse(saved));
      } catch {
        setRevisions([]);
      }
    }
  };

  const handleRestore = () => {
    if (selectedRevision) {
      onRestoreRevision(selectedRevision.content);
      onClose();
    }
  };

  // Calculate diff stats for each revision
  const revisionsWithDiff = useMemo(() => {
    return revisions.map((rev, index) => {
      const prevContent = index < revisions.length - 1 ? revisions[index + 1].content : "";
      const diff = computeDiff(prevContent, rev.content);
      return { ...rev, diff };
    });
  }, [revisions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[--text-primary]">Document Revisions</h2>
            <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">✕</button>
          </div>
          <p className="text-sm text-[--text-muted] mt-1">
            {revisions.length} revision{revisions.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Revision List */}
          <div className="w-72 border-r border-[--border-default] overflow-y-auto">
            {revisionsWithDiff.length === 0 ? (
              <div className="p-4 text-center text-[--text-muted]">
                No revisions yet
              </div>
            ) : (
              <div className="p-2">
                {revisionsWithDiff.map((rev) => (
                  <button
                    key={rev.id}
                    onClick={() => setSelectedRevision(rev)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                      selectedRevision?.id === rev.id
                        ? "bg-[--color-primary]/10 border border-[--color-primary]/30"
                        : "hover:bg-[--bg-elevated]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[--text-primary]">Version {rev.version}</span>
                      <span className={`text-xs ${
                        rev.diff.added > 0 ? "text-green-400" : 
                        rev.diff.removed > 0 ? "text-red-400" : "text-[--text-muted]"
                      }`}>
                        {rev.diff.summary}
                      </span>
                    </div>
                    <div className="text-xs text-[--text-muted]">
                      {new Date(rev.createdAt).toLocaleString()}
                    </div>
                    {rev.changes && (
                      <div className="text-xs text-[--text-secondary] mt-1 truncate">
                        {rev.changes}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedRevision ? (
              <>
                <div className="p-4 border-b border-[--border-default] flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-[--text-primary]">Version {selectedRevision.version}</h3>
                    <p className="text-sm text-[--text-muted]">
                      {new Date(selectedRevision.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[--text-secondary]">
                    <input
                      type="checkbox"
                      checked={compareMode}
                      onChange={(e) => setCompareMode(e.target.checked)}
                    />
                    Compare with current
                  </label>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {compareMode ? (
                    <div className="grid grid-cols-2 gap-4 h-full">
                      <div>
                        <h4 className="text-sm font-medium text-[--text-secondary] mb-2">Selected Version</h4>
                        <div className="p-4 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-sm text-[--text-primary] whitespace-pre-wrap h-64 overflow-y-auto">
                          {selectedRevision.content}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[--text-secondary] mb-2">Current Version</h4>
                        <div className="p-4 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-sm text-[--text-primary] whitespace-pre-wrap h-64 overflow-y-auto">
                          {currentContent}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-sm text-[--text-primary] whitespace-pre-wrap">
                      {selectedRevision.content}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[--text-muted]">
                Select a revision to preview
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-[--border-default] flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:bg-[--bg-overlay]"
          >
            Close
          </button>
          {selectedRevision && (
            <button
              onClick={handleRestore}
              className="px-4 py-2.5 rounded-lg bg-[--color-primary] text-white hover:opacity-90"
            >
              Restore This Version
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to manage revisions
export function useDocumentRevisions(documentId: string) {
  const saveRevision = (content: string, changes?: string) => {
    const key = `revisions-${documentId}`;
    const saved = localStorage.getItem(key);
    let revisions: Revision[] = [];
    
    try {
      revisions = saved ? JSON.parse(saved) : [];
    } catch {
      revisions = [];
    }
    
    // Don't save if content is identical to last revision
    if (revisions.length > 0 && revisions[0].content === content) {
      return;
    }
    
    const newRevision: Revision = {
      id: `rev-${Date.now()}`,
      documentId,
      version: revisions.length + 1,
      content,
      changes: changes || "Manual save",
      createdAt: new Date().toISOString(),
      createdBy: "User",
    };
    
    // Keep last 50 revisions
    const updatedRevisions = [newRevision, ...revisions].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updatedRevisions));
  };

  const getRevisionCount = (): number => {
    const saved = localStorage.getItem(`revisions-${documentId}`);
    if (!saved) return 0;
    try {
      return JSON.parse(saved).length;
    } catch {
      return 0;
    }
  };

  return { saveRevision, getRevisionCount };
}

