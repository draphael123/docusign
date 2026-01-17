"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
import dynamic from "next/dynamic";

// Store
import { useDocumentStore, useUIStore } from "@/store/documentStore";

// Data
import { signatories } from "@/data/signatories";
import { documentTemplates, DocumentTemplate } from "@/data/templates";

// Lib
import { generatePDF } from "@/lib/pdfGenerator";

// Utils
import { saveToHistory, DocumentHistoryItem } from "@/utils/documentHistory";
import { updateStats } from "@/utils/statistics";
import { saveLastUsedSettings, saveFavorite, FavoriteSettings } from "@/utils/favorites";

// Hooks
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// Components - Forms
import {
  DocumentTypeSelector,
  RecipientForm,
  SignatorySection,
  DocumentBodyEditor,
  FormattingOptions,
} from "@/components/forms";

// Components - UI
import SimplifiedSidebar from "@/components/SimplifiedSidebar";
import CommandPalette from "@/components/CommandPalette";
import PageHeader from "@/components/PageHeader";
import ActionButtons from "@/components/ActionButtons";
import SkipToContent from "@/components/SkipToContent";
import Confetti from "@/components/Confetti";
import AutoSaveIndicator from "@/components/AutoSaveIndicator";
import ProgressIndicator from "@/components/ProgressIndicator";
import QuickTemplates from "@/components/QuickTemplates";
import { Skeleton, FormSectionSkeleton } from "@/components/Skeleton";

// Components - Modals (frequently used - not lazy loaded)
import TemplateGallery from "@/components/TemplateGallery";
import StatisticsPanel from "@/components/StatisticsPanel";
import DocumentHistory from "@/components/DocumentHistory";
import UserGuide from "@/components/UserGuide";
import FavoritesPanel from "@/components/FavoritesPanel";
import PrivacySettings from "@/components/PrivacySettings";
import SettingsPanel, { AppSettings, DEFAULT_SETTINGS } from "@/components/SettingsPanel";
import ProfileManager, { SenderProfile, RecipientProfile } from "@/components/ProfileManager";
import VersionHistory from "@/components/VersionHistory";
import FindReplace from "@/components/FindReplace";
import PDFThemes from "@/components/PDFThemes";
import CustomBranding, { useBranding } from "@/components/CustomBranding";
import AIWritingAssistant from "@/components/AIWritingAssistant";
import StreakDisplay, { useStreak } from "@/components/StreakTracker";
import TemplateAnalytics, { useTemplateAnalytics } from "@/components/TemplateAnalytics";
import { useTimeTracker, TimeStatsModal } from "@/components/TimeTracker";
import { usePDFThemes } from "@/components/PDFThemes";

// Components - Modals (lazy loaded)
import {
  LazyTeamWorkspaces,
  LazyAPIAccess,
  LazyWebhookIntegration,
  LazyDocumentScheduling,
  LazyBulkGeneration,
  LazyDocumentComparison,
  LazyAuditTrail,
  LazyExportHistory,
  LazyDocumentExpiration,
} from "@/components/LazyModals";

// New Components
import WelcomeModal from "@/components/WelcomeModal";
import TemplateCategories from "@/components/TemplateCategories";
import SaveAsTemplate, { useUserTemplates } from "@/components/SaveAsTemplate";
import Dashboard from "@/components/Dashboard";
import ShareDraft from "@/components/ShareDraft";
import EmailDocument from "@/components/EmailDocument";
import AccessibilitySettings from "@/components/AccessibilitySettings";

// Auth Components
import AuthModal from "@/components/AuthModal";
import UserMenu from "@/components/UserMenu";
import MyTemplates from "@/components/MyTemplates";

// Icons
import {
  HelpCircle,
  Shield,
  Sparkles,
  MessageSquare,
  LayoutDashboard,
  Share2,
  Mail,
  Accessibility,
  FilePlus,
  User,
} from "lucide-react";

