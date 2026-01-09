"use client";

import { useState, useRef } from "react";

interface PDFImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => void;
}

export default function PDFImport({ isOpen, onClose, onImport }: PDFImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const PDFJS_VERSION = "4.0.379";
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: unknown) => {
            const textItem = item as { str?: string };
            return textItem.str || "";
          })
          .join(" ");
        fullText += pageText + "\n\n";
      }
      
      return fullText.trim();
    } catch (err) {
      console.error("PDF extraction error:", err);
      throw new Error("Failed to extract text from PDF. The file may be image-based or corrupted.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    setIsLoading(true);
    setFileName(file.name);
    
    try {
      if (file.type === "application/pdf") {
        const text = await extractTextFromPDF(file);
        if (!text.trim()) {
          throw new Error("No text could be extracted. The PDF may contain only images.");
        }
        setExtractedText(text);
      } else if (file.name.endsWith(".docx")) {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setExtractedText(result.value);
      } else if (file.name.endsWith(".txt")) {
        const text = await file.text();
        setExtractedText(text);
      } else {
        throw new Error("Unsupported file type. Please use PDF, DOCX, or TXT files.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
      setExtractedText("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (extractedText) {
      onImport(extractedText);
      onClose();
      // Reset state
      setExtractedText("");
      setFileName("");
      setError(null);
    }
  };

  const handleClose = () => {
    onClose();
    setExtractedText("");
    setFileName("");
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[--text-primary]">Import Document</h2>
            <button onClick={handleClose} className="text-[--text-muted] hover:text-[--text-primary]">✕</button>
          </div>
          <p className="text-sm text-[--text-muted] mt-1">
            Import text from PDF, Word, or text files
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* File Upload */}
          <div className="text-center p-8 border-2 border-dashed border-[--border-default] rounded-xl mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-[--color-primary] text-white hover:opacity-90 disabled:opacity-50 mb-3"
            >
              {isLoading ? "Processing..." : "Choose File"}
            </button>
            <p className="text-sm text-[--text-muted]">
              Supports PDF, DOCX, and TXT files
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[--color-primary] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[--text-muted]">Extracting text...</p>
            </div>
          )}

          {/* Extracted text preview */}
          {extractedText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[--text-secondary]">
                  Extracted from: {fileName}
                </h3>
                <span className="text-xs text-[--text-muted]">
                  {extractedText.length.toLocaleString()} characters
                </span>
              </div>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm resize-none"
                placeholder="Extracted text will appear here..."
              />
              <p className="text-xs text-[--text-muted] mt-2">
                You can edit the text above before importing
              </p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[--border-default] flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:bg-[--bg-overlay]"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!extractedText}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[--color-primary] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import to Document
          </button>
        </div>
      </div>
    </div>
  );
}

