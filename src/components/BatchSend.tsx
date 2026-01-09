"use client";

import { useState, useRef } from "react";

interface Recipient {
  name: string;
  email: string;
  title?: string;
  company?: string;
  address?: string;
  [key: string]: string | undefined;
}

interface BatchSendProps {
  isOpen: boolean;
  onClose: () => void;
  templateBody: string;
  onGenerateBatch: (recipients: Recipient[], filledDocuments: string[]) => void;
}

export default function BatchSend({ isOpen, onClose, templateBody, onGenerateBatch }: BatchSendProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [csvText, setCsvText] = useState("");
  const [step, setStep] = useState<"upload" | "map" | "preview">("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract placeholders from template
  const placeholders = Array.from(templateBody.matchAll(/\[([^\]]+)\]/g)).map(m => m[1]);
  const uniquePlaceholders = Array.from(new Set(placeholders));

  const parseCSV = (text: string): { headers: string[]; rows: Record<string, string>[] } => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return { headers: [], rows: [] };
    
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || "";
      });
      return row;
    });
    
    return { headers, rows };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const { headers: csvHeaders, rows } = parseCSV(text);
      setHeaders(csvHeaders);
      setRecipients(rows.map(r => r as unknown as Recipient));
      
      // Auto-map common fields
      const autoMap: Record<string, string> = {};
      uniquePlaceholders.forEach(placeholder => {
        const lower = placeholder.toLowerCase();
        const match = csvHeaders.find(h => h.toLowerCase().includes(lower));
        if (match) autoMap[placeholder] = match;
      });
      setFieldMapping(autoMap);
      
      setStep("map");
    };
    reader.readAsText(file);
  };

  const handlePasteCSV = () => {
    if (!csvText.trim()) return;
    const { headers: csvHeaders, rows } = parseCSV(csvText);
    setHeaders(csvHeaders);
    setRecipients(rows.map(r => r as unknown as Recipient));
    setStep("map");
  };

  const generateFilledDocuments = (): string[] => {
    return recipients.map(recipient => {
      let filled = templateBody;
      uniquePlaceholders.forEach(placeholder => {
        const csvField = fieldMapping[placeholder];
        if (csvField && recipient[csvField]) {
          filled = filled.split(`[${placeholder}]`).join(recipient[csvField] || "");
        }
      });
      return filled;
    });
  };

  const handleGenerate = () => {
    const filledDocs = generateFilledDocuments();
    onGenerateBatch(recipients, filledDocs);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="p-5 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[--text-primary]">Batch Generate Documents</h2>
            <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">✕</button>
          </div>
          
          {/* Steps indicator */}
          <div className="flex items-center gap-4 mt-4">
            {["upload", "map", "preview"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === s ? "bg-[--color-primary] text-white" :
                  ["upload", "map", "preview"].indexOf(step) > i ? "bg-[--color-success] text-white" :
                  "bg-[--bg-elevated] text-[--text-muted]"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-sm ${step === s ? "text-[--text-primary]" : "text-[--text-muted]"}`}>
                  {s === "upload" ? "Upload" : s === "map" ? "Map Fields" : "Preview"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === "upload" && (
            <div className="space-y-4">
              <div className="text-center p-8 border-2 border-dashed border-[--border-default] rounded-xl">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-lg bg-[--color-primary] text-white hover:opacity-90 mb-3"
                >
                  Upload CSV File
                </button>
                <p className="text-sm text-[--text-muted]">
                  or paste your CSV data below
                </p>
              </div>
              
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="name,email,company
John Doe,john@example.com,Acme Inc
Jane Smith,jane@example.com,Tech Corp"
                rows={8}
                className="w-full px-4 py-3 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] font-mono text-sm"
              />
              
              {csvText && (
                <button
                  onClick={handlePasteCSV}
                  className="w-full px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:border-[--color-primary]"
                >
                  Parse CSV Data
                </button>
              )}
              
              <div className="p-3 rounded-lg bg-[--bg-elevated] border border-[--border-default]">
                <h4 className="text-sm font-medium text-[--text-secondary] mb-2">Template Placeholders Found:</h4>
                <div className="flex flex-wrap gap-2">
                  {uniquePlaceholders.length > 0 ? uniquePlaceholders.map(p => (
                    <span key={p} className="pill">[{p}]</span>
                  )) : (
                    <span className="text-sm text-[--text-muted]">No placeholders found</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "map" && (
            <div className="space-y-4">
              <p className="text-sm text-[--text-secondary]">
                Map your CSV columns to template placeholders:
              </p>
              
              <div className="space-y-3">
                {uniquePlaceholders.map(placeholder => (
                  <div key={placeholder} className="flex items-center gap-4 p-3 rounded-lg bg-[--bg-elevated] border border-[--border-default]">
                    <span className="font-mono text-sm text-[--color-primary] min-w-[120px]">[{placeholder}]</span>
                    <span className="text-[--text-muted]">→</span>
                    <select
                      value={fieldMapping[placeholder] || ""}
                      onChange={(e) => setFieldMapping({ ...fieldMapping, [placeholder]: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-[--bg-surface] border border-[--border-default] text-[--text-primary]"
                    >
                      <option value="">-- Select column --</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              
              <div className="p-3 rounded-lg bg-[--bg-elevated] border border-[--border-default]">
                <h4 className="text-sm font-medium text-[--text-secondary] mb-1">
                  {recipients.length} recipients loaded
                </h4>
                <p className="text-xs text-[--text-muted]">
                  Columns: {headers.join(", ")}
                </p>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <p className="text-sm text-[--text-secondary]">
                Preview the first document:
              </p>
              
              <div className="p-4 rounded-lg bg-[--bg-elevated] border border-[--border-default] whitespace-pre-wrap text-sm text-[--text-primary] max-h-64 overflow-y-auto">
                {generateFilledDocuments()[0] || "No preview available"}
              </div>
              
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
                Ready to generate {recipients.length} documents
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[--border-default] flex gap-3">
          {step !== "upload" && (
            <button
              onClick={() => setStep(step === "preview" ? "map" : "upload")}
              className="px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:bg-[--bg-overlay]"
            >
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:bg-[--bg-overlay]"
          >
            Cancel
          </button>
          <div className="flex-1" />
          {step === "upload" && recipients.length > 0 && (
            <button
              onClick={() => setStep("map")}
              className="px-4 py-2.5 rounded-lg bg-[--color-primary] text-white hover:opacity-90"
            >
              Next: Map Fields
            </button>
          )}
          {step === "map" && (
            <button
              onClick={() => setStep("preview")}
              className="px-4 py-2.5 rounded-lg bg-[--color-primary] text-white hover:opacity-90"
            >
              Next: Preview
            </button>
          )}
          {step === "preview" && (
            <button
              onClick={handleGenerate}
              className="px-4 py-2.5 rounded-lg bg-[--color-primary] text-white hover:opacity-90"
            >
              Generate All ({recipients.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