export default function Home() {
  // Zustand stores
  const {
    documentType,
    bodyText,
    recipient,
    subject,
    formatting,
    useCustomSignatory,
    customSignatory,
    selectedSignatoryId,
    hasUnsavedChanges,
    lastSaved,
    setBodyText,
    setDocumentType,
    setRecipient,
    setCustomSignatory,
    setSelectedSignatory,
    setFormatting,
    markSaved,
    clearDocument,
    getSignatory,
  } = useDocumentStore();

  const {
    theme,
    sidebarOpen,
    activeModal,
    focusMode,
    compactMode,
    soundEffects,
    confettiEnabled,
    openModal,
    closeModal,
    setFocusMode,
    setCompactMode,
  } = useUIStore();

  // Local state for UI
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isOnline, setIsOnline] = useState(true);
  
  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMyTemplates, setShowMyTemplates] = useState(false);

  // Refs
  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { recordDocument } = useStreak();
  const { playSound } = useSoundEffects(soundEffects);
  const { recordTemplateUse } = useTemplateAnalytics();
  const { branding, saveBranding } = useBranding();
  const { selectedTheme, selectTheme } = usePDFThemes();
  const { templates: userTemplates, addTemplate: addUserTemplate } = useUserTemplates();
  const {
    isTracking,
    currentSessionSeconds,
    timeStats,
    startTracking,
    stopTracking,
    formatTime,
    formatMinutes,
  } = useTimeTracker();

  // Initialize
  useEffect(() => {
    setMounted(true);
    setTimeout(() => setIsLoading(false), 300);

    if (typeof window !== "undefined") {
      // Load app settings
      const savedSettings = localStorage.getItem("appSettings");
      if (savedSettings) {
        try {
          setAppSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error("Error loading settings:", e);
        }
      }

      // Online status
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Start time tracking when user starts typing
  useEffect(() => {
    if (mounted && bodyText && !isTracking && bodyText.length > 10) {
      startTracking();
    }
  }, [bodyText, mounted, isTracking, startTracking]);

  // Live preview debounce
  useEffect(() => {
    if (!showLivePreview || !bodyText.trim()) {
      if (livePreviewUrl) {
        URL.revokeObjectURL(livePreviewUrl);
        setLivePreviewUrl(null);
      }
      return;
    }

    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);

    previewDebounceRef.current = setTimeout(async () => {
      try {
        const signatory = getSignatory();
        const pdfBlob = await generatePDF({
          documentType,
          bodyText,
          signatoryName: signatory.name,
          signatoryTitle: signatory.title,
          signatoryCompany: signatory.company,
          signatoryPhone: signatory.phone,
          signatoryEmail: signatory.email,
          recipientName: recipient.name,
          recipientTitle: recipient.title,
          recipientAddress: recipient.address,
          subject,
          fontSize: formatting.fontSize,
          lineSpacing: formatting.lineSpacing,
        });

        if (livePreviewUrl) URL.revokeObjectURL(livePreviewUrl);
        setLivePreviewUrl(URL.createObjectURL(pdfBlob));
      } catch (e) {
        console.error("Live preview error:", e);
      }
    }, 1000);

    return () => {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    };
  }, [showLivePreview, bodyText, documentType, recipient, subject, formatting, getSignatory, livePreviewUrl]);

  // Auto-save
  const handleAutoSave = useCallback(() => {
    setIsSaving(true);
    markSaved();
    setTimeout(() => setIsSaving(false), 500);
  }, [markSaved]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      if (hasUnsavedChanges && bodyText.trim()) handleAutoSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [hasUnsavedChanges, bodyText, mounted, handleAutoSave]);

  // Warn about unsaved changes
  useEffect(() => {
    if (!mounted) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && bodyText.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, bodyText, mounted]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: "s", ctrl: true, action: () => handleSaveDraft(), description: "Save draft" },
    { key: "p", ctrl: true, action: () => { if (bodyText.trim()) handlePreviewPDF(); }, description: "Preview PDF" },
    { key: "f", ctrl: true, action: () => openModal("findReplace"), description: "Find & Replace" },
  ]);

  // Handlers
  const handleSaveDraft = () => {
    handleAutoSave();
    playSound("save");
    toast.success("Draft saved");
  };

  const handleClearDraft = () => {
    clearDocument();
    toast.success("Document cleared");
  };

  const handlePreviewPDF = async () => {
    if (!bodyText.trim()) {
      toast.error("Please enter document body text");
      return;
    }
    setIsGenerating(true);
    try {
      const signatory = getSignatory();
      if (!signatory.name) throw new Error("Signatory name is required");

      const pdfBlob = await generatePDF({
        documentType,
        bodyText,
        signatoryName: signatory.name,
        signatoryTitle: signatory.title,
        signatoryCompany: signatory.company,
        signatoryPhone: signatory.phone,
        signatoryEmail: signatory.email,
        recipientName: recipient.name,
        recipientTitle: recipient.title,
        recipientAddress: recipient.address,
        subject,
        fontSize: formatting.fontSize,
        lineSpacing: formatting.lineSpacing,
      });
      const url = URL.createObjectURL(pdfBlob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error: any) {
      toast.error(error.message || "Error generating PDF preview");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!bodyText.trim()) {
      toast.error("Please enter document body text");
      playSound("error");
      return;
    }
    setIsGenerating(true);
    try {
      const signatory = getSignatory();
      if (!signatory.name) throw new Error("Signatory name is required");

      const pdfBlob = await generatePDF({
        documentType,
        bodyText,
        signatoryName: signatory.name,
        signatoryTitle: signatory.title,
        signatoryCompany: signatory.company,
        signatoryPhone: signatory.phone,
        signatoryEmail: signatory.email,
        recipientName: recipient.name,
        recipientTitle: recipient.title,
        recipientAddress: recipient.address,
        subject,
        fontSize: formatting.fontSize,
        lineSpacing: formatting.lineSpacing,
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      link.download = `${documentType.replace(/\s+/g, "-")}-${signatory.name.replace(/\s+/g, "-")}-${dateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Stop time tracking and record
      const timeSpent = stopTracking(documentType);

      const isPrivateMode = localStorage.getItem("privateMode") === "true";
      if (!isPrivateMode) {
        saveToHistory({ documentType, signatoryName: signatory.name });
        const { newAchievements } = updateStats(documentType, signatory.name);
        const streakAchievements = recordDocument();
        const allAchievements = [...newAchievements, ...streakAchievements];

        recordTemplateUse(documentType, documentType, timeSpent);

        if (allAchievements.length > 0 && confettiEnabled) {
          setShowConfetti(true);
          allAchievements.forEach((a) => toast.success(`Achievement: ${a}`, { duration: 5000 }));
        }
      }

      saveLastUsedSettings({
        documentType,
        selectedSignatory: selectedSignatoryId,
        useCustomSignatory,
        customSignatoryName: customSignatory.name,
        customSignatoryTitle: customSignatory.title,
        customSignatoryCompany: customSignatory.company,
        customSignatoryPhone: customSignatory.phone,
        customSignatoryEmail: customSignatory.email,
        fontSize: formatting.fontSize,
        lineSpacing: formatting.lineSpacing,
      });

      playSound("complete");
      toast.success(`PDF downloaded${timeSpent > 0 ? ` (${timeSpent}m)` : ""}`);
    } catch (error: any) {
      playSound("error");
      toast.error(error.message || "Error generating PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportWord = async () => {
    if (!bodyText.trim()) {
      toast.error("Please enter document body text");
      return;
    }

    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const { saveAs } = await import("file-saver");
      const signatory = getSignatory();

      const paragraphs = bodyText.split("\n").map(
        (line) => new Paragraph({ children: [new TextRun({ text: line, size: formatting.fontSize * 2 })] })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ children: [new TextRun({ text: documentType, bold: true, size: 28 })] }),
            new Paragraph({ children: [] }),
            ...paragraphs,
            new Paragraph({ children: [] }),
            new Paragraph({ children: [new TextRun({ text: signatory.name, bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: signatory.title })] }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const dateStr = new Date().toISOString().split("T")[0];
      saveAs(blob, `${documentType.replace(/\s+/g, "-")}-${dateStr}.docx`);
      toast.success("Word document downloaded");
    } catch (error) {
      console.error("Error exporting Word:", error);
      toast.error("Error exporting Word document");
    }
  };

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setDocumentType(template.documentType);
    setBodyText(template.bodyText);
    toast.success("Template loaded");
  };

  const handleLoadFromHistory = (item: DocumentHistoryItem) => {
    setDocumentType(item.documentType);
    const signatory = signatories.find((s) => s.name === item.signatoryName);
    if (signatory) {
      setSelectedSignatory(signatory.id);
    } else {
      setCustomSignatory({ name: item.signatoryName });
    }
    toast.success("Document loaded from history");
  };

  const handleLoadFavorite = (favorite: FavoriteSettings) => {
    setDocumentType(favorite.documentType);
    setSelectedSignatory(favorite.selectedSignatory);
    if (favorite.useCustomSignatory) {
      setCustomSignatory({
        name: favorite.customSignatoryName || "",
        title: favorite.customSignatoryTitle || "",
        company: favorite.customSignatoryCompany || "",
        phone: favorite.customSignatoryPhone || "",
        email: favorite.customSignatoryEmail || "",
      });
    }
    setRecipient({
      name: favorite.recipientName || "",
      title: favorite.recipientTitle || "",
      address: favorite.recipientAddress || "",
    });
    setFormatting({
      fontSize: favorite.fontSize,
      lineSpacing: favorite.lineSpacing,
    });
    toast.success(`Loaded "${favorite.name}"`);
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
      selectedSignatory: selectedSignatoryId,
      useCustomSignatory,
      customSignatoryName: customSignatory.name,
      customSignatoryTitle: customSignatory.title,
      customSignatoryCompany: customSignatory.company,
      customSignatoryPhone: customSignatory.phone,
      customSignatoryEmail: customSignatory.email,
      recipientName: recipient.name,
      recipientTitle: recipient.title,
      recipientAddress: recipient.address,
      subject,
      fontSize: formatting.fontSize,
      lineSpacing: formatting.lineSpacing,
    });
    toast.success(`Saved as "${favoriteName}"`);
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    localStorage.setItem("appSettings", JSON.stringify(newSettings));
    if (newSettings.focusMode !== focusMode) setFocusMode(newSettings.focusMode);
    if (newSettings.compactMode !== compactMode) setCompactMode(newSettings.compactMode);
  };

  const handleSelectSenderProfile = (profile: SenderProfile) => {
    setCustomSignatory({
      name: profile.name,
      title: profile.title,
      company: profile.company,
      phone: profile.phone,
      email: profile.email,
    });
    playSound("success");
    toast.success(`Loaded profile: ${profile.name}`);
  };

  const handleSelectRecipientProfile = (profile: RecipientProfile) => {
    setRecipient({
      name: profile.name,
      title: profile.title,
      address: profile.address,
    });
    playSound("success");
    toast.success(`Loaded recipient: ${profile.name}`);
  };

  // Navigation handler for sidebar
  const handleNavigate = (section: string) => {
    openModal(section);
  };

  // Command palette action handler
  const handleCommandAction = (action: string) => {
    switch (action) {
      case "preview":
        handlePreviewPDF();
        break;
      case "download":
        handleGeneratePDF();
        break;
      case "save":
        handleSaveDraft();
        break;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64 mb-8" />
          <FormSectionSkeleton />
          <FormSectionSkeleton />
          <FormSectionSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      <SkipToContent />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: theme === "light" ? "#fff" : "#161619",
            color: theme === "light" ? "#2d2a26" : "#f4f1ed",
            border: `1px solid ${theme === "light" ? "#e5e0d8" : "#2a2a32"}`,
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          },
        }}
      />

      {/* Sidebar */}
      {mounted && !focusMode && (
        <SimplifiedSidebar onNavigate={handleNavigate} />
      )}

      {/* Command Palette */}
      <CommandPalette onAction={handleCommandAction} />

      <div
        className={`min-h-screen transition-all duration-300 ${
          compactMode ? "compact-mode" : ""
        } ${sidebarOpen && !focusMode ? "ml-64" : !focusMode ? "ml-[72px]" : ""}`}
      >
        <main
          id="main-content"
          className={`${compactMode ? "py-4 px-4" : "py-8 px-6 lg:px-8"} ${
            showLivePreview ? "lg:pr-[420px]" : ""
          }`}
          role="main"
          tabIndex={-1}
        >
          <div className={`${compactMode ? "max-w-2xl" : "max-w-4xl"} mx-auto`}>
            {/* Header */}
            {!focusMode && (
              <PageHeader
                isTracking={isTracking}
                currentSessionSeconds={currentSessionSeconds}
                formatTime={formatTime}
                onSave={handleSaveDraft}
                onClear={handleClearDraft}
                onTogglePreview={() => setShowLivePreview(!showLivePreview)}
                showPreview={showLivePreview}
                onShowStreaks={() => openModal("streaks")}
                onShowSettings={() => openModal("settings")}
                isSaving={isSaving}
                onShowAuth={() => setShowAuthModal(true)}
                onShowMyTemplates={() => setShowMyTemplates(true)}
              />
            )}

            {/* Quick Templates */}
            {!focusMode && (
              <QuickTemplates
                templates={[...documentTemplates]}
                onSelectTemplate={handleSelectTemplate}
              />
            )}

            {/* Form Sections */}
            <div className="space-y-6 mt-6">
              <DocumentTypeSelector theme={theme} />
              <RecipientForm theme={theme} />
              <SignatorySection theme={theme} />
              <FormattingOptions theme={theme} />
              <DocumentBodyEditor
                theme={theme}
                onOpenAI={() => openModal("ai")}
                onOpenFindReplace={() => openModal("findReplace")}
              />
            </div>

            {/* Action Buttons */}
            <ActionButtons
              onPreview={handlePreviewPDF}
              onDownload={handleGeneratePDF}
              onExportWord={handleExportWord}
              isGenerating={isGenerating}
              disabled={!bodyText.trim()}
            />

            {/* Progress Indicator */}
            <section className="py-4 mt-4">
              <ProgressIndicator
                bodyText={bodyText}
                recipientName={recipient.name}
                signatorySelected={!!selectedSignatoryId || (useCustomSignatory && !!customSignatory.name)}
                documentType={documentType}
                compact={compactMode}
              />
            </section>

            {/* Quick Links */}
            {!focusMode && (
              <section className="flex flex-wrap gap-3 pt-4 border-t border-[--border-default] text-sm">
                <button
                  onClick={() => openModal("dashboard")}
                  className="text-[--color-primary] hover:text-[--color-primary-hover] transition-colors flex items-center gap-1"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </button>
                <span className="text-[--text-muted]">·</span>
                <button
                  onClick={() => openModal("saveTemplate")}
                  className="text-[--color-accent] hover:opacity-80 transition-colors flex items-center gap-1"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  Save as Template
                </button>
                <span className="text-[--text-muted]">·</span>
                <button
                  onClick={() => openModal("share")}
                  className="text-purple-400 hover:opacity-80 transition-colors flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
                <span className="text-[--text-muted]">·</span>
                <button
                  onClick={() => openModal("email")}
                  className="text-blue-400 hover:opacity-80 transition-colors flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
                <span className="text-[--text-muted]">·</span>
                <button
                  onClick={() => openModal("accessibility")}
                  className="text-pink-400 hover:opacity-80 transition-colors flex items-center gap-1"
                >
                  <Accessibility className="w-3.5 h-3.5" />
                  Accessibility
                </button>
                <span className="text-[--text-muted]">·</span>
                <button
                  onClick={() => openModal("help")}
                  className="text-emerald-400 hover:opacity-80 transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Help
                </button>
                <div className="flex-1" />
                <Link
                  href="/suggestions"
                  className="text-[--color-warning] hover:opacity-80 transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Feedback
                </Link>
              </section>
            )}
          </div>
        </main>

        {/* Live Preview Panel */}
        {showLivePreview && (
          <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-[--bg-surface] border-l border-[--border-default] p-4 hidden lg:flex flex-col z-30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Live Preview</h3>
              <button
                onClick={() => setShowLivePreview(false)}
                className="text-[--text-muted] hover:text-[--text-primary] text-xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 rounded-xl bg-[--bg-elevated] overflow-hidden">
              {livePreviewUrl ? (
                <iframe
                  src={livePreviewUrl}
                  className="w-full h-full bg-white"
                  title="Live Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[--text-muted] text-sm">
                  Start typing to see preview...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-4xl w-full max-h-[90vh] flex flex-col rounded-2xl overflow-hidden modal-enter">
            <div className="flex items-center justify-between p-5 border-b border-[--border-default]">
              <h2 className="text-lg font-semibold">Preview</h2>
              <button
                onClick={() => {
                  setShowPreview(false);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                className="text-[--text-muted] hover:text-[--text-primary] text-xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[--bg-elevated]">
              <iframe
                src={previewUrl}
                className="w-full h-full min-h-[600px] bg-white rounded-xl"
                title="PDF Preview"
              />
            </div>
            <div className="p-4 border-t border-[--border-default] flex gap-3">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = previewUrl;
                  const dateStr = new Date().toISOString().split("T")[0];
                  const signatory = getSignatory();
                  link.download = `${documentType.replace(/\s+/g, "-")}-${signatory.name.replace(/\s+/g, "-") || "document"}-${dateStr}.pdf`;
                  link.click();
                  toast.success("PDF downloaded");
                }}
                className="flex-1 btn-primary"
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
                className="flex-1 px-4 py-2 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:bg-[--bg-overlay] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals - Frequently Used */}
      <TemplateGallery
        isOpen={activeModal === "templates"}
        onClose={closeModal}
        onSelectTemplate={handleSelectTemplate}
      />
      <StatisticsPanel isOpen={activeModal === "statistics"} onClose={closeModal} />
      <DocumentHistory
        isOpen={activeModal === "history"}
        onClose={closeModal}
        onLoadDocument={handleLoadFromHistory}
      />
      {activeModal === "help" && <UserGuide onClose={closeModal} />}
      <FavoritesPanel
        isOpen={activeModal === "favorites"}
        onClose={closeModal}
        onLoad={handleLoadFavorite}
      />
      <PrivacySettings isOpen={activeModal === "privacy"} onClose={closeModal} />
      <SettingsPanel
        isOpen={activeModal === "settings"}
        onClose={closeModal}
        settings={appSettings}
        onSettingsChange={handleSettingsChange}
      />
      <ProfileManager
        isOpen={activeModal === "profiles"}
        onClose={closeModal}
        onSelectSender={handleSelectSenderProfile}
        onSelectRecipient={handleSelectRecipientProfile}
      />
      <VersionHistory
        isOpen={activeModal === "versions"}
        onClose={closeModal}
        onRestore={(text) => {
          setBodyText(text);
          toast.success("Version restored");
        }}
        currentBodyText={bodyText}
        documentType={documentType}
      />
      <FindReplace
        isOpen={activeModal === "findReplace"}
        onClose={closeModal}
        text={bodyText}
        onTextChange={setBodyText}
      />
      <PDFThemes
        isOpen={activeModal === "themes"}
        onClose={closeModal}
        selectedTheme={selectedTheme}
        onThemeChange={selectTheme}
      />
      <CustomBranding
        isOpen={activeModal === "branding"}
        onClose={closeModal}
        branding={branding}
        onBrandingChange={saveBranding}
      />
      <AIWritingAssistant
        isOpen={activeModal === "ai"}
        onClose={closeModal}
        onInsert={(text) => {
          setBodyText(bodyText + text);
          toast.success("Text inserted");
        }}
        selectedText={typeof window !== "undefined" ? (window.getSelection?.()?.toString() || "") : ""}
      />
      <TemplateAnalytics isOpen={activeModal === "analytics"} onClose={closeModal} />
      <TimeStatsModal
        isOpen={activeModal === "time"}
        onClose={closeModal}
        timeStats={timeStats}
        formatMinutes={formatMinutes}
      />

      {/* Streak Modal */}
      {activeModal === "streaks" && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div onClick={(e) => e.stopPropagation()} className="max-w-md w-full modal-enter">
            <StreakDisplay />
            <button
              onClick={closeModal}
              className="mt-4 w-full py-3 rounded-xl bg-[--bg-elevated] hover:bg-[--bg-overlay] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modals - Lazy Loaded */}
      {activeModal === "teams" && (
        <LazyTeamWorkspaces isOpen={true} onClose={closeModal} />
      )}
      {activeModal === "api" && (
        <LazyAPIAccess isOpen={true} onClose={closeModal} />
      )}
      {activeModal === "webhooks" && (
        <LazyWebhookIntegration isOpen={true} onClose={closeModal} />
      )}
      {activeModal === "schedule" && (
        <LazyDocumentScheduling
          isOpen={true}
          onClose={closeModal}
          currentDocumentType={documentType}
          currentBodyText={bodyText}
          currentRecipientName={recipient.name}
          onGenerate={handleGeneratePDF}
        />
      )}
      {activeModal === "bulk" && (
        <LazyBulkGeneration
          isOpen={true}
          onClose={closeModal}
          templateBody={bodyText}
          documentType={documentType}
          onGenerate={(records) => {
            toast.success(`Generating ${records.length} documents...`);
            closeModal();
          }}
        />
      )}
      {activeModal === "comparison" && (
        <LazyDocumentComparison
          isOpen={true}
          onClose={closeModal}
          currentText={bodyText}
        />
      )}
      {activeModal === "audit" && (
        <LazyAuditTrail isOpen={true} onClose={closeModal} />
      )}
      {activeModal === "exports" && (
        <LazyExportHistory isOpen={true} onClose={closeModal} />
      )}
      {activeModal === "expiration" && (
        <LazyDocumentExpiration isOpen={true} onClose={closeModal} />
      )}

      {/* New Feature Modals */}
      <WelcomeModal onComplete={() => {}} />
      
      <TemplateCategories
        isOpen={activeModal === "templateCategories"}
        onClose={closeModal}
        onSelectTemplate={handleSelectTemplate}
        userTemplates={userTemplates}
      />
      
      <SaveAsTemplate
        isOpen={activeModal === "saveTemplate"}
        onClose={closeModal}
        currentDocumentType={documentType}
        currentBodyText={bodyText}
        onSave={addUserTemplate}
        onShowAuth={() => setShowAuthModal(true)}
      />
      
      <Dashboard
        isOpen={activeModal === "dashboard"}
        onClose={closeModal}
        onNavigate={handleNavigate}
      />
      
      <ShareDraft
        isOpen={activeModal === "share"}
        onClose={closeModal}
        documentType={documentType}
        bodyText={bodyText}
        recipientName={recipient.name}
      />
      
      <EmailDocument
        isOpen={activeModal === "email"}
        onClose={closeModal}
        documentType={documentType}
        bodyText={bodyText}
        recipientName={recipient.name}
        onGeneratePDF={async () => {
          const signatory = getSignatory();
          return await generatePDF({
            documentType,
            bodyText,
            signatoryName: signatory.name,
            signatoryTitle: signatory.title,
            signatoryCompany: signatory.company,
            signatoryPhone: signatory.phone,
            signatoryEmail: signatory.email,
            recipientName: recipient.name,
            recipientTitle: recipient.title,
            recipientAddress: recipient.address,
            subject,
            fontSize: formatting.fontSize,
            lineSpacing: formatting.lineSpacing,
          });
        }}
      />
      
      <AccessibilitySettings
        isOpen={activeModal === "accessibility"}
        onClose={closeModal}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // Refresh templates after login
          userTemplates;
        }}
      />

      {/* My Templates Modal */}
      <MyTemplates
        isOpen={showMyTemplates}
        onClose={() => setShowMyTemplates(false)}
        onSelectTemplate={(template) => {
          setDocumentType(template.documentType);
          setBodyText(template.bodyText);
          toast.success(`Loaded template: ${template.name}`);
        }}
        onCreateNew={() => {
          setShowMyTemplates(false);
          openModal("saveTemplate");
        }}
      />

      {/* Confetti */}
      <Confetti trigger={showConfetti && confettiEnabled} onComplete={() => setShowConfetti(false)} />

      {/* Focus Mode Exit */}
      {focusMode && (
        <button
          onClick={() => handleSettingsChange({ ...appSettings, focusMode: false })}
          className="fixed top-4 right-4 px-4 py-2 rounded-xl bg-[--bg-elevated] border border-[--border-default] text-sm z-50 hover:bg-[--bg-overlay] transition-colors"
        >
          Exit Focus Mode
        </button>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="offline-indicator">
          📴 You&apos;re offline. Changes will be saved locally.
        </div>
      )}
    </>
  );
}
