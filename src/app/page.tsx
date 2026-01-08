"use client";

import { useState, useEffect, useCallback } from "react";
import { signatories } from "@/data/signatories";
import { generatePDF } from "@/lib/pdfGenerator";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { documentTemplates, DocumentTemplate } from "@/data/templates";
import { saveToHistory, DocumentHistoryItem } from "@/utils/documentHistory";
import { updateStats } from "@/utils/statistics";
import TemplateGallery from "@/components/TemplateGallery";
import StatisticsPanel from "@/components/StatisticsPanel";
import DocumentHistory from "@/components/DocumentHistory";
import ProgressIndicator from "@/components/ProgressIndicator";
import UserGuide from "@/components/UserGuide";
import Tooltip from "@/components/Tooltip";
import FavoritesPanel from "@/components/FavoritesPanel";
import Confetti from "@/components/Confetti";
import PrivacySettings from "@/components/PrivacySettings";
import SkipToContent from "@/components/SkipToContent";
import { 
  validateEmail, 
  validatePhone, 
  validateBodyText, 
  validateName,
  getCharacterCount,
  ValidationResult 
} from "@/utils/validation";
import {
  saveLastUsedSettings,
  getLastUsedSettings,
  saveFavorite,
  FavoriteSettings,
} from "@/utils/favorites";

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
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientTitle, setRecipientTitle] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(11);
  const [lineSpacing, setLineSpacing] = useState<number>(1.5);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState<boolean>(false);
  const [showStatistics, setShowStatistics] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState<boolean>(false);

  // DocuSign formatting
  const [docusignMode, setDocusignMode] = useState<boolean>(false);

  // Celebration states
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const lastSavedStr = localStorage.getItem("lastSaved");
      if (lastSavedStr) {
        setLastSaved(new Date(lastSavedStr));
      }
    }
  }, []);

  // Track unsaved changes
  useEffect(() => {
    if (mounted) {
      setHasUnsavedChanges(true);
    }
  }, [
    documentType,
    selectedSignatory,
    bodyText,
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
    mounted,
  ]);

  const handleAutoSave = useCallback(() => {
    const draft: DraftData = {
      documentType,
      selectedSignatory,
      bodyText,
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
    const now = new Date();
    localStorage.setItem("lastSaved", now.toISOString());
    setLastSaved(now);
    setHasUnsavedChanges(false);
  }, [
    documentType,
    selectedSignatory,
    bodyText,
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

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!mounted || !autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && bodyText.trim()) {
        handleAutoSave();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, bodyText, autoSaveEnabled, mounted, handleAutoSave]);

  // Warn about unsaved changes before leaving
  useEffect(() => {
    if (!mounted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && bodyText.trim()) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, bodyText, mounted]);

  // Update "last saved" display every minute
  const [, setRefreshTimestamp] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTimestamp(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Character and word count
  const characterCount = bodyText.length;
  const wordCount = bodyText.trim() ? bodyText.trim().split(/\s+/).length : 0;

  // Progress steps
  const progressSteps = ["Document Type", "Recipient", "Signatory", "Content", "Generate"];

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "s",
      ctrl: true,
      action: () => handleSaveDraft(),
      description: "Save draft",
    },
    {
      key: "p",
      ctrl: true,
      action: () => {
        if (bodyText.trim()) handlePreviewPDF();
      },
      description: "Preview PDF",
    },
    {
      key: "g",
      ctrl: true,
      action: () => {
        if (bodyText.trim()) handleGeneratePDF();
      },
      description: "Generate PDF",
    },
  ]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("documentDraft");
    if (savedDraft) {
      try {
        const draft: DraftData = JSON.parse(savedDraft);
        setDocumentType(draft.documentType || "Letter of Recommendation");
        setSelectedSignatory(draft.selectedSignatory || signatories[0].id);
        setBodyText(draft.bodyText || "");
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
    const now = new Date();
    localStorage.setItem("lastSaved", now.toISOString());
    setLastSaved(now);
    setHasUnsavedChanges(false);
    toast.success("Draft saved");
  };

  const handleLoadDraft = () => {
    const savedDraft = localStorage.getItem("documentDraft");
    if (savedDraft) {
      try {
        const draft: DraftData = JSON.parse(savedDraft);
        setDocumentType(draft.documentType || "Letter of Recommendation");
        setSelectedSignatory(draft.selectedSignatory || signatories[0].id);
        setBodyText(draft.bodyText || "");
        setRecipientName(draft.recipientName || "");
        setRecipientTitle(draft.recipientTitle || "");
        setRecipientAddress(draft.recipientAddress || "");
        setSubject(draft.subject || "");
        setCustomSignatoryName(draft.customSignatoryName || "");
        setCustomSignatoryTitle(draft.customSignatoryTitle || "");
        setCustomSignatoryCompany(draft.customSignatoryCompany || "");
        setCustomSignatoryPhone(draft.customSignatoryPhone || "");
        setCustomSignatoryEmail(draft.customSignatoryEmail || "");
        setUseCustomSignatory(!!draft.customSignatoryName);
        setFontSize(draft.fontSize || 11);
        setLineSpacing(draft.lineSpacing || 1.5);
        setHasUnsavedChanges(false);
        toast.success("Draft loaded");
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
    toast.success("Draft cleared");
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
    } catch (error: any) {
      console.error("Error generating PDF preview:", error);
      toast.error(error.message || "Error generating PDF preview");
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
        recipientName,
        recipientTitle,
        recipientAddress,
        subject,
        fontSize,
        lineSpacing,
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `${documentType.replace(/\s+/g, "-")}-${signatory.name.replace(/\s+/g, "-")}-${dateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const isPrivateMode = localStorage.getItem("privateMode") === "true";
      if (!isPrivateMode) {
        saveToHistory({
          documentType,
          signatoryName: signatory.name,
        });
        const { newAchievements } = updateStats(documentType, signatory.name);
        if (newAchievements.length > 0) {
          setShowConfetti(true);
          newAchievements.forEach((achievement) => {
            toast.success(`Achievement: ${achievement}`, { duration: 5000 });
          });
        }
      }

      saveLastUsedSettings({
        documentType,
        selectedSignatory,
        useCustomSignatory,
        customSignatoryName,
        customSignatoryTitle,
        customSignatoryCompany,
        customSignatoryPhone,
        customSignatoryEmail,
        fontSize,
        lineSpacing,
      });

      toast.success("PDF downloaded");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error(error.message || "Error generating PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setDocumentType(template.documentType);
    setBodyText(template.bodyText);
    toast.success(`Template loaded`);
  };

  const handleLoadFromHistory = (item: DocumentHistoryItem) => {
    setDocumentType(item.documentType);
    const signatory = signatories.find((s) => s.name === item.signatoryName);
    if (signatory) {
      setSelectedSignatory(signatory.id);
      setUseCustomSignatory(false);
    } else {
      setUseCustomSignatory(true);
      setCustomSignatoryName(item.signatoryName);
    }
    toast.success("Document loaded from history");
  };

  const validateField = (fieldName: string, value: string): ValidationResult => {
    switch (fieldName) {
      case "bodyText":
        return validateBodyText(value);
      case "customSignatoryEmail":
        return validateEmail(value);
      case "customSignatoryPhone":
        return validatePhone(value);
      case "customSignatoryName":
        return validateName(value);
      case "recipientName":
        return value ? validateName(value) : { isValid: true };
      default:
        return { isValid: true };
    }
  };

  const handleUseLastSettings = () => {
    const lastUsed = getLastUsedSettings();
    if (lastUsed) {
      setDocumentType(lastUsed.documentType);
      setSelectedSignatory(lastUsed.selectedSignatory);
      setUseCustomSignatory(lastUsed.useCustomSignatory);
      setCustomSignatoryName(lastUsed.customSignatoryName || "");
      setCustomSignatoryTitle(lastUsed.customSignatoryTitle || "");
      setCustomSignatoryCompany(lastUsed.customSignatoryCompany || "");
      setCustomSignatoryPhone(lastUsed.customSignatoryPhone || "");
      setCustomSignatoryEmail(lastUsed.customSignatoryEmail || "");
      setFontSize(lastUsed.fontSize);
      setLineSpacing(lastUsed.lineSpacing);
      toast.success("Settings restored");
    } else {
      toast.error("No previous settings found");
    }
  };

  const handleSaveAsFavorite = () => {
    if (!bodyText.trim()) {
      toast.error("Please enter document content first");
      return;
    }
    
    const favoriteName = prompt("Name this favorite:");
    if (!favoriteName) return;
    
    saveFavorite({
      name: favoriteName,
      documentType,
      selectedSignatory,
      useCustomSignatory,
      customSignatoryName,
      customSignatoryTitle,
      customSignatoryCompany,
      customSignatoryPhone,
      customSignatoryEmail,
      recipientName,
      recipientTitle,
      recipientAddress,
      subject,
      fontSize,
      lineSpacing,
    });
    
    toast.success(`Saved as "${favoriteName}"`);
  };

  const handleLoadFavorite = (favorite: FavoriteSettings) => {
    setDocumentType(favorite.documentType);
    setSelectedSignatory(favorite.selectedSignatory);
    setUseCustomSignatory(favorite.useCustomSignatory);
    setCustomSignatoryName(favorite.customSignatoryName || "");
    setCustomSignatoryTitle(favorite.customSignatoryTitle || "");
    setCustomSignatoryCompany(favorite.customSignatoryCompany || "");
    setCustomSignatoryPhone(favorite.customSignatoryPhone || "");
    setCustomSignatoryEmail(favorite.customSignatoryEmail || "");
    setRecipientName(favorite.recipientName || "");
    setRecipientTitle(favorite.recipientTitle || "");
    setRecipientAddress(favorite.recipientAddress || "");
    setSubject(favorite.subject || "");
    setFontSize(favorite.fontSize);
    setLineSpacing(favorite.lineSpacing);
    toast.success(`Loaded "${favorite.name}"`);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <>
      <SkipToContent />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#242424',
            color: '#fafafa',
            border: '1px solid #2a2a2a',
          },
        }}
      />
      
      <main 
        id="main-content" 
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        role="main"
        tabIndex={-1}
      >
        <div className="max-w-3xl mx-auto animate-fade-in">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl text-[#fafafa] mb-1">
                  Document Generator
                </h1>
                <p className="text-sm text-[#666666]">
                  Create professional PDF documents for DocuSign
                </p>
              </div>
              
              {mounted && lastSaved && (
                <span className="text-xs text-[#666666]">
                  {hasUnsavedChanges ? (
                    <span className="text-[#d4a373]">Unsaved changes</span>
                  ) : (
                    <>Saved {getTimeAgo(lastSaved)}</>
                  )}
                </span>
              )}
            </div>

            {/* Toolbar */}
            <nav className="flex flex-wrap gap-2 pb-6 border-b border-[#2a2a2a]">
              <button
                onClick={() => setShowTemplateGallery(true)}
                className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#fafafa] hover:bg-[#242424] rounded transition-colors"
              >
                Templates
              </button>
              <button
                onClick={() => setShowFavorites(true)}
                className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#fafafa] hover:bg-[#242424] rounded transition-colors"
              >
                Favorites
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#fafafa] hover:bg-[#242424] rounded transition-colors"
              >
                History
              </button>
              <button
                onClick={() => setShowStatistics(true)}
                className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#fafafa] hover:bg-[#242424] rounded transition-colors"
              >
                Stats
              </button>
              <div className="flex-1" />
              <button
                onClick={handleSaveDraft}
                className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#fafafa] hover:bg-[#242424] rounded transition-colors"
                title="Ctrl+S"
              >
                Save
              </button>
              <button
                onClick={handleLoadDraft}
                className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#fafafa] hover:bg-[#242424] rounded transition-colors"
              >
                Load
              </button>
              <button
                onClick={handleClearDraft}
                className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#fafafa] hover:bg-[#242424] rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowPrivacySettings(true)}
                className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#fafafa] hover:bg-[#242424] rounded transition-colors"
              >
                Privacy
              </button>
              <Link
                href="/suggestions"
                className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#fafafa] hover:bg-[#242424] rounded transition-colors"
              >
                Feedback
              </Link>
            </nav>
          </header>

          {/* Form */}
          <div className="space-y-8">
            {/* Document Type */}
            <section>
              <label
                htmlFor="documentType"
                className="block text-sm font-medium text-[#a0a0a0] mb-2"
              >
                Document Type
              </label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-[#fafafa] bg-[#1a1a1a] border border-[#2a2a2a] focus:border-[#d4a373] cursor-pointer"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </section>

            {/* Recipient */}
            <section>
              <h2 className="text-lg text-[#fafafa] mb-4">Recipient</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="recipientName"
                    className="block text-sm text-[#666666] mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label
                    htmlFor="recipientTitle"
                    className="block text-sm text-[#666666] mb-1"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="recipientTitle"
                    value={recipientTitle}
                    onChange={(e) => setRecipientTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="recipientAddress"
                    className="block text-sm text-[#666666] mb-1"
                  >
                    Address
                  </label>
                  <textarea
                    id="recipientAddress"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg resize-none"
                    placeholder="Optional"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm text-[#666666] mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </section>

            {/* Signatory */}
            <section>
              <h2 className="text-lg text-[#fafafa] mb-4">Signatory</h2>
              <div className="space-y-2">
                {signatories.map((signatory) => (
                  <label
                    key={signatory.id}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors border ${
                      !useCustomSignatory && selectedSignatory === signatory.id
                        ? 'bg-[#242424] border-[#d4a373]'
                        : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'
                    }`}
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
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      !useCustomSignatory && selectedSignatory === signatory.id
                        ? 'border-[#d4a373]'
                        : 'border-[#666666]'
                    }`}>
                      {!useCustomSignatory && selectedSignatory === signatory.id && (
                        <div className="w-2 h-2 rounded-full bg-[#d4a373]" />
                      )}
                    </div>
                    <div>
                      <div className="text-[#fafafa]">{signatory.name}</div>
                      <div className="text-sm text-[#666666]">{signatory.title}</div>
                    </div>
                  </label>
                ))}
                
                {/* Custom Signatory */}
                <div
                  className={`p-4 rounded-lg border transition-colors ${
                    useCustomSignatory
                      ? 'bg-[#242424] border-[#d4a373]'
                      : 'bg-[#1a1a1a] border-[#2a2a2a]'
                  }`}
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="signatory"
                      checked={useCustomSignatory}
                      onChange={() => setUseCustomSignatory(true)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      useCustomSignatory ? 'border-[#d4a373]' : 'border-[#666666]'
                    }`}>
                      {useCustomSignatory && (
                        <div className="w-2 h-2 rounded-full bg-[#d4a373]" />
                      )}
                    </div>
                    <span className="text-[#fafafa]">Custom Signatory</span>
                  </label>
                  
                  {useCustomSignatory && (
                    <div className="mt-4 space-y-3 pl-7">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={customSignatoryName}
                          onChange={(e) => setCustomSignatoryName(e.target.value)}
                          placeholder="Name *"
                          className="px-3 py-2 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={customSignatoryTitle}
                          onChange={(e) => setCustomSignatoryTitle(e.target.value)}
                          placeholder="Title"
                          className="px-3 py-2 rounded-lg text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        value={customSignatoryCompany}
                        onChange={(e) => setCustomSignatoryCompany(e.target.value)}
                        placeholder="Company"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={customSignatoryPhone}
                          onChange={(e) => setCustomSignatoryPhone(e.target.value)}
                          placeholder="Phone"
                          className="px-3 py-2 rounded-lg text-sm"
                        />
                        <input
                          type="email"
                          value={customSignatoryEmail}
                          onChange={(e) => setCustomSignatoryEmail(e.target.value)}
                          placeholder="Email"
                          className="px-3 py-2 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Formatting */}
            <section>
              <h2 className="text-lg text-[#fafafa] mb-4">Formatting</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fontSize"
                    className="block text-sm text-[#666666] mb-2"
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
                    className="w-full accent-[#d4a373]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lineSpacing"
                    className="block text-sm text-[#666666] mb-2"
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
                    className="w-full accent-[#d4a373]"
                  />
                </div>
              </div>
            </section>

            {/* Document Body */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="bodyText"
                  className="text-sm font-medium text-[#a0a0a0]"
                >
                  Document Body
                </label>
                <span className="text-xs text-[#666666]">
                  {wordCount} words · {characterCount} chars
                </span>
              </div>
              <textarea
                id="bodyText"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={12}
                className={`w-full px-4 py-3 rounded-lg resize-y ${
                  bodyText.trim() && wordCount < 20
                    ? 'border-[#f87171] focus:border-[#f87171]'
                    : ''
                }`}
                placeholder="Enter the document content..."
              />
              
              {/* DocuSign Formatting Toggle */}
              <div className="mt-3 flex items-center justify-between p-3 bg-[#242424] rounded-lg border border-[#2a2a2a]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDocusignMode(!docusignMode)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      docusignMode ? 'bg-[#d4a373]' : 'bg-[#3a3a3a]'
                    }`}
                  >
                    <span 
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        docusignMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-[#a0a0a0]">
                    DocuSign signature block
                  </span>
                </div>
                {docusignMode && (
                  <button
                    onClick={() => {
                      const signatureBlock = `


─────────────────────────────────────────

SIGNATURE

Sign: ___________________________

Print Name: _____________________

Title: __________________________

Date: ___________________________

─────────────────────────────────────────`;
                      
                      if (!bodyText.includes('SIGNATURE')) {
                        setBodyText(bodyText.trimEnd() + signatureBlock);
                        toast.success('Signature block added');
                      } else {
                        toast('Signature block already exists', { icon: 'ℹ️' });
                      }
                    }}
                    className="text-xs px-3 py-1.5 bg-[#d4a373] text-[#0f0f0f] rounded hover:bg-[#e5b888] transition-colors"
                  >
                    Add Signature Block
                  </button>
                )}
              </div>
              {docusignMode && (
                <p className="mt-2 text-xs text-[#666666]">
                  Adds a formatted signature area for DocuSign. You can also add multiple signature blocks for multiple signers.
                </p>
              )}

              {bodyText.trim() && wordCount < 20 && (
                <p className="mt-2 text-sm text-[#f87171]">
                  Consider adding more content for a professional document.
                </p>
              )}
            </section>

            {/* Actions */}
            <section className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handlePreviewPDF}
                disabled={isGenerating || !bodyText.trim()}
                className="flex-1 px-6 py-3 rounded-lg text-[#fafafa] bg-[#242424] border border-[#2a2a2a] hover:bg-[#2a2a2a] hover:border-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? "Generating..." : "Preview"}
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating || !bodyText.trim()}
                className="flex-1 px-6 py-3 rounded-lg text-[#0f0f0f] bg-[#d4a373] hover:bg-[#e5b888] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isGenerating ? "Generating..." : "Download PDF"}
              </button>
            </section>

            {/* Quick Actions */}
            <section className="flex flex-wrap gap-2 pt-2 border-t border-[#2a2a2a]">
              <button
                onClick={handleUseLastSettings}
                className="text-sm text-[#666666] hover:text-[#a0a0a0] transition-colors"
              >
                Use last settings
              </button>
              <span className="text-[#2a2a2a]">·</span>
              <button
                onClick={handleSaveAsFavorite}
                className="text-sm text-[#666666] hover:text-[#a0a0a0] transition-colors"
              >
                Save as favorite
              </button>
              <span className="text-[#2a2a2a]">·</span>
              <button
                onClick={() => setShowGuide(true)}
                className="text-sm text-[#666666] hover:text-[#a0a0a0] transition-colors"
              >
                Help
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* PDF Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#2a2a2a]">
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
              <h2 className="text-lg text-[#fafafa]">Preview</h2>
              <button
                onClick={() => {
                  setShowPreview(false);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                className="text-[#666666] hover:text-[#fafafa] transition-colors text-xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[#242424]">
              <iframe
                src={previewUrl}
                className="w-full h-full min-h-[600px] bg-white rounded"
                title="PDF Preview"
              />
            </div>
            <div className="p-4 border-t border-[#2a2a2a] flex gap-3">
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
                  toast.success("PDF downloaded");
                }}
                className="flex-1 px-4 py-2 rounded-lg text-[#0f0f0f] bg-[#d4a373] hover:bg-[#e5b888] transition-colors"
              >
                Download
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg text-[#fafafa] bg-[#242424] border border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Gallery Modal */}
      <TemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Statistics Panel */}
      <StatisticsPanel
        isOpen={showStatistics}
        onClose={() => setShowStatistics(false)}
      />

      {/* Document History */}
      <DocumentHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadDocument={handleLoadFromHistory}
      />

      {/* User Guide */}
      {showGuide && (
        <UserGuide onClose={() => setShowGuide(false)} />
      )}

      {/* Favorites Panel */}
      <FavoritesPanel
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        onLoad={handleLoadFavorite}
      />

      {/* Confetti Celebration */}
      <Confetti 
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Privacy Settings */}
      <PrivacySettings
        isOpen={showPrivacySettings}
        onClose={() => setShowPrivacySettings(false)}
      />
    </>
  );
}
