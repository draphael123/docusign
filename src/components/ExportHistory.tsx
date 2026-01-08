"use client";

import { useState, useEffect } from "react";

export interface ExportRecord {
  id: string;
  timestamp: string;
  documentType: string;
  fileName: string;
  recipientName?: string;
  signatoryName: string;
  wordCount: number;
  format: "pdf" | "docx";
}

const STORAGE_KEY = "exportHistory";
const MAX_RECORDS = 100;

export function useExportHistory() {
  const [records, setRecords] = useState<ExportRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading export history:", e);
      }
    }
  }, []);

  const addRecord = (record: Omit<ExportRecord, "id" | "timestamp">) => {
    const newRecord: ExportRecord = {
      ...record,
      id: `export-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newRecord, ...records].slice(0, MAX_RECORDS);
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setRecords([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportToCSV = () => {
    const csv = [
      "Date,Document Type,File Name,Recipient,Signatory,Words,Format",
      ...records.map(r => 
        `"${new Date(r.timestamp).toLocaleString()}","${r.documentType}","${r.fileName}","${r.recipientName || ""}","${r.signatoryName}","${r.wordCount}","${r.format}"`
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { records, addRecord, clearHistory, exportToCSV, mounted };
}

interface ExportHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportHistory({ isOpen, onClose }: ExportHistoryProps) {
  const { records, clearHistory, exportToCSV } = useExportHistory();
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "type" | "words">("date");

  if (!isOpen) return null;

  const documentTypes = Array.from(new Set(records.map(r => r.documentType)));

  const filteredRecords = records.filter(r => 
    filter === "all" || r.documentType === filter
  );

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case "type":
        return a.documentType.localeCompare(b.documentType);
      case "words":
        return b.wordCount - a.wordCount;
      default:
        return 0;
    }
  });

  const totalExports = records.length;
  const totalWords = records.reduce((sum, r) => sum + r.wordCount, 0);
  const avgWords = totalExports > 0 ? Math.round(totalWords / totalExports) : 0;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">📋 Export History</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 rounded-lg text-sm text-[#4ecdc4] hover:bg-[#4ecdc4]/10 transition-colors"
            >
              Download CSV
            </button>
            <button
              onClick={clearHistory}
              className="px-3 py-1.5 rounded-lg text-sm text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
            >
              Clear
            </button>
            <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 border-b border-[#2a2a3a]">
          <div className="text-center p-3 rounded-lg bg-[#1a1a24]">
            <div className="text-2xl font-bold text-[#a78bfa]">{totalExports}</div>
            <div className="text-xs text-[#666680]">Total Exports</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#1a1a24]">
            <div className="text-2xl font-bold text-[#4ecdc4]">{totalWords.toLocaleString()}</div>
            <div className="text-xs text-[#666680]">Total Words</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#1a1a24]">
            <div className="text-2xl font-bold text-[#f472b6]">{avgWords}</div>
            <div className="text-xs text-[#666680]">Avg Words/Doc</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 p-4 border-b border-[#2a2a3a]">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm"
          >
            <option value="all">All Types</option>
            {documentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="type">Sort by Type</option>
            <option value="words">Sort by Words</option>
          </select>

          <span className="text-sm text-[#666680] ml-auto">
            {sortedRecords.length} records
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {sortedRecords.length === 0 ? (
            <div className="text-center py-12 text-[#666680]">
              <p>No export history yet.</p>
              <p className="text-sm mt-2">Generated documents will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedRecords.map(record => (
                <div key={record.id} className="flex items-center gap-4 p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    record.format === "pdf" ? "bg-[#f87171]/20 text-[#f87171]" : "bg-[#60a5fa]/20 text-[#60a5fa]"
                  }`}>
                    {record.format === "pdf" ? "PDF" : "DOC"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{record.fileName}</div>
                    <div className="text-sm text-[#666680]">
                      {record.documentType} • {record.wordCount} words
                      {record.recipientName && ` • To: ${record.recipientName}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#a0a0a0]">{record.signatoryName}</div>
                    <div className="text-xs text-[#666680]">{formatDate(record.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

