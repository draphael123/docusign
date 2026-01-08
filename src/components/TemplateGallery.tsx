"use client";

import { useState, useEffect, useRef } from "react";
import { documentTemplates, DocumentTemplate } from "@/data/templates";

interface TemplateGalleryProps {
  onSelectTemplate: (template: DocumentTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "userTemplates";

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

  // Load user templates from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setUserTemplates(JSON.parse(stored));
        } catch (e) {
          console.error("Error loading user templates:", e);
        }
      }
    }
  }, []);

  // Save user templates to localStorage
  const saveUserTemplates = (templates: DocumentTemplate[]) => {
    setUserTemplates(templates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  };

  const resetForm = () => {
    setFormName("");
    setFormDocType(documentTypes[0]);
    setFormCategory(categories[0]);
    setFormDescription("");
    setFormBody("");
    setFormError("");
    setUploadedFileName("");
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
      const pdfjsLib = await import("pdfjs-dist");
      
      // Disable worker for simpler, more reliable operation
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = "";
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Load document with useWorkerFetch disabled
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });
      
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter((item: any) => item.str)
            .map((item: any) => item.str)
            .join(" ");
          fullText += pageText + "\n\n";
        } catch (pageError) {
          console.warn(`Error reading page ${i}:`, pageError);
        }
      }
      
      if (!fullText.trim()) {
        throw new Error("No text content found");
      }
      
      return fullText.trim();
    } catch (pdfJsError: any) {
      console.error("PDF.js error:", pdfJsError);
      
      // Provide helpful error message
      if (pdfJsError.message?.includes("Invalid PDF")) {
        throw new Error("Invalid PDF file. Please make sure the file is not corrupted.");
      }
      
      throw new Error("Could not read PDF. The file may be image-based (scanned) or corrupted. Try a text-based PDF or paste content manually.");
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

      // Clean up extracted text
      extractedText = extractedText
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();

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

  const handleCreateTemplate = () => {
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

    const newTemplate: DocumentTemplate = {
      id: `user-${Date.now()}`,
      name: formName.trim(),
      documentType: formDocType,
      bodyText: formBody.trim(),
      description: formDescription.trim() || `Custom ${formDocType.toLowerCase()} template`,
      category: formCategory,
    };

    saveUserTemplates([...userTemplates, newTemplate]);
    resetForm();
    setShowCreateForm(false);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = userTemplates.filter((t) => t.id !== id);
    saveUserTemplates(updated);
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
          <button
            onClick={() => {
              resetForm();
              setShowCreateForm(true);
            }}
            className="px-3 py-1.5 text-sm bg-[#d4a373] text-[#0f0f0f] rounded hover:bg-[#e5b888] transition-colors"
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
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white rounded-lg hover:opacity-90 hover:shadow-lg hover:shadow-[#a78bfa]/30 transition-all font-medium disabled:opacity-50"
                  >
                    Create Template
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowCreateForm(false);
                    }}
                    className="px-4 py-2.5 bg-[#242424] text-[#fafafa] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[#666666] mb-4">
                {activeTab === "custom"
                  ? "You haven't created any templates yet."
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
                const isUserTemplate = template.id.startsWith("user-");
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
                        <p className="text-sm text-[#666666] mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <span className="text-xs px-2 py-0.5 bg-[#a78bfa]/20 text-[#a78bfa] rounded-full">
                              {template.category}
                            </span>
                            {isUserTemplate && (
                              <span className="text-xs px-2 py-0.5 bg-[#f0b866]/20 text-[#f0b866] rounded-full">
                                Custom
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
