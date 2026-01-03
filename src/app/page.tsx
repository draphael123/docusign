"use client";

import { useState, useEffect } from "react";
import { signatories } from "@/data/signatories";
import { generatePDF } from "@/lib/pdfGenerator";
import { Toaster, toast } from "react-hot-toast";
import { format } from "date-fns";

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

interface DraftData {
  documentType: string;
  selectedSignatory: string;
  bodyText: string;
  date: string;
  recipientName: string;
  recipientTitle: string;
  recipientAddress: string;
  subject: string;
  customSignatoryName: string;
  customSignatoryTitle: string;
  customSignatoryCompany: string;
  customSignatoryPhone: string;
  customSignatoryEmail: string;
  fontSize: number;
  lineSpacing: number;
}

export default function Home() {
  const [documentType, setDocumentType] = useState<string>("Letter of Recommendation");
  const [selectedSignatory, setSelectedSignatory] = useState<string>(
    signatories[0].id
  );
  const [useCustomSignatory, setUseCustomSignatory] = useState<boolean>(false);
  const [customSignatoryName, setCustomSignatoryName] = useState<string>("");
  const [customSignatoryTitle, setCustomSignatoryTitle] = useState<string>("");
  const [customSignatoryCompany, setCustomSignatoryCompany] = useState<string>("");
  const [customSignatoryPhone, setCustomSignatoryPhone] = useState<string>("");
  const [customSignatoryEmail, setCustomSignatoryEmail] = useState<string>("");
  const [bodyText, setBodyText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGeneratingText, setIsGeneratingText] = useState<boolean>(false);
  const [showAiOption, setShowAiOption] = useState<boolean>(false);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientTitle, setRecipientTitle] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(11);
  const [lineSpacing, setLineSpacing] = useState<number>(1.5);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Character and word count
  const characterCount = bodyText.length;
  const wordCount = bodyText.trim() ? bodyText.trim().split(/\s+/).length : 0;

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("documentDraft");
    if (savedDraft) {
      try {
        const draft: DraftData = JSON.parse(savedDraft);
        setDocumentType(draft.documentType || "Letter of Recommendation");
        setSelectedSignatory(draft.selectedSignatory || signatories[0].id);
        setBodyText(draft.bodyText || "");
        setDate(draft.date || format(new Date(), "yyyy-MM-dd"));
        setRecipientName(draft.recipientName || "");
        setRecipientTitle(draft.recipientTitle || "");
        setRecipientAddress(draft.recipientAddress || "");
        setSubject(draft.subject || "");
        setCustomSignatoryName(draft.customSignatoryName || "");
        setCustomSignatoryTitle(draft.customSignatoryTitle || "");
        setUseCustomSignatory(!!draft.customSignatoryName);
        setFontSize(draft.fontSize || 11);
        setLineSpacing(draft.lineSpacing || 1.5);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const draft: DraftData = {
      documentType,
      selectedSignatory,
      bodyText,
      date,
      recipientName,
      recipientTitle,
      recipientAddress,
      subject,
      customSignatoryName,
      customSignatoryTitle,
      customSignatoryCompany,
      customSignatoryPhone,
      customSignatoryEmail,
      fontSize,
      lineSpacing,
    };
    localStorage.setItem("documentDraft", JSON.stringify(draft));
  }, [
    documentType,
    selectedSignatory,
    bodyText,
    date,
    recipientName,
    recipientTitle,
    recipientAddress,
    subject,
    customSignatoryName,
    customSignatoryTitle,
    customSignatoryCompany,
    customSignatoryPhone,
    customSignatoryEmail,
    fontSize,
    lineSpacing,
  ]);

  const handleSaveDraft = () => {
    const draft: DraftData = {
      documentType,
      selectedSignatory,
      bodyText,
      date,
      recipientName,
      recipientTitle,
      recipientAddress,
      subject,
      customSignatoryName,
      customSignatoryTitle,
      customSignatoryCompany,
      customSignatoryPhone,
      customSignatoryEmail,
      fontSize,
      lineSpacing,
    };
    localStorage.setItem("documentDraft", JSON.stringify(draft));
    toast.success("Draft saved successfully!");
  };

  const handleLoadDraft = () => {
    const savedDraft = localStorage.getItem("documentDraft");
    if (savedDraft) {
      try {
        const draft: DraftData = JSON.parse(savedDraft);
        setDocumentType(draft.documentType || "Letter of Recommendation");
        setSelectedSignatory(draft.selectedSignatory || signatories[0].id);
        setBodyText(draft.bodyText || "");
        setDate(draft.date || format(new Date(), "yyyy-MM-dd"));
        setRecipientName(draft.recipientName || "");
        setRecipientTitle(draft.recipientTitle || "");
        setRecipientAddress(draft.recipientAddress || "");
        setSubject(draft.subject || "");
        setCustomSignatoryName(draft.customSignatoryName || "");
        setCustomSignatoryTitle(draft.customSignatoryTitle || "");
        setUseCustomSignatory(!!draft.customSignatoryName);
        setFontSize(draft.fontSize || 11);
        setLineSpacing(draft.lineSpacing || 1.5);
        toast.success("Draft loaded successfully!");
      } catch (error) {
        toast.error("Error loading draft");
      }
    } else {
      toast.error("No draft found");
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem("documentDraft");
    setDocumentType("Letter of Recommendation");
    setSelectedSignatory(signatories[0].id);
    setBodyText("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setRecipientName("");
    setRecipientTitle("");
    setRecipientAddress("");
    setSubject("");
    setCustomSignatoryName("");
    setCustomSignatoryTitle("");
    setCustomSignatoryCompany("");
    setCustomSignatoryPhone("");
    setCustomSignatoryEmail("");
    setUseCustomSignatory(false);
    setFontSize(11);
    setLineSpacing(1.5);
    toast.success("Draft cleared!");
  };

  const handleGenerateText = async (action: "generate" | "regenerate" | "improve" = "generate") => {
    if (!aiPrompt.trim() && action !== "regenerate") {
      toast.error("Please enter a prompt for text generation");
      return;
    }

    setIsGeneratingText(true);
    try {
      const promptText = action === "regenerate" 
        ? "Regenerate the following text with similar content but different wording: " + bodyText
        : action === "improve"
        ? "Improve and enhance the following text while maintaining its meaning: " + bodyText
        : aiPrompt;

      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptText,
          documentType: documentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate text");
      }

      if (data.success && data.text) {
        setBodyText(data.text);
        if (action === "generate") {
          setShowAiOption(false);
          setAiPrompt("");
        }
        toast.success("Text generated successfully!");
      } else {
        throw new Error("No text generated");
      }
    } catch (error: any) {
      console.error("Error generating text:", error);
      toast.error(error.message || "Error generating text. Please try again.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handlePreviewPDF = async () => {
    if (!bodyText.trim()) {
      toast.error("Please enter document body text");
      return;
    }

    setIsGenerating(true);
    try {
      const signatory = useCustomSignatory
        ? { 
            name: customSignatoryName, 
            title: customSignatoryTitle,
            company: customSignatoryCompany,
            phone: customSignatoryPhone,
            email: customSignatoryEmail,
          }
        : signatories.find((s) => s.id === selectedSignatory);

      if (!signatory || !signatory.name) {
        throw new Error("Signatory information is required");
      }

      const pdfBlob = await generatePDF({
        documentType,
        bodyText,
        signatoryName: signatory.name,
        signatoryTitle: signatory.title,
        signatoryCompany: signatory.company,
        signatoryPhone: signatory.phone,
        signatoryEmail: signatory.email,
        date,
        recipientName,
        recipientTitle,
        recipientAddress,
        subject,
        fontSize,
        lineSpacing,
      });

      const url = URL.createObjectURL(pdfBlob);
      setPreviewUrl(url);
      setShowPreview(true);
      toast.success("PDF preview generated!");
    } catch (error: any) {
      console.error("Error generating PDF preview:", error);
      toast.error(error.message || "Error generating PDF preview. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!bodyText.trim()) {
      toast.error("Please enter document body text");
      return;
    }

    setIsGenerating(true);
    try {
      const signatory = useCustomSignatory
        ? { name: customSignatoryName, title: customSignatoryTitle }
        : signatories.find((s) => s.id === selectedSignatory);

      if (!signatory || !signatory.name) {
        throw new Error("Signatory information is required");
      }

      // Generate PDF
      const pdfBlob = await generatePDF({
        documentType,
        bodyText,
        signatoryName: signatory.name,
        signatoryTitle: signatory.title,
        signatoryCompany: signatory.company,
        signatoryPhone: signatory.phone,
        signatoryEmail: signatory.email,
        date,
        recipientName,
        recipientTitle,
        recipientAddress,
        subject,
        fontSize,
        lineSpacing,
      });

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `${documentType.replace(/\s+/g, "-")}-${signatory.name.replace(/\s+/g, "-")}-${dateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF generated and downloaded successfully!");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error(error.message || "Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Document Template Generator
                </h1>
                <p className="text-sm text-gray-600">
                  Generate PDF templates ready to upload to DocuSign
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleLoadDraft}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Load Draft
                </button>
                <button
                  onClick={handleClearDraft}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Document Type Dropdown */}
              <div>
                <label
                  htmlFor="documentType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Document Type
                </label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Field */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Document Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setDate(format(new Date(), "yyyy-MM-dd"))}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Recipient Information */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Recipient Information (Optional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="recipientName"
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      To (Name)
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Recipient name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="recipientTitle"
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="recipientTitle"
                      value={recipientTitle}
                      onChange={(e) => setRecipientTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Recipient title"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="recipientAddress"
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      Address
                    </label>
                    <textarea
                      id="recipientAddress"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Recipient address"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="subject"
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      Subject (Optional)
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Document subject"
                    />
                  </div>
                </div>
              </div>

              {/* Signatory Radio Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signatory
                </label>
                <div className="space-y-2">
                  {signatories.map((signatory) => (
                    <label
                      key={signatory.id}
                      className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="signatory"
                        value={signatory.id}
                        checked={!useCustomSignatory && selectedSignatory === signatory.id}
                        onChange={(e) => {
                          setSelectedSignatory(e.target.value);
                          setUseCustomSignatory(false);
                        }}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {signatory.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {signatory.title}
                        </div>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="signatory"
                      checked={useCustomSignatory}
                      onChange={() => setUseCustomSignatory(true)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Custom Signatory</div>
                      {useCustomSignatory && (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={customSignatoryName}
                            onChange={(e) => setCustomSignatoryName(e.target.value)}
                            placeholder="Name"
                            className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                          <input
                            type="text"
                            value={customSignatoryTitle}
                            onChange={(e) => setCustomSignatoryTitle(e.target.value)}
                            placeholder="Title"
                            className="px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* PDF Formatting Options */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Formatting Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="fontSize"
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      Font Size: {fontSize}pt
                    </label>
                    <input
                      type="range"
                      id="fontSize"
                      min="9"
                      max="14"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lineSpacing"
                      className="block text-xs font-medium text-gray-600 mb-1"
                    >
                      Line Spacing: {lineSpacing.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      id="lineSpacing"
                      min="1"
                      max="2.5"
                      step="0.1"
                      value={lineSpacing}
                      onChange={(e) => setLineSpacing(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* AI Text Generation Option */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Document Body
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAiOption(!showAiOption)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAiOption ? "Hide AI Generator" : "Use AI to Generate Text"}
                  </button>
                </div>

                {showAiOption ? (
                  <div className="space-y-3 mb-3 p-4 bg-blue-50 rounded-md">
                    <div>
                      <label
                        htmlFor="aiPrompt"
                        className="block text-xs font-medium text-gray-600 mb-1"
                      >
                        Describe what you want in the document:
                      </label>
                      <textarea
                        id="aiPrompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 'Write a letter of recommendation for John Doe, a software engineer with 5 years of experience, highlighting his technical skills and leadership abilities...'"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateText("generate")}
                        disabled={isGeneratingText || !aiPrompt.trim()}
                        className="flex-1 min-w-[120px] bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingText ? "Generating..." : "Generate Text"}
                      </button>
                      {bodyText && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleGenerateText("regenerate")}
                            disabled={isGeneratingText}
                            className="flex-1 min-w-[120px] bg-green-500 text-white py-2 px-4 rounded-md font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGeneratingText ? "Regenerating..." : "Regenerate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateText("improve")}
                            disabled={isGeneratingText}
                            className="flex-1 min-w-[120px] bg-green-500 text-white py-2 px-4 rounded-md font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGeneratingText ? "Improving..." : "Improve Text"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}

                <textarea
                  id="bodyText"
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter the document body text here, or use AI to generate it..."
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>{wordCount} words</span>
                  <span>{characterCount} characters</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handlePreviewPDF}
                  disabled={isGenerating || !bodyText.trim()}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? "Generating..." : "Preview PDF"}
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating || !bodyText.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? "Generating PDF..." : "Generate & Download PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">PDF Preview</h2>
              <button
                onClick={() => {
                  setShowPreview(false);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <iframe
                src={previewUrl}
                className="w-full h-full min-h-[600px] border"
                title="PDF Preview"
              />
            </div>
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = previewUrl;
                  const dateStr = new Date().toISOString().split('T')[0];
                  const signatory = useCustomSignatory
                    ? { name: customSignatoryName, title: customSignatoryTitle }
                    : signatories.find((s) => s.id === selectedSignatory);
                  link.download = `${documentType.replace(/\s+/g, "-")}-${signatory?.name.replace(/\s+/g, "-") || "document"}-${dateStr}.pdf`;
                  link.click();
                  toast.success("PDF downloaded!");
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Download PDF
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
