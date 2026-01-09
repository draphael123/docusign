"use client";

import { useState, useEffect, useMemo } from "react";
import { DocumentHistoryItem, getHistory } from "@/utils/documentHistory";

interface DocumentSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (doc: DocumentHistoryItem) => void;
}

export default function DocumentSearch({ isOpen, onClose, onSelect }: DocumentSearchProps) {
  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
      setSearch("");
    }
  }, [isOpen]);

  const documentTypes = useMemo(() => {
    const types = new Set(history.map(d => d.documentType));
    return Array.from(types);
  }, [history]);

  const filteredDocs = useMemo(() => {
    let docs = history;
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      docs = docs.filter(doc =>
        doc.documentType.toLowerCase().includes(searchLower) ||
        doc.recipientName?.toLowerCase().includes(searchLower) ||
        doc.bodyText?.toLowerCase().includes(searchLower) ||
        doc.signatoryName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by type
    if (filterType !== "all") {
      docs = docs.filter(doc => doc.documentType === filterType);
    }
    
    // Sort
    docs = [...docs].sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc" 
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return sortOrder === "desc"
          ? b.documentType.localeCompare(a.documentType)
          : a.documentType.localeCompare(b.documentType);
      }
    });
    
    return docs;
  }, [history, search, filterType, sortBy, sortOrder]);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-300/30 text-inherit">{part}</mark>
        : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[--border-default]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[--text-primary]">Search Documents</h2>
            <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">✕</button>
          </div>
          
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by content, recipient, document type..."
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] placeholder:text-[--text-muted]"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-muted]">🔍</span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "name")}
              className="px-3 py-1.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Type</option>
            </select>
            
            <button
              onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
              className="px-3 py-1.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
            >
              {sortOrder === "desc" ? "↓ Newest" : "↑ Oldest"}
            </button>
            
            <span className="ml-auto text-sm text-[--text-muted]">
              {filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-[--text-muted]">
              <p className="text-lg mb-2">No documents found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => { onSelect(doc); onClose(); }}
                  className="w-full text-left p-4 rounded-lg bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-primary] transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[--text-primary]">
                          {highlightMatch(doc.documentType, search)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[--bg-overlay] text-[--text-muted]">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.recipientName && (
                        <p className="text-sm text-[--text-secondary] mb-1">
                          To: {highlightMatch(doc.recipientName, search)}
                        </p>
                      )}
                      <p className="text-sm text-[--text-muted] line-clamp-2">
                        {doc.bodyText?.substring(0, 200) || doc.preview || "No preview"}
                      </p>
                    </div>
                    <span className="text-[--color-primary] opacity-0 group-hover:opacity-100 transition-opacity">
                      Open →
                    </span>
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

