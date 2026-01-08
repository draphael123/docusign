"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { documentTemplates, DocumentTemplate } from "@/data/templates";

interface TemplateGalleryProps {
  onSelectTemplate: (template: DocumentTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_KEY = "userTemplates_local_backup";

const documentTypes = [
  "Letter of Recommendation",
  "Letter of Termination",
  "Letter of Employment",
  "Letter of Reference",
  "Letter of Introduction",
  "Letter of Resignation",
  "Letter of Acceptance",
  "Letter of Rejection",
  "Letter of Apology",
  "Letter of Complaint",
  "Letter of Inquiry",
  "Letter of Request",
  "Letter of Confirmation",
  "Letter of Agreement",
  "Letter of Authorization",
  "Custom Document",
];

const categories = ["Professional", "HR", "Personal", "Legal", "Business", "Other"];

export default function TemplateGallery({ onSelectTemplate, isOpen, onClose }: TemplateGalleryProps) {
  const [userTemplates, setUserTemplates] = useState<DocumentTemplate[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "builtin" | "custom">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [storageMode, setStorageMode] = useState<"cloud" | "local">("cloud");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formDocType, setFormDocType] = useState(documentTypes[0]);
  const [formCategory, setFormCategory] = useState(categories[0]);
  const [formDescription, setFormDescription] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formError, setFormError] = useState("");
  
  // File upload state
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Header skip options
  const [skipHeader, setSkipHeader] = useState(false);
  const [headerLinesToSkip, setHeaderLinesToSkip] = useState(3);
  
  // Footer skip options
  const [skipFooter, setSkipFooter] = useState(false);
  const [footerLinesToSkip, setFooterLinesToSkip] = useState(2);
  
  // App header option
  const [useAppHeader, setUseAppHeader] = useState(true);
  
  // Additional options
  const [autoDetectPlaceholders, setAutoDetectPlaceholders] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [templateTags, setTemplateTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isDocuSignReady, setIsDocuSignReady] = useState(false);

  // Fetch templates from API
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/templates");
      const data = await response.json();
      
      if (data.templates && data.templates.length > 0) {
        setUserTemplates(data.templates);
        setStorageMode("cloud");
        // Also save to localStorage as backup
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.templates));
      } else if (data.source === "fallback") {
        // KV not configured, use localStorage
        setStorageMode("local");
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          setUserTemplates(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      // Fallback to localStorage
      setStorageMode("local");
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          setUserTemplates(JSON.parse(stored));
        } catch (e) {
          console.error("Error loading local templates:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Save template to API or localStorage
  const saveTemplate = async (template: Omit<DocumentTemplate, "id">): Promise<boolean> => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template }),
      });
      
      const data = await response.json();
      
      if (data.success && data.template) {
        // Add to local state
        const newTemplates = [...userTemplates, data.template];
        setUserTemplates(newTemplates);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTemplates));
        setStorageMode("cloud");
        return true;
      } else if (response.status === 503) {
        // Storage not configured, save locally only
        const localTemplate: DocumentTemplate = {
          ...template,
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        const newTemplates = [...userTemplates, localTemplate];
        setUserTemplates(newTemplates);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTemplates));
        setStorageMode("local");
        return true;
      }
      
      throw new Error(data.error || "Failed to save template");
    } catch (error) {
      console.error("Error saving template:", error);
      // Fallback: save locally
      const localTemplate: DocumentTemplate = {
        ...template,
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const newTemplates = [...userTemplates, localTemplate];
      setUserTemplates(newTemplates);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTemplates));
      setStorageMode("local");
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete template from API or localStorage
  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    try {
      // Only call API for cloud-stored templates
      if (templateId.startsWith("shared-")) {
        const response = await fetch(`/api/templates?id=${templateId}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to delete template");
        }
      }
      
      // Update local state
      const newTemplates = userTemplates.filter((t) => t.id !== templateId);
      setUserTemplates(newTemplates);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTemplates));
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      // Still remove from local state
      const newTemplates = userTemplates.filter((t) => t.id !== templateId);
      setUserTemplates(newTemplates);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTemplates));
      return true;
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormDocType(documentTypes[0]);
    setFormCategory(categories[0]);
    setFormDescription("");
    setFormBody("");
    setFormError("");
    setUploadedFileName("");
    setSkipHeader(false);
    setHeaderLinesToSkip(3);
    setSkipFooter(false);
    setFooterLinesToSkip(2);
    setUseAppHeader(true);
    setAutoDetectPlaceholders(true);
    setIsPinned(false);
    setTemplateTags([]);
    setTagInput("");
    setIsDocuSignReady(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Extract text from Word document
  const extractTextFromWord = async (file: File): Promise<string> => {
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error("Mammoth error:", error);
      throw new Error("Could not read Word document. Make sure it's a valid .docx file.");
    }
  };

  // Extract text from PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Use dynamic import for pdf.js v4
      const pdfjsLib = await import("pdfjs-dist");
      
      // Configure worker - using unpkg CDN (more reliable for npm packages)
      const PDFJS_VERSION = "4.0.379";
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
      
      console.log("PDF.js version:", PDFJS_VERSION);
      console.log("Loading PDF file:", file.name, "Size:", file.size, "bytes");
      
      const arrayBuffer = await file.arrayBuffer();
      console.log("ArrayBuffer created, size:", arrayBuffer.byteLength);
      
      // Load document
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0, // Reduce console noise
      });
      
      console.log("Loading task created, waiting for PDF...");
      const pdf = await loadingTask.promise;
      console.log("PDF loaded successfully. Pages:", pdf.numPages);
      
      if (pdf.numPages === 0) {
        throw new Error("PDF has no pages");
      }
      
      let fullText = "";
      let pagesWithText = 0;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Extract text items with proper spacing
          const pageText = textContent.items
            .filter((item: any) => item.str && item.str.trim())
            .map((item: any) => item.str)
            .join(" ");
          
          if (pageText.trim()) {
            fullText += pageText + "\n\n";
            pagesWithText++;
          }
          
          console.log(`Page ${i}: ${pageText.length} characters extracted`);
        } catch (pageError) {
          console.warn(`Error reading page ${i}:`, pageError);
        }
      }
      
      console.log(`Total extraction: ${fullText.length} characters from ${pagesWithText}/${pdf.numPages} pages`);
      
      if (!fullText.trim()) {
        throw new Error("NO_TEXT_CONTENT");
      }
      
      return fullText.trim();
    } catch (pdfJsError: any) {
      console.error("PDF.js error details:", {
        name: pdfJsError?.name,
        message: pdfJsError?.message,
        stack: pdfJsError?.stack?.slice(0, 500),
      });
      
      // Provide specific error messages
      if (pdfJsError.message === "NO_TEXT_CONTENT") {
        throw new Error("This PDF appears to be image-based (scanned) and doesn't contain extractable text. Please use a text-based PDF or paste the content manually.");
      }
      
      if (pdfJsError.message?.includes("Invalid PDF")) {
        throw new Error("Invalid or corrupted PDF file. Please try a different file.");
      }
      
      if (pdfJsError.message?.includes("Password")) {
        throw new Error("This PDF is password protected. Please remove the password and try again.");
      }
      
      if (pdfJsError.name === "MissingPDFException") {
        throw new Error("Could not read PDF file. The file may be corrupted.");
      }
      
      throw new Error(`Could not read PDF: ${pdfJsError.message || "Unknown error"}. Try a different file or paste content manually.`);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isDocx = fileName.endsWith(".docx");
    const isDoc = fileName.endsWith(".doc");
    const isPDF = fileName.endsWith(".pdf");

    if (!isDocx && !isDoc && !isPDF) {
      setFormError("Please upload a .docx or .pdf file");
      return;
    }

    // .doc format (old Word) is not supported
    if (isDoc) {
      setFormError("Old .doc format is not supported. Please save as .docx and try again, or paste the content manually.");
      return;
    }

    setIsProcessing(true);
    setFormError("");
    setUploadedFileName(file.name);

    try {
      let extractedText = "";

      if (isDocx) {
        extractedText = await extractTextFromWord(file);
      } else if (isPDF) {
        extractedText = await extractTextFromPDF(file);
      }

      if (!extractedText.trim()) {
        setFormError("Could not extract text from the file. The file may be empty or image-based (scanned).");
        setUploadedFileName("");
        return;
      }

      // Clean up extracted text - preserve line breaks for header skipping
      extractedText = extractedText
        .replace(/[ \t]+/g, " ")  // Collapse spaces/tabs but keep newlines
        .replace(/\n{3,}/g, "\n\n")  // Max 2 consecutive newlines
        .trim();

      // Skip header lines if enabled
      if (skipHeader && headerLinesToSkip > 0) {
        const lines = extractedText.split("\n");
        if (lines.length > headerLinesToSkip) {
          extractedText = lines.slice(headerLinesToSkip).join("\n").trim();
          console.log(`Skipped ${headerLinesToSkip} header lines`);
        }
      }
      
      // Skip footer lines if enabled
      if (skipFooter && footerLinesToSkip > 0) {
        const lines = extractedText.split("\n");
        if (lines.length > footerLinesToSkip) {
          extractedText = lines.slice(0, -footerLinesToSkip).join("\n").trim();
          console.log(`Skipped ${footerLinesToSkip} footer lines`);
        }
      }
      
      // Auto-detect and highlight placeholders
      if (autoDetectPlaceholders) {
        // Find patterns like names, dates, company names and suggest as placeholders
        const patterns = [
          { regex: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi, replacement: "[Date]" },
          { regex: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, replacement: "[Date]" },
          { regex: /\$[\d,]+(?:\.\d{2})?/g, replacement: "[Amount]" },
          { regex: /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+(?:Jr\.|Sr\.|III|IV|II))?\b/g, replacement: "[Name]" },
        ];
        
        let detectedCount = 0;
        patterns.forEach(({ regex, replacement }) => {
          const matches = extractedText.match(regex);
          if (matches) {
            detectedCount += matches.length;
          }
        });
        
        if (detectedCount > 0) {
          console.log(`Auto-detected ${detectedCount} potential placeholders`);
        }
      }

      // Set form values
      setFormBody(extractedText);
      
      // Auto-fill name from filename if empty
      if (!formName) {
        const nameWithoutExt = file.name.replace(/\.(docx?|pdf)$/i, "");
        setFormName(nameWithoutExt);
      }

    } catch (error: any) {
      console.error("Error processing file:", error);
      const errorMessage = error?.message || "Error processing file. Please try a different file or paste the content manually.";
      setFormError(errorMessage);
      setUploadedFileName("");
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCreateTemplate = async () => {
    // Validation
    if (!formName.trim()) {
      setFormError("Template name is required");
      return;
    }
    if (!formBody.trim()) {
      setFormError("Template content is required");
      return;
    }
    if (formBody.trim().length < 50) {
      setFormError("Template content should be at least 50 characters");
      return;
    }

    const templateData = {
      name: formName.trim(),
      documentType: formDocType,
      bodyText: formBody.trim(),
      description: formDescription.trim() || `Custom ${formDocType.toLowerCase()} template`,
      category: formCategory,
      useAppHeader: useAppHeader,
      isPinned: isPinned,
      tags: templateTags,
      isDocuSignReady: isDocuSignReady,
    };

    const success = await saveTemplate(templateData);
    if (success) {
      resetForm();
      setShowCreateForm(false);
    } else {
      setFormError("Failed to save template. Please try again.");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
    setDeleteConfirm(null);
  };

  const getFilteredTemplates = () => {
    let templates: DocumentTemplate[];
    switch (activeTab) {
      case "builtin":
        templates = documentTemplates;
        break;
      case "custom":
        templates = userTemplates;
        break;
      default:
        templates = [...documentTemplates, ...userTemplates];
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.documentType.toLowerCase().includes(query)
      );
    }
    
    return templates;
  };

  const filteredTemplates = getFilteredTemplates();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl shadow-[#a78bfa]/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">Templates</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="px-3 py-1.5 text-sm bg-[#1a1a24] border border-[#2a2a3a] rounded-lg text-[#fafafa] placeholder-[#666680] focus:border-[#a78bfa] focus:shadow-lg focus:shadow-[#a78bfa]/20 focus:outline-none w-48 transition-all"
            />
            <button
              onClick={onClose}
              className="text-[#666666] hover:text-[#fafafa] transition-colors text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs and Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white shadow-lg shadow-[#a78bfa]/25"
                    : "text-[#666680] hover:text-[#a78bfa] hover:bg-[#a78bfa]/10"
                }`}
              >
                All ({documentTemplates.length + userTemplates.length})
              </button>
              <button
                onClick={() => setActiveTab("builtin")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  activeTab === "builtin"
                    ? "bg-[#4ecdc4] text-[#0a0a12] shadow-lg shadow-[#4ecdc4]/25"
                    : "text-[#666680] hover:text-[#4ecdc4] hover:bg-[#4ecdc4]/10"
                }`}
              >
                Built-in ({documentTemplates.length})
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  activeTab === "custom"
                    ? "bg-[#f0b866] text-[#0a0a12] shadow-lg shadow-[#f0b866]/25"
                    : "text-[#666680] hover:text-[#f0b866] hover:bg-[#f0b866]/10"
                }`}
              >
                My Templates ({userTemplates.length})
              </button>
            </div>
            {/* Storage indicator */}
            <span className={`text-xs px-2 py-1 rounded-full ${
              storageMode === "cloud" 
                ? "bg-[#4ade80]/20 text-[#4ade80]" 
                : "bg-[#fbbf24]/20 text-[#fbbf24]"
            }`}>
              {storageMode === "cloud" ? "☁️ Cloud Synced" : "💾 Local Only"}
            </span>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateForm(true);
            }}
            disabled={isSaving}
            className="px-3 py-1.5 text-sm bg-[#d4a373] text-[#0f0f0f] rounded hover:bg-[#e5b888] transition-colors disabled:opacity-50"
          >
            + New Template
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {showCreateForm ? (
            /* Create Template Form */
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg text-[#fafafa]">Create New Template</h3>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(false);
                  }}
                  className="text-sm text-[#666666] hover:text-[#a0a0a0]"
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-[#f87171]/10 border border-[#f87171]/20 rounded-lg text-sm text-[#f87171]">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm text-[#666666] mb-2">
                    Upload Document
                  </label>
                  <div 
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isProcessing 
                        ? "border-[#d4a373] bg-[#d4a373]/5" 
                        : "border-[#2a2a2a] hover:border-[#3a3a3a]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".doc,.docx,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isProcessing}
                    />
                    {isProcessing ? (
                      <div className="text-[#d4a373]">
                        <div className="mb-2">Processing...</div>
                        <div className="text-sm text-[#666666]">{uploadedFileName}</div>
                      </div>
                    ) : uploadedFileName ? (
                      <div>
                        <div className="text-[#4ade80] mb-1">File loaded</div>
                        <div className="text-sm text-[#a0a0a0]">{uploadedFileName}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFileName("");
                            setFormBody("");
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="mt-2 text-xs text-[#666666] hover:text-[#a0a0a0]"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[#a0a0a0] mb-1">
                          Drop a file here or click to upload
                        </div>
                        <div className="text-sm text-[#666666]">
                          Supports .docx and .pdf files
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Skip Header Option */}
                  <div className="mt-3 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skipHeader}
                        onChange={(e) => setSkipHeader(e.target.checked)}
                        className="w-4 h-4 rounded border-[#2a2a2a] bg-[#1a1a24] text-[#a78bfa] focus:ring-[#a78bfa] focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-sm text-[#a0a0a0]">Skip header lines</span>
                    </label>
                    {skipHeader && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={headerLinesToSkip}
                          onChange={(e) => setHeaderLinesToSkip(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                          className="w-16 px-2 py-1 text-sm rounded bg-[#1a1a24] border border-[#2a2a2a] text-[#fafafa] focus:border-[#a78bfa] focus:outline-none"
                        />
                        <span className="text-xs text-[#666666]">lines to skip</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Skip Footer Toggle */}
                  <div className="mt-3 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skipFooter}
                        onChange={(e) => setSkipFooter(e.target.checked)}
                        className="w-4 h-4 rounded border-[#2a2a2a] bg-[#1a1a24] text-[#f472b6] focus:ring-[#f472b6] focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-sm text-[#a0a0a0]">Skip footer lines</span>
                    </label>
                    {skipFooter && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={footerLinesToSkip}
                          onChange={(e) => setFooterLinesToSkip(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                          className="w-16 px-2 py-1 text-sm rounded bg-[#1a1a24] border border-[#2a2a2a] text-[#fafafa] focus:border-[#f472b6] focus:outline-none"
                        />
                        <span className="text-xs text-[#666666]">lines to skip</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Template Options Grid */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {/* Use App Header */}
                    <div className="p-3 rounded-lg bg-[#1a1a24]/50 border border-[#2a2a3a] hover:border-[#4ecdc4]/50 transition-colors">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useAppHeader}
                          onChange={(e) => setUseAppHeader(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-[#2a2a2a] bg-[#1a1a24] text-[#4ecdc4] focus:ring-[#4ecdc4] focus:ring-offset-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-sm text-[#fafafa]">🖼️ Use App Header</span>
                          <p className="text-xs text-[#666666] mt-0.5">
                            Apply company header image
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {/* DocuSign Ready */}
                    <div className="p-3 rounded-lg bg-[#1a1a24]/50 border border-[#2a2a3a] hover:border-[#a78bfa]/50 transition-colors">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDocuSignReady}
                          onChange={(e) => setIsDocuSignReady(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-[#2a2a2a] bg-[#1a1a24] text-[#a78bfa] focus:ring-[#a78bfa] focus:ring-offset-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-sm text-[#fafafa]">✍️ DocuSign Ready</span>
                          <p className="text-xs text-[#666666] mt-0.5">
                            Include signature placeholders
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {/* Auto-detect Placeholders */}
                    <div className="p-3 rounded-lg bg-[#1a1a24]/50 border border-[#2a2a3a] hover:border-[#f0b866]/50 transition-colors">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoDetectPlaceholders}
                          onChange={(e) => setAutoDetectPlaceholders(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-[#2a2a2a] bg-[#1a1a24] text-[#f0b866] focus:ring-[#f0b866] focus:ring-offset-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-sm text-[#fafafa]">🔍 Auto-detect</span>
                          <p className="text-xs text-[#666666] mt-0.5">
                            Find dates, names, amounts
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {/* Pin Template */}
                    <div className="p-3 rounded-lg bg-[#1a1a24]/50 border border-[#2a2a3a] hover:border-[#f87171]/50 transition-colors">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPinned}
                          onChange={(e) => setIsPinned(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-[#2a2a2a] bg-[#1a1a24] text-[#f87171] focus:ring-[#f87171] focus:ring-offset-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-sm text-[#fafafa]">📌 Pin Template</span>
                          <p className="text-xs text-[#666666] mt-0.5">
                            Show in quick access
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Tags Input */}
                  <div className="mt-4">
                    <label className="block text-sm text-[#666666] mb-2">🏷️ Tags (for organization)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {templateTags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[#a78bfa]/20 text-[#a78bfa]"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => setTemplateTags(templateTags.filter((_, i) => i !== index))}
                            className="hover:text-[#f87171] transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && tagInput.trim()) {
                            e.preventDefault();
                            if (!templateTags.includes(tagInput.trim().toLowerCase())) {
                              setTemplateTags([...templateTags, tagInput.trim().toLowerCase()]);
                            }
                            setTagInput("");
                          }
                        }}
                        placeholder="Add tag and press Enter"
                        className="flex-1 px-3 py-1.5 text-sm rounded bg-[#1a1a24] border border-[#2a2a2a] text-[#fafafa] placeholder-[#666666] focus:border-[#a78bfa] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tagInput.trim() && !templateTags.includes(tagInput.trim().toLowerCase())) {
                            setTemplateTags([...templateTags, tagInput.trim().toLowerCase()]);
                            setTagInput("");
                          }
                        }}
                        className="px-3 py-1.5 text-sm rounded bg-[#2a2a3a] text-[#a0a0a0] hover:bg-[#3a3a4a] hover:text-[#fafafa] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {["contract", "hr", "legal", "sales", "onboarding", "finance"].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            if (!templateTags.includes(suggestion)) {
                              setTemplateTags([...templateTags, suggestion]);
                            }
                          }}
                          disabled={templateTags.includes(suggestion)}
                          className="px-2 py-0.5 text-xs rounded bg-[#2a2a3a]/50 text-[#666666] hover:bg-[#2a2a3a] hover:text-[#a0a0a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                  <span className="text-sm text-[#666666]">or type manually</span>
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                </div>

                <div>
                  <label className="block text-sm text-[#666666] mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      setFormError("");
                    }}
                    placeholder="e.g., Formal Business Letter"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#242424] border border-[#2a2a2a] text-[#fafafa] placeholder-[#666666] focus:border-[#d4a373] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#666666] mb-1">
                      Document Type
                    </label>
                    <select
                      value={formDocType}
                      onChange={(e) => setFormDocType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#242424] border border-[#2a2a2a] text-[#fafafa] focus:border-[#d4a373] focus:outline-none cursor-pointer"
                    >
                      {documentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#666666] mb-1">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#242424] border border-[#2a2a2a] text-[#fafafa] focus:border-[#d4a373] focus:outline-none cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#666666] mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description of this template"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#242424] border border-[#2a2a2a] text-[#fafafa] placeholder-[#666666] focus:border-[#d4a373] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-[#666666]">
                      Template Content *
                    </label>
                    {formBody && (
                      <span className="text-xs text-[#666666]">
                        {formBody.length} characters
                      </span>
                    )}
                  </div>
                  <textarea
                    value={formBody}
                    onChange={(e) => {
                      setFormBody(e.target.value);
                      setFormError("");
                    }}
                    rows={10}
                    placeholder="Enter your template text or upload a document above. Use [brackets] for placeholder text."
                    className="w-full px-4 py-3 rounded-lg bg-[#242424] border border-[#2a2a2a] text-[#fafafa] placeholder-[#666666] focus:border-[#d4a373] focus:outline-none resize-y"
                  />
                  <p className="mt-1 text-xs text-[#666666]">
                    Tip: Use [Name], [Date], [Company], etc. as placeholders
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCreateTemplate}
                    disabled={isProcessing || isSaving}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-[#a78bfa]/30 transition-all font-medium disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Create Template"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowCreateForm(false);
                    }}
                    disabled={isSaving}
                    className="px-4 py-2.5 bg-[#242424] text-[#fafafa] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="animate-spin h-8 w-8 text-[#a78bfa] mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-[#666666]">Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[#666666] mb-4">
                {activeTab === "custom"
                  ? "No shared templates yet. Be the first to create one!"
                  : "No templates found."}
              </p>
              {activeTab === "custom" && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(true);
                  }}
                  className="px-4 py-2 text-sm bg-[#d4a373] text-[#0f0f0f] rounded-lg hover:bg-[#e5b888] transition-colors"
                >
                  Create Your First Template
                </button>
              )}
            </div>
          ) : (
            /* Template Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemplates.map((template) => {
                const isSharedTemplate = template.id.startsWith("shared-");
                const isLocalTemplate = template.id.startsWith("local-") || template.id.startsWith("user-");
                const isUserTemplate = isSharedTemplate || isLocalTemplate;
                const isDeleting = deleteConfirm === template.id;

                return (
                  <div
                    key={template.id}
                    className={`p-4 rounded-xl border transition-all hover:shadow-lg ${
                      isDeleting
                        ? "bg-[#f87171]/10 border-[#f87171]/30"
                        : isUserTemplate 
                          ? "bg-[#1a1a24] border-[#f0b866]/30 hover:border-[#f0b866] hover:shadow-[#f0b866]/10"
                          : "bg-[#1a1a24] border-[#4ecdc4]/30 hover:border-[#4ecdc4] hover:shadow-[#4ecdc4]/10"
                    }`}
                  >
                    {isDeleting ? (
                      /* Delete Confirmation */
                      <div>
                        <p className="text-sm text-[#fafafa] mb-3">
                          Delete &ldquo;{template.name}&rdquo;?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="px-3 py-1.5 text-sm bg-[#f87171] text-white rounded hover:bg-[#ef4444] transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#fafafa] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Template Card */
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-[#fafafa] font-medium">
                            {template.name}
                          </h3>
                          {isUserTemplate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(template.id);
                              }}
                              className="text-[#666666] hover:text-[#f87171] transition-colors text-sm"
                              title="Delete template"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-[#666666] mb-2 line-clamp-2">
                          {template.description}
                        </p>
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {template.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2a3a] text-[#888]">
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2a3a] text-[#666]">
                                +{template.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="text-xs px-2 py-0.5 bg-[#a78bfa]/20 text-[#a78bfa] rounded-full">
                              {template.category}
                            </span>
                            {isSharedTemplate && (
                              <span className="text-xs px-2 py-0.5 bg-[#4ade80]/20 text-[#4ade80] rounded-full">
                                ☁️ Shared
                              </span>
                            )}
                            {isLocalTemplate && (
                              <span className="text-xs px-2 py-0.5 bg-[#fbbf24]/20 text-[#fbbf24] rounded-full">
                                💾 Local
                              </span>
                            )}
                            {template.useAppHeader && (
                              <span className="text-xs px-2 py-0.5 bg-[#4ecdc4]/20 text-[#4ecdc4] rounded-full">
                                🖼️ Header
                              </span>
                            )}
                            {template.isDocuSignReady && (
                              <span className="text-xs px-2 py-0.5 bg-[#a78bfa]/20 text-[#a78bfa] rounded-full">
                                ✍️ Sign
                              </span>
                            )}
                            {template.isPinned && (
                              <span className="text-xs px-2 py-0.5 bg-[#f87171]/20 text-[#f87171] rounded-full">
                                📌
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              onSelectTemplate(template);
                              onClose();
                            }}
                            className="text-sm px-3 py-1 rounded-full bg-[#4ecdc4]/20 text-[#4ecdc4] hover:bg-[#4ecdc4] hover:text-[#0a0a12] transition-all"
                          >
                            Use →
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
