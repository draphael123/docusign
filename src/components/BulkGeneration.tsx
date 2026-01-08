"use client";

import { useState, useRef } from "react";

interface BulkRecord {
  [key: string]: string;
}

interface BulkGenerationProps {
  isOpen: boolean;
  onClose: () => void;
  templateBody: string;
  documentType: string;
  onGenerate: (records: BulkRecord[]) => void;
}

export default function BulkGeneration({ isOpen, onClose, templateBody, documentType, onGenerate }: BulkGenerationProps) {
  const [records, setRecords] = useState<BulkRecord[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract placeholders from template
  const placeholders = templateBody.match(/\[([^\]]+)\]/g)?.map(p => p.slice(1, -1)) || [];
  const uniquePlaceholders = Array.from(new Set(placeholders));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError("");

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        setError("CSV must have at least a header row and one data row");
        return;
      }

      // Parse header
      const headerLine = lines[0];
      const csvHeaders = parseCSVLine(headerLine);
      setHeaders(csvHeaders);

      // Parse data rows
      const dataRecords: BulkRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const record: BulkRecord = {};
        csvHeaders.forEach((header, index) => {
          record[header] = values[index] || "";
        });
        dataRecords.push(record);
      }

      setRecords(dataRecords);
    } catch (err) {
      console.error("Error parsing CSV:", err);
      setError("Error parsing CSV file. Please check the format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleGenerate = () => {
    if (records.length === 0) {
      setError("No data to generate");
      return;
    }
    onGenerate(records);
  };

  const clearData = () => {
    setRecords([]);
    setHeaders([]);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">📦 Bulk Document Generation</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Instructions */}
          <div className="mb-6 p-4 rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/30">
            <h3 className="text-white font-medium mb-2">How it works:</h3>
            <ol className="text-sm text-[#a0a0a0] space-y-1 list-decimal list-inside">
              <li>Upload a CSV file with column headers matching your placeholders</li>
              <li>Each row will generate one document with values filled in</li>
              <li>All documents will be downloaded as separate PDFs</li>
            </ol>
          </div>

          {/* Placeholders in template */}
          {uniquePlaceholders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-[#a0a0a0] mb-2">Placeholders in your template:</h3>
              <div className="flex flex-wrap gap-2">
                {uniquePlaceholders.map(placeholder => (
                  <span key={placeholder} className="px-3 py-1 rounded-full bg-[#4ecdc4]/20 text-[#4ecdc4] text-sm">
                    [{placeholder}]
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* File upload */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full p-8 rounded-xl border-2 border-dashed border-[#2a2a3a] hover:border-[#a78bfa] transition-colors text-center"
            >
              {isProcessing ? (
                <span className="text-[#a0a0a0]">Processing...</span>
              ) : (
                <>
                  <span className="text-3xl block mb-2">📄</span>
                  <span className="text-white block">Drop CSV file or click to upload</span>
                  <span className="text-sm text-[#666680]">Supports .csv files</span>
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171]">
              {error}
            </div>
          )}

          {/* Preview data */}
          {records.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Preview ({records.length} records)</h3>
                <button onClick={clearData} className="text-sm text-[#f87171] hover:text-[#fca5a5]">
                  Clear
                </button>
              </div>
              <div className="overflow-auto max-h-60 rounded-lg border border-[#2a2a3a]">
                <table className="w-full text-sm">
                  <thead className="bg-[#1a1a24] sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-[#a0a0a0]">#</th>
                      {headers.map(header => (
                        <th key={header} className="px-3 py-2 text-left text-[#a0a0a0]">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 10).map((record, index) => (
                      <tr key={index} className="border-t border-[#2a2a3a]">
                        <td className="px-3 py-2 text-[#666680]">{index + 1}</td>
                        {headers.map(header => (
                          <td key={header} className="px-3 py-2 text-white">{record[header] || "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {records.length > 10 && (
                  <div className="p-2 text-center text-sm text-[#666680] bg-[#1a1a24]">
                    ... and {records.length - 10} more records
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sample CSV */}
          <div className="mb-6">
            <h3 className="text-sm text-[#a0a0a0] mb-2">Sample CSV format:</h3>
            <pre className="p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#a0a0a0] overflow-auto">
{uniquePlaceholders.length > 0 
  ? `${uniquePlaceholders.join(",")}\nJohn Doe,Manager,Acme Inc\nJane Smith,Director,Tech Corp`
  : `Name,Position,Company\nJohn Doe,Manager,Acme Inc\nJane Smith,Director,Tech Corp`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#2a2a3a]">
          <span className="text-sm text-[#666680]">
            {records.length > 0 ? `${records.length} documents will be generated` : "Upload a CSV to get started"}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#2a2a3a] text-white hover:bg-[#3a3a4a]">
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={records.length === 0}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white hover:opacity-90 disabled:opacity-50"
            >
              Generate {records.length > 0 ? `${records.length} PDFs` : "PDFs"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

