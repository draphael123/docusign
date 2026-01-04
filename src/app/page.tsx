"use client";

import { useState, useEffect } from "react";
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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState<boolean>(false);

  // Get theme after mount to avoid SSR issues
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark";
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      }
      
      // Load last saved timestamp
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

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!mounted || !autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && bodyText.trim()) {
        handleAutoSave();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, bodyText, autoSaveEnabled, mounted]);

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
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      }
      return newTheme;
    });
  };

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
    {
      key: "?",
      action: () => {
        toast("Keyboard Shortcuts:\nCtrl+S: Save\nCtrl+P: Preview\nCtrl+G: Generate", {
          duration: 5000,
        });
      },
      description: "Show shortcuts",
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

  const handleAutoSave = () => {
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
  };

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

      // Generate PDF
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

      // Save to history and update statistics
      saveToHistory({
        documentType,
        signatoryName: signatory.name,
      });
      const { newAchievements } = updateStats(documentType, signatory.name);
      if (newAchievements.length > 0) {
        newAchievements.forEach((achievement) => {
          toast.success(`🏆 Achievement Unlocked: ${achievement}!`, { duration: 5000 });
        });
      }

      // Save last used settings
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

      toast.success("PDF generated and downloaded successfully!");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error(error.message || "Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setDocumentType(template.documentType);
    setBodyText(template.bodyText);
    toast.success(`Template "${template.name}" loaded!`);
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
    toast.success("Document loaded from history!");
  };

  // Real-time validation
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

  const handleFieldChange = (fieldName: string, value: string, setter: (value: string) => void) => {
    setter(value);
    if (showValidation) {
      const result = validateField(fieldName, value);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (result.error) {
          newErrors[fieldName] = result.error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
      setValidationWarnings(prev => {
        const newWarnings = { ...prev };
        if (result.warning) {
          newWarnings[fieldName] = result.warning;
        } else {
          delete newWarnings[fieldName];
        }
        return newWarnings;
      });
    }
  };

  // Quick Actions
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
      toast.success("Last used settings loaded!");
    } else {
      toast.error("No previous settings found");
    }
  };

  const handleSaveAsFavorite = () => {
    if (!bodyText.trim()) {
      toast.error("Please enter document content before saving as favorite");
      return;
    }
    
    const favoriteName = prompt("Enter a name for this favorite:");
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
    
    toast.success(`Saved as favorite: "${favoriteName}"! ⭐`);
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
    toast.success(`Favorite "${favorite.name}" loaded!`);
  };

  return (
    <>
      <Toaster position="top-right" />
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 dark:bg-gray-800/95 shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-md border border-white/30 dark:border-gray-700/30 relative overflow-hidden">
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 shimmer pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 relative z-10">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  ✨ Document Template Generator
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Generate professional PDF templates ready to upload to DocuSign
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                {/* Save Status Indicator */}
                {mounted && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2 justify-end">
                    {hasUnsavedChanges ? (
                      <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold">
                        <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                        Unsaved changes
                      </span>
                    ) : lastSaved ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                        Saved {(() => {
                          const seconds = Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000);
                          if (seconds < 60) return "just now";
                          const minutes = Math.floor(seconds / 60);
                          if (minutes < 60) return `${minutes}m ago`;
                          const hours = Math.floor(minutes / 60);
                          return `${hours}h ago`;
                        })()}
                      </span>
                    ) : null}
                    {autoSaveEnabled && (
                      <span className="text-gray-500 dark:text-gray-500">• Auto-save on</span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {mounted && (
                    <button
                      onClick={toggleTheme}
                      className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                      title="Toggle dark mode"
                    >
                      {theme === "dark" ? "☀️" : "🌙"}
                    </button>
                  )}
                  <button
                    onClick={() => setShowTemplateGallery(true)}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                  >
                    📚 Templates
                  </button>
                  <button
                    onClick={() => setShowStatistics(true)}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                  >
                    📊 Stats
                  </button>
                  <button
                    onClick={() => setShowHistory(true)}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                  >
                    📜 History
                  </button>
                  <Link
                    href="/suggestions"
                    className="inline-block px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-105 font-medium transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10">💡 Feedback</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </Link>
                  <button
                    onClick={() => setShowGuide(true)}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                  >
                    📖 Guide
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                    title="Ctrl+S"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={handleLoadDraft}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                  >
                    📂 Load
                  </button>
                  <button
                    onClick={handleClearDraft}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 p-4 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Quick Actions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleUseLastSettings}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                    title="Load your last used settings"
                  >
                    🔄 Use Last Settings
                  </button>
                  <button
                    onClick={() => setShowFavorites(true)}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                    title="View and load your favorite configurations"
                  >
                    ⭐ Favorites
                  </button>
                  <button
                    onClick={handleSaveAsFavorite}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                    title="Save current settings as a favorite"
                  >
                    💾 Save as Favorite
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            {showWizard && (
              <div className="mb-6 relative z-10">
                <ProgressIndicator
                  currentStep={currentStep}
                  totalSteps={progressSteps.length}
                  steps={progressSteps}
                />
              </div>
            )}

            <div className="space-y-6 relative z-10">
              {/* Document Type Dropdown */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                <label
                  htmlFor="documentType"
                  className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2"
                >
                  <span className="text-lg">📄</span>
                  Document Type
                </label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium text-gray-800 hover:border-purple-300 transition-all cursor-pointer"
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Information */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Recipient Information (Optional)
                </h3>
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
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white font-medium text-gray-800 hover:border-green-300"
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
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white font-medium text-gray-800 hover:border-green-300"
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
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white font-medium text-gray-800 hover:border-green-300 resize-y"
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
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white font-medium text-gray-800 hover:border-green-300"
                      placeholder="Document subject"
                    />
                  </div>
                </div>
              </div>

              {/* Signatory Radio Selection */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-lg">✍️</span>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  Signatory
                </label>
                <div className="space-y-3">
                  {signatories.map((signatory) => (
                    <label
                      key={signatory.id}
                      className="flex items-center p-4 border-2 border-indigo-200 rounded-xl hover:bg-white hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all duration-200 bg-white/50"
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
                        className="mr-3 w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {signatory.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {signatory.title}
                        </div>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center p-4 border-2 border-indigo-200 rounded-xl hover:bg-white hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all duration-200 bg-white/50">
                    <input
                      type="radio"
                      name="signatory"
                      checked={useCustomSignatory}
                      onChange={() => setUseCustomSignatory(true)}
                      className="mr-3 w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Custom Signatory</div>
                      {useCustomSignatory && (
                        <div className="mt-3 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={customSignatoryName}
                              onChange={(e) => setCustomSignatoryName(e.target.value)}
                              placeholder="Name"
                              className="px-3 py-2 text-sm border-2 border-indigo-200 rounded-lg bg-white font-medium text-gray-800 hover:border-indigo-300"
                            />
                            <input
                              type="text"
                              value={customSignatoryTitle}
                              onChange={(e) => setCustomSignatoryTitle(e.target.value)}
                              placeholder="Title"
                              className="px-3 py-2 text-sm border-2 border-indigo-200 rounded-lg bg-white font-medium text-gray-800 hover:border-indigo-300"
                            />
                          </div>
                          <input
                            type="text"
                            value={customSignatoryCompany}
                            onChange={(e) => setCustomSignatoryCompany(e.target.value)}
                            placeholder="Company (optional)"
                            className="w-full px-3 py-2 text-sm border-2 border-indigo-200 rounded-lg bg-white font-medium text-gray-800 hover:border-indigo-300"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={customSignatoryPhone}
                              onChange={(e) => setCustomSignatoryPhone(e.target.value)}
                              placeholder="Phone (optional)"
                              className="px-3 py-2 text-sm border-2 border-indigo-200 rounded-lg bg-white font-medium text-gray-800 hover:border-indigo-300"
                            />
                            <input
                              type="email"
                              value={customSignatoryEmail}
                              onChange={(e) => setCustomSignatoryEmail(e.target.value)}
                              placeholder="Email (optional)"
                              className="px-3 py-2 text-sm border-2 border-indigo-200 rounded-lg bg-white font-medium text-gray-800 hover:border-indigo-300"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* PDF Formatting Options */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-lg">🎨</span>
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                  Formatting Options
                </h3>
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

              {/* Document Body */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Document Body
                  <Tooltip content="Enter the main content of your document. Aim for at least 50 words for a professional document.">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-amber-200 text-amber-800 rounded-full cursor-help hover:bg-amber-300">
                      ?
                    </span>
                  </Tooltip>
                </label>
                <textarea
                  id="bodyText"
                  value={bodyText}
                  onChange={(e) => {
                    setBodyText(e.target.value);
                    if (showValidation) {
                      const result = validateBodyText(e.target.value);
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        if (result.error) {
                          newErrors.bodyText = result.error;
                        } else {
                          delete newErrors.bodyText;
                        }
                        return newErrors;
                      });
                      setValidationWarnings(prev => {
                        const newWarnings = { ...prev };
                        if (result.warning) {
                          newWarnings.bodyText = result.warning;
                        } else {
                          delete newWarnings.bodyText;
                        }
                        return newWarnings;
                      });
                    }
                  }}
                  onFocus={() => setShowValidation(true)}
                  rows={10}
                  className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white font-medium text-gray-800 hover:border-amber-300 resize-y ${
                    validationErrors.bodyText 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : validationWarnings.bodyText
                      ? 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500'
                      : 'border-amber-200 focus:ring-amber-500 focus:border-amber-500'
                  }`}
                  placeholder="Enter the document body text here..."
                />
                {validationErrors.bodyText && (
                  <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span>❌</span> {validationErrors.bodyText}
                  </div>
                )}
                {validationWarnings.bodyText && !validationErrors.bodyText && (
                  <div className="mt-2 text-sm text-yellow-600 flex items-center gap-1">
                    <span>⚠️</span> {validationWarnings.bodyText}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs font-semibold text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                  <span className="flex items-center gap-1">📝 {wordCount} words</span>
                  <span className="flex items-center gap-1">🔤 {characterCount} characters</span>
                  {wordCount > 0 && (
                    <>
                      <span className="flex items-center gap-1">📖 ~{Math.ceil(wordCount / 200)} min read</span>
                      <span className={`flex items-center gap-1 ${wordCount < 50 ? 'text-yellow-600' : wordCount > 1000 ? 'text-orange-600' : 'text-green-600'}`}>
                        {wordCount < 50 ? '⚠️ Short' : wordCount > 1000 ? '⚠️ Long' : '✓ Good length'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handlePreviewPDF}
                  disabled={isGenerating || !bodyText.trim()}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all text-lg relative overflow-hidden group"
                >
                  <span className="relative z-10">{isGenerating ? "Generating..." : "👁️ Preview PDF"}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating || !bodyText.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all text-lg relative overflow-hidden group animate-pulse-slow"
                >
                  <span className="relative z-10">{isGenerating ? "Generating PDF..." : "📄 Generate & Download PDF"}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-pink-700 via-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
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
    </>
  );
}
