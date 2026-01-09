"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import UserGuide from "@/components/UserGuide";
import FavoritesPanel from "@/components/FavoritesPanel";
import Confetti from "@/components/Confetti";
import PrivacySettings from "@/components/PrivacySettings";
import SkipToContent from "@/components/SkipToContent";
import SettingsPanel, { AppSettings, DEFAULT_SETTINGS } from "@/components/SettingsPanel";
import PomodoroTimer from "@/components/PomodoroTimer";
import StreakDisplay, { useStreak } from "@/components/StreakTracker";
import QuickTemplates, { usePinnedTemplates } from "@/components/QuickTemplates";
import ProfileManager, { useProfiles, SenderProfile, RecipientProfile } from "@/components/ProfileManager";
import VersionHistory, { useVersionHistory } from "@/components/VersionHistory";
import TemplateAnalytics, { useTemplateAnalytics } from "@/components/TemplateAnalytics";
import { useTimeTracker, TimeTrackerDisplay, TimeStatsModal } from "@/components/TimeTracker";
import SpellCheckPanel, { ReadabilityIndicator, useSpellCheck } from "@/components/SpellChecker";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import {
  saveLastUsedSettings,
  getLastUsedSettings,
  saveFavorite,
  FavoriteSettings,
} from "@/utils/favorites";

// New feature imports
import FindReplace from "@/components/FindReplace";
import OnboardingTour, { useOnboarding } from "@/components/OnboardingTour";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import DocumentTags, { TagManager, useDocumentTags } from "@/components/DocumentTags";
import ProgressIndicator from "@/components/ProgressIndicator";
import BulkGeneration from "@/components/BulkGeneration";
import CustomBranding, { useBranding, DEFAULT_BRANDING, BrandingSettings } from "@/components/CustomBranding";
import AuditTrail, { useAuditTrail } from "@/components/AuditTrail";
import PDFThemes, { usePDFThemes, PRESET_THEMES, PDFTheme } from "@/components/PDFThemes";
import ExportHistory, { useExportHistory } from "@/components/ExportHistory";
import DragDropUpload from "@/components/DragDropUpload";
import DocumentComparison from "@/components/DocumentComparison";
import TeamWorkspaces from "@/components/TeamWorkspaces";
import AIWritingAssistant from "@/components/AIWritingAssistant";
import WebhookIntegration from "@/components/WebhookIntegration";
import DocumentScheduling from "@/components/DocumentScheduling";
import APIAccess from "@/components/APIAccess";
import LanguageSelector, { useLanguage, LanguageProvider } from "@/components/LanguageSelector";
import DocumentExpiration from "@/components/DocumentExpiration";
import AutoSaveIndicator from "@/components/AutoSaveIndicator";
import Sidebar, { SidebarIcons } from "@/components/Sidebar";

// New feature imports - Phase 2
import TemplateVariables, { useTemplateVariables } from "@/components/TemplateVariables";
import PageSettings, { PageConfig, DEFAULT_PAGE_CONFIG } from "@/components/PageSettings";
import SignaturePlacement, { SignatureField } from "@/components/SignaturePlacement";
import QuickDuplicate from "@/components/QuickDuplicate";
import DocumentSearch from "@/components/DocumentSearch";
import ContactAutofill, { useContacts, Contact } from "@/components/ContactAutofill";
import ApprovalWorkflow, { useApprovalWorkflow, Approver } from "@/components/ApprovalWorkflow";
import DocumentRevisions, { useDocumentRevisions } from "@/components/DocumentRevisions";
import BatchSend from "@/components/BatchSend";
import PDFImport from "@/components/PDFImport";
import { parseSmartDate, formatDate, getSmartDateSuggestions } from "@/utils/smartDate";
import Card, { CardHeader, StatsCard } from "@/components/Card";
import Button, { IconButton, ButtonGroup } from "@/components/Button";
import { Skeleton, FormSectionSkeleton } from "@/components/Skeleton";
import {
  FileText,
  Star,
  History,
  BarChart3,
  Users,
  GitBranch,
  Package,
  Bot,
  Palette,
  Calendar,
  Settings,
  Flame,
  Clock,
  Eye,
  Save,
  Trash2,
  HelpCircle,
  Keyboard,
  Link as LinkIcon,
  Key,
  Shield,
  Download,
  FileDown,
  Copy,
  Undo2,
  CalendarDays,
  Minus,
  PenLine,
  Search,
  MoreHorizontal,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  Timer,
  Zap,
  Globe,
  X,
} from "lucide-react";

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

interface SavedRecipient {
  id: string;
  name: string;
  title: string;
  address: string;
}

export default function Home() {
  const [documentType, setDocumentType] = useState<string>("Letter of Recommendation");
  const [selectedSignatory, setSelectedSignatory] = useState<string>(signatories[0].id);
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled] = useState<boolean>(true);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Undo history
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [lastBodyText, setLastBodyText] = useState<string>("");

  // Word count goal
  const [wordCountGoal, setWordCountGoal] = useState<number>(0);
  const [showWordGoal, setShowWordGoal] = useState<boolean>(false);

  // Auto-capitalize
  const [autoCapitalize, setAutoCapitalize] = useState<boolean>(false);

  // Recently used
  const [recentDocTypes, setRecentDocTypes] = useState<string[]>([]);
  const [recentSignatories, setRecentSignatories] = useState<string[]>([]);

  // Saved recipients (address book)
  const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([]);
  const [showAddressBook, setShowAddressBook] = useState<boolean>(false);

  // Live preview
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Textarea ref for cursor manipulation
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // New feature states
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showProfiles, setShowProfiles] = useState<boolean>(false);
  const [showVersionHistory, setShowVersionHistory] = useState<boolean>(false);
  const [showStreaks, setShowStreaks] = useState<boolean>(false);
  const [showTemplateAnalytics, setShowTemplateAnalytics] = useState<boolean>(false);
  const [showTimeStats, setShowTimeStats] = useState<boolean>(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState<boolean>(true);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // New feature states
  const [showFindReplace, setShowFindReplace] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);
  const [showTagManager, setShowTagManager] = useState<boolean>(false);
  const [showBulkGeneration, setShowBulkGeneration] = useState<boolean>(false);
  const [showBranding, setShowBranding] = useState<boolean>(false);
  const [showAuditTrail, setShowAuditTrail] = useState<boolean>(false);
  const [showPDFThemes, setShowPDFThemes] = useState<boolean>(false);
  const [showExportHistory, setShowExportHistory] = useState<boolean>(false);
  const [showDocComparison, setShowDocComparison] = useState<boolean>(false);
  const [showTeamWorkspaces, setShowTeamWorkspaces] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [showWebhooks, setShowWebhooks] = useState<boolean>(false);
  const [showScheduling, setShowScheduling] = useState<boolean>(false);
  const [showAPIAccess, setShowAPIAccess] = useState<boolean>(false);
  const [showExpiration, setShowExpiration] = useState<boolean>(false);
  const [documentTags, setDocumentTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Phase 2 feature states
  const [showTemplateVariables, setShowTemplateVariables] = useState<boolean>(false);
  const [showPageSettings, setShowPageSettings] = useState<boolean>(false);
  const [showSignaturePlacement, setShowSignaturePlacement] = useState<boolean>(false);
  const [showQuickDuplicate, setShowQuickDuplicate] = useState<boolean>(false);
  const [showDocumentSearch, setShowDocumentSearch] = useState<boolean>(false);
  const [showApprovalWorkflow, setShowApprovalWorkflow] = useState<boolean>(false);
  const [showDocumentRevisions, setShowDocumentRevisions] = useState<boolean>(false);
  const [showBatchSend, setShowBatchSend] = useState<boolean>(false);
  const [showPDFImport, setShowPDFImport] = useState<boolean>(false);
  const [pageConfig, setPageConfig] = useState<PageConfig>(DEFAULT_PAGE_CONFIG);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Hooks for new features
  const { recordDocument } = useStreak();
  const { pinnedIds, togglePin, isPinned } = usePinnedTemplates();
  const { saveVersion } = useVersionHistory();
  const { playSound } = useSoundEffects(appSettings.soundEffects);
  const { recordTemplateUse } = useTemplateAnalytics();
  const { 
    isTracking, 
    currentSessionSeconds, 
    timeStats, 
    startTracking, 
    stopTracking, 
    formatTime, 
    formatMinutes 
  } = useTimeTracker();

  // New feature hooks
  const { showTour, setShowTour, resetTour } = useOnboarding();
  const { contacts, addContact, importFromRecipients } = useContacts();
  const { hasVariables, variableCount } = useTemplateVariables(bodyText);
  const { workflows, createWorkflow } = useApprovalWorkflow();
  const { saveRevision, getRevisionCount } = useDocumentRevisions("current-doc");
  const { branding, saveBranding } = useBranding();
  const { logEvent } = useAuditTrail();
  const { selectedTheme, selectTheme } = usePDFThemes();
  const { addRecord: addExportRecord } = useExportHistory();

  // Initialize
  useEffect(() => {
    setMounted(true);
    // Simulate initial load
    setTimeout(() => setIsLoading(false), 500);
    
    if (typeof window !== "undefined") {
      // Load sidebar state
      const savedSidebar = localStorage.getItem("sidebarOpen");
      if (savedSidebar !== null) {
        setSidebarOpen(savedSidebar === "true");
      }
      
      // Load theme
      const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("light", savedTheme === "light");
      }

      // Load last saved timestamp
      const lastSavedStr = localStorage.getItem("lastSaved");
      if (lastSavedStr) setLastSaved(new Date(lastSavedStr));

      // Load recent doc types
      const recentTypes = localStorage.getItem("recentDocTypes");
      if (recentTypes) setRecentDocTypes(JSON.parse(recentTypes));

      // Load recent signatories
      const recentSigs = localStorage.getItem("recentSignatories");
      if (recentSigs) setRecentSignatories(JSON.parse(recentSigs));

      // Load saved recipients
      const recipients = localStorage.getItem("savedRecipients");
      if (recipients) setSavedRecipients(JSON.parse(recipients));

      // Load word count goal
      const goal = localStorage.getItem("wordCountGoal");
      if (goal) {
        setWordCountGoal(parseInt(goal));
        setShowWordGoal(true);
      }

      // Load auto-capitalize setting
      const autoCap = localStorage.getItem("autoCapitalize");
      if (autoCap === "true") setAutoCapitalize(true);

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
      setIsOffline(!navigator.onLine);
      const handleOnline = () => { setIsOnline(true); setIsOffline(false); };
      const handleOffline = () => { setIsOnline(false); setIsOffline(true); };
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Track unsaved changes
  useEffect(() => {
    if (mounted) setHasUnsavedChanges(true);
  }, [documentType, selectedSignatory, bodyText, recipientName, recipientTitle, recipientAddress, subject, customSignatoryName, customSignatoryTitle, customSignatoryCompany, customSignatoryPhone, customSignatoryEmail, fontSize, lineSpacing, mounted]);

  // Start time tracking when user starts typing
  useEffect(() => {
    if (mounted && bodyText && !isTracking && bodyText.length > 10) {
      startTracking();
    }
  }, [bodyText, mounted, isTracking, startTracking]);

  // Save to undo stack when body text changes significantly
  useEffect(() => {
    if (bodyText && bodyText !== lastBodyText && bodyText.length - lastBodyText.length > 20) {
      setUndoStack((prev) => [...prev.slice(-19), lastBodyText]);
      setLastBodyText(bodyText);
    }
  }, [bodyText, lastBodyText]);

  // Update recent doc types when changed
  useEffect(() => {
    if (mounted && documentType) {
      const updated = [documentType, ...recentDocTypes.filter((t) => t !== documentType)].slice(0, 5);
      setRecentDocTypes(updated);
      localStorage.setItem("recentDocTypes", JSON.stringify(updated));
    }
  }, [documentType]);

  // Update recent signatories when changed
  useEffect(() => {
    if (mounted && selectedSignatory && !useCustomSignatory) {
      const updated = [selectedSignatory, ...recentSignatories.filter((s) => s !== selectedSignatory)].slice(0, 3);
      setRecentSignatories(updated);
      localStorage.setItem("recentSignatories", JSON.stringify(updated));
    }
  }, [selectedSignatory, useCustomSignatory]);

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
        const signatory = useCustomSignatory
          ? { name: customSignatoryName || "Signatory", title: customSignatoryTitle, company: customSignatoryCompany, phone: customSignatoryPhone, email: customSignatoryEmail }
          : signatories.find((s) => s.id === selectedSignatory) || signatories[0];

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

        if (livePreviewUrl) URL.revokeObjectURL(livePreviewUrl);
        setLivePreviewUrl(URL.createObjectURL(pdfBlob));
      } catch (e) {
        console.error("Live preview error:", e);
      }
    }, 1000);

    return () => {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    };
  }, [showLivePreview, bodyText, documentType, recipientName, recipientTitle, recipientAddress, subject, fontSize, lineSpacing, selectedSignatory, useCustomSignatory, customSignatoryName, customSignatoryTitle, customSignatoryCompany, customSignatoryPhone, customSignatoryEmail]);

  const handleAutoSave = useCallback(() => {
    setIsSaving(true);
    const draft: DraftData = { documentType, selectedSignatory, bodyText, recipientName, recipientTitle, recipientAddress, subject, customSignatoryName, customSignatoryTitle, customSignatoryCompany, customSignatoryPhone, customSignatoryEmail, fontSize, lineSpacing };
    localStorage.setItem("documentDraft", JSON.stringify(draft));
    const now = new Date();
    localStorage.setItem("lastSaved", now.toISOString());
    setLastSaved(now);
    setHasUnsavedChanges(false);
    setTimeout(() => setIsSaving(false), 500);
  }, [documentType, selectedSignatory, bodyText, recipientName, recipientTitle, recipientAddress, subject, customSignatoryName, customSignatoryTitle, customSignatoryCompany, customSignatoryPhone, customSignatoryEmail, fontSize, lineSpacing]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!mounted || !autoSaveEnabled) return;
    const interval = setInterval(() => {
      if (hasUnsavedChanges && bodyText.trim()) handleAutoSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [hasUnsavedChanges, bodyText, autoSaveEnabled, mounted, handleAutoSave]);

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

  // Refresh timestamp
  const [, setRefreshTimestamp] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setRefreshTimestamp(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const characterCount = bodyText.length;
  const wordCount = bodyText.trim() ? bodyText.trim().split(/\s+/).length : 0;

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: "s", ctrl: true, action: () => handleSaveDraft(), description: "Save draft" },
    { key: "p", ctrl: true, action: () => { if (bodyText.trim()) handlePreviewPDF(); }, description: "Preview PDF" },
    { key: "z", ctrl: true, action: () => handleUndo(), description: "Undo" },
    { key: "f", ctrl: true, action: () => setShowFindReplace(true), description: "Find & Replace" },
    { key: "/", ctrl: false, action: () => setShowKeyboardShortcuts(true), description: "Show shortcuts" },
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
        setLastBodyText(draft.bodyText || "");
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

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft: DraftData = { documentType, selectedSignatory, bodyText, recipientName, recipientTitle, recipientAddress, subject, customSignatoryName, customSignatoryTitle, customSignatoryCompany, customSignatoryPhone, customSignatoryEmail, fontSize, lineSpacing };
    localStorage.setItem("documentDraft", JSON.stringify(draft));
  }, [documentType, selectedSignatory, bodyText, recipientName, recipientTitle, recipientAddress, subject, customSignatoryName, customSignatoryTitle, customSignatoryCompany, customSignatoryPhone, customSignatoryEmail, fontSize, lineSpacing]);

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  // Sidebar toggle
  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", String(newState));
  };

  // Sidebar sections config
  const sidebarSections = [
    {
      title: "Create",
      items: [
        { id: "templates", icon: <FileText className="w-5 h-5" />, label: "Templates", color: "#8b5cf6", onClick: () => setShowTemplateGallery(true) },
        { id: "favorites", icon: <Star className="w-5 h-5" />, label: "Favorites", color: "#f59e0b", onClick: () => setShowFavorites(true) },
        { id: "bulk", icon: <Package className="w-5 h-5" />, label: "Bulk Generate", color: "#2dd4bf", onClick: () => setShowBulkGeneration(true) },
        { id: "ai", icon: <Sparkles className="w-5 h-5" />, label: "AI Assistant", color: "#8b5cf6", onClick: () => setShowAIAssistant(true) },
      ],
    },
    {
      title: "History",
      items: [
        { id: "history", icon: <History className="w-5 h-5" />, label: "History", color: "#2dd4bf", onClick: () => setShowHistory(true) },
        { id: "versions", icon: <GitBranch className="w-5 h-5" />, label: "Versions", color: "#22c55e", onClick: () => setShowVersionHistory(true) },
        { id: "exports", icon: <FileDown className="w-5 h-5" />, label: "Exports", color: "#3b82f6", onClick: () => setShowExportHistory(true) },
      ],
    },
    {
      title: "Analytics",
      items: [
        { id: "stats", icon: <BarChart3 className="w-5 h-5" />, label: "Statistics", color: "#3b82f6", onClick: () => setShowStatistics(true) },
        { id: "analytics", icon: <Zap className="w-5 h-5" />, label: "Template Analytics", color: "#a855f7", onClick: () => setShowTemplateAnalytics(true) },
        { id: "time", icon: <Timer className="w-5 h-5" />, label: "Time Tracking", color: "#06b6d4", onClick: () => setShowTimeStats(true) },
      ],
    },
    {
      title: "Customize",
      items: [
        { id: "themes", icon: <Palette className="w-5 h-5" />, label: "PDF Themes", color: "#ec4899", onClick: () => setShowPDFThemes(true) },
        { id: "branding", icon: <Globe className="w-5 h-5" />, label: "Branding", color: "#f59e0b", onClick: () => setShowBranding(true) },
        { id: "profiles", icon: <Users className="w-5 h-5" />, label: "Profiles", color: "#f97316", onClick: () => setShowProfiles(true) },
      ],
    },
    {
      title: "Advanced",
      items: [
        { id: "schedule", icon: <Calendar className="w-5 h-5" />, label: "Schedule", color: "#f43f5e", onClick: () => setShowScheduling(true) },
        { id: "teams", icon: <Users className="w-5 h-5" />, label: "Teams", color: "#8b5cf6", onClick: () => setShowTeamWorkspaces(true) },
        { id: "webhooks", icon: <LinkIcon className="w-5 h-5" />, label: "Webhooks", color: "#2dd4bf", onClick: () => setShowWebhooks(true) },
        { id: "api", icon: <Key className="w-5 h-5" />, label: "API Access", color: "#3b82f6", onClick: () => setShowAPIAccess(true) },
      ],
    },
  ];

  // Settings handler
  const handleSettingsChange = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    localStorage.setItem("appSettings", JSON.stringify(newSettings));
    
    // Apply animated background
    if (newSettings.animatedBackground) {
      document.body.classList.add("animated-bg");
    } else {
      document.body.classList.remove("animated-bg");
    }
    
    // Apply compact mode
    if (newSettings.compactMode) {
      document.body.classList.add("compact-mode");
    } else {
      document.body.classList.remove("compact-mode");
    }
  };

  // Profile handlers
  const handleSelectSenderProfile = (profile: SenderProfile) => {
    setCustomSignatoryName(profile.name);
    setCustomSignatoryTitle(profile.title);
    setCustomSignatoryCompany(profile.company);
    setCustomSignatoryPhone(profile.phone);
    setCustomSignatoryEmail(profile.email);
    setUseCustomSignatory(true);
    playSound("success");
    toast.success(`Loaded profile: ${profile.name}`);
  };

  const handleSelectRecipientProfile = (profile: RecipientProfile) => {
    setRecipientName(profile.name);
    setRecipientTitle(profile.title);
    setRecipientAddress(profile.address);
    playSound("success");
    toast.success(`Loaded recipient: ${profile.name}`);
  };

  // Spell check word replacement
  const handleReplaceWord = (oldWord: string, newWord: string) => {
    const regex = new RegExp(`\\b${oldWord}\\b`, "gi");
    setBodyText(bodyText.replace(regex, newWord));
    playSound("click");
    toast.success(`Replaced "${oldWord}" with "${newWord}"`);
  };

  // Handlers
  const handleSaveDraft = () => {
    handleAutoSave();
    playSound("save");
    toast.success("Draft saved");
  };

  const handleLoadDraft = () => {
    const savedDraft = localStorage.getItem("documentDraft");
    if (savedDraft) {
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
    setUndoStack([]);
    toast.success("Draft cleared");
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previous = undoStack[undoStack.length - 1];
      setUndoStack((prev) => prev.slice(0, -1));
      setBodyText(previous);
      setLastBodyText(previous);
      toast.success("Undone");
    } else {
      toast("Nothing to undo", { icon: "ℹ️" });
    }
  };

  const handleCopyText = () => {
    if (bodyText.trim()) {
      navigator.clipboard.writeText(bodyText);
      toast.success("Copied to clipboard");
    }
  };

  // Quick insert functions
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setBodyText((prev) => prev + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = bodyText.substring(0, start) + text + bodyText.substring(end);
    setBodyText(newText);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const insertDate = () => insertAtCursor(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
  const insertPageBreak = () => insertAtCursor("\n\n--- PAGE BREAK ---\n\n");
  const insertHorizontalLine = () => insertAtCursor("\n─────────────────────────────────────────\n");
  const insertSignatureBlock = () => {
    const block = `\n\n─────────────────────────────────────────\n\nSIGNATURE\n\nSign: ___________________________\n\nPrint Name: _____________________\n\nTitle: __________________________\n\nDate: ___________________________\n\n─────────────────────────────────────────`;
    insertAtCursor(block);
  };

  // Find and highlight placeholders
  const findNextPlaceholder = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const regex = /\[[^\]]+\]/g;
    const matches: { index: number; text: string }[] = [];
    let match;
    while ((match = regex.exec(bodyText)) !== null) {
      matches.push({ index: match.index, text: match[0] });
    }
    if (matches.length === 0) {
      toast("No placeholders found", { icon: "ℹ️" });
      return;
    }
    const currentPos = textarea.selectionEnd;
    const nextMatch = matches.find((m) => m.index >= currentPos) || matches[0];
    if (nextMatch) {
      textarea.focus();
      textarea.setSelectionRange(nextMatch.index, nextMatch.index + nextMatch.text.length);
    }
  };

  // Auto-capitalize handler
  const handleBodyTextChange = (value: string) => {
    if (autoCapitalize && value.length > bodyText.length) {
      const diff = value.substring(bodyText.length);
      if (diff === " " || diff === "\n") {
        const sentences = value.split(/([.!?]\s+)/);
        const capitalized = sentences.map((s, i) => {
          if (i % 2 === 0 && s.length > 0) {
            return s.charAt(0).toUpperCase() + s.slice(1);
          }
          return s;
        }).join("");
        setBodyText(capitalized);
        return;
      }
    }
    setBodyText(value);
  };

  // Save recipient
  const saveCurrentRecipient = () => {
    if (!recipientName.trim()) {
      toast.error("Enter a recipient name first");
      return;
    }
    const newRecipient: SavedRecipient = {
      id: `recipient-${Date.now()}`,
      name: recipientName,
      title: recipientTitle,
      address: recipientAddress,
    };
    const updated = [...savedRecipients, newRecipient];
    setSavedRecipients(updated);
    localStorage.setItem("savedRecipients", JSON.stringify(updated));
    toast.success("Recipient saved");
  };

  const loadRecipient = (recipient: SavedRecipient) => {
    setRecipientName(recipient.name);
    setRecipientTitle(recipient.title);
    setRecipientAddress(recipient.address);
    setShowAddressBook(false);
    toast.success("Recipient loaded");
  };

  const deleteRecipient = (id: string) => {
    const updated = savedRecipients.filter((r) => r.id !== id);
    setSavedRecipients(updated);
    localStorage.setItem("savedRecipients", JSON.stringify(updated));
  };

  // Word count goal
  const setGoal = (goal: number) => {
    setWordCountGoal(goal);
    setShowWordGoal(goal > 0);
    if (goal > 0) {
      localStorage.setItem("wordCountGoal", goal.toString());
    } else {
      localStorage.removeItem("wordCountGoal");
    }
  };

  // Export as Word
  const handleExportWord = async () => {
    if (!bodyText.trim()) {
      toast.error("Please enter document body text");
      return;
    }

    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const { saveAs } = await import("file-saver");

      const signatory = useCustomSignatory
        ? { name: customSignatoryName, title: customSignatoryTitle }
        : signatories.find((s) => s.id === selectedSignatory);

      const paragraphs = bodyText.split("\n").map(
        (line) => new Paragraph({ children: [new TextRun({ text: line, size: fontSize * 2 })] })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ children: [new TextRun({ text: documentType, bold: true, size: 28 })] }),
            new Paragraph({ children: [] }),
            ...paragraphs,
            new Paragraph({ children: [] }),
            new Paragraph({ children: [new TextRun({ text: signatory?.name || "", bold: true })] }),
            new Paragraph({ children: [new TextRun({ text: signatory?.title || "" })] }),
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

  const handlePreviewPDF = async () => {
    if (!bodyText.trim()) {
      toast.error("Please enter document body text");
      return;
    }
    setIsGenerating(true);
    try {
      const signatory = useCustomSignatory
        ? { name: customSignatoryName, title: customSignatoryTitle, company: customSignatoryCompany, phone: customSignatoryPhone, email: customSignatoryEmail }
        : signatories.find((s) => s.id === selectedSignatory);
      if (!signatory || !signatory.name) throw new Error("Signatory information is required");

      const pdfBlob = await generatePDF({ documentType, bodyText, signatoryName: signatory.name, signatoryTitle: signatory.title, signatoryCompany: signatory.company, signatoryPhone: signatory.phone, signatoryEmail: signatory.email, recipientName, recipientTitle, recipientAddress, subject, fontSize, lineSpacing });
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
      const signatory = useCustomSignatory
        ? { name: customSignatoryName, title: customSignatoryTitle, company: customSignatoryCompany, phone: customSignatoryPhone, email: customSignatoryEmail }
        : signatories.find((s) => s.id === selectedSignatory);
      if (!signatory || !signatory.name) throw new Error("Signatory information is required");

      const pdfBlob = await generatePDF({ documentType, bodyText, signatoryName: signatory.name, signatoryTitle: signatory.title, signatoryCompany: signatory.company, signatoryPhone: signatory.phone, signatoryEmail: signatory.email, recipientName, recipientTitle, recipientAddress, subject, fontSize, lineSpacing });
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
        
        // Record for streak tracking
        const streakAchievements = recordDocument();
        const allAchievements = [...newAchievements, ...streakAchievements];
        
        // Record template usage with time
        recordTemplateUse(documentType, documentType, timeSpent);
        
        if (allAchievements.length > 0 && appSettings.confettiEnabled) {
          setShowConfetti(true);
          allAchievements.forEach((a) => toast.success(`Achievement: ${a}`, { duration: 5000 }));
        }
        
        // Save version
        if (appSettings.versionHistoryEnabled) {
          saveVersion(documentType, bodyText);
        }
      }
      saveLastUsedSettings({ documentType, selectedSignatory, useCustomSignatory, customSignatoryName, customSignatoryTitle, customSignatoryCompany, customSignatoryPhone, customSignatoryEmail, fontSize, lineSpacing });
      playSound("complete");
      toast.success(`PDF downloaded${timeSpent > 0 ? ` (${timeSpent}m)` : ""}`);
    } catch (error: any) {
      playSound("error");
      toast.error(error.message || "Error generating PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setDocumentType(template.documentType);
    setBodyText(template.bodyText);
    setLastBodyText(template.bodyText);
    toast.success("Template loaded");
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
    saveFavorite({ name: favoriteName, documentType, selectedSignatory, useCustomSignatory, customSignatoryName, customSignatoryTitle, customSignatoryCompany, customSignatoryPhone, customSignatoryEmail, recipientName, recipientTitle, recipientAddress, subject, fontSize, lineSpacing });
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

  // Phase 2 feature handlers
  const handleDuplicateDocument = (doc: DocumentHistoryItem, newRecipient: { name: string; title: string; address: string }) => {
    setDocumentType(doc.documentType);
    if (doc.bodyText) setBodyText(doc.bodyText);
    setRecipientName(newRecipient.name);
    setRecipientTitle(newRecipient.title);
    setRecipientAddress(newRecipient.address);
    toast.success("Document duplicated with new recipient");
  };

  const handleSearchSelect = (doc: DocumentHistoryItem) => {
    setDocumentType(doc.documentType);
    if (doc.bodyText) setBodyText(doc.bodyText);
    if (doc.recipientName) setRecipientName(doc.recipientName);
    toast.success("Document loaded");
  };

  const handleContactSelect = (contact: Contact) => {
    setRecipientName(contact.name);
    if (contact.title) setRecipientTitle(contact.title);
    if (contact.address) setRecipientAddress(contact.address);
    toast.success("Contact details filled");
  };

  const handleApprovalSubmit = (approvers: Approver[]) => {
    createWorkflow("doc-" + Date.now(), documentType, approvers);
    toast.success(`Submitted for approval (${approvers.length} reviewers)`);
  };

  const handleRestoreRevision = (content: string) => {
    setBodyText(content);
    toast.success("Revision restored");
  };

  const handleBatchGenerate = (recipients: Array<{ name: string }>, filledDocs: string[]) => {
    // In a real app, this would generate multiple PDFs
    toast.success(`Generated ${filledDocs.length} documents`);
    console.log("Batch documents:", filledDocs);
  };

  const handlePDFImport = (text: string) => {
    setBodyText(text);
    toast.success("Document imported");
  };

  const handleApplyVariables = (filledText: string) => {
    setBodyText(filledText);
    toast.success("Variables applied");
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  // Theme-aware classes
  const bgPrimary = theme === "light" ? "bg-transparent" : "bg-transparent";
  const bgSecondary = theme === "light" ? "bg-white/90 backdrop-blur-sm" : "bg-[#12121a]/90 backdrop-blur-sm";
  const bgElevated = theme === "light" ? "bg-[#f0f2f5]" : "bg-[#1a1a24]";
  const textPrimary = theme === "light" ? "text-[#1a1a2e]" : "text-[#fafafa]";
  const textSecondary = theme === "light" ? "text-[#4a4a6a]" : "text-[#a0a0a0]";
  const textMuted = theme === "light" ? "text-[#8888a0]" : "text-[#666680]";
  const borderColor = theme === "light" ? "border-[#e0e0ee]" : "border-[#2a2a3a]";
  
  // Accent colors
  const accentViolet = "text-[#a78bfa]";
  const accentTeal = "text-[#4ecdc4]";
  const accentPink = "text-[#f472b6]";
  const accentGold = "text-[#f0b866]";

  return (
    <>
      <SkipToContent />
      <Toaster position="bottom-right" toastOptions={{ 
        style: { 
          background: theme === "light" ? "#fff" : "#18181b", 
          color: theme === "light" ? "#09090b" : "#fafafa", 
          border: `1px solid ${theme === "light" ? "#e4e4e7" : "#27272a"}`, 
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' 
        } 
      }} />

      {/* Sidebar */}
      {mounted && !appSettings.focusMode && (
        <Sidebar 
          sections={sidebarSections} 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
          theme={theme}
        />
      )}

      <div className={`min-h-screen transition-all duration-300 ${appSettings.compactMode ? "compact-mode" : ""} ${sidebarOpen && !appSettings.focusMode ? "ml-64" : !appSettings.focusMode ? "ml-16" : ""}`}>
        <main id="main-content" className={`${appSettings.compactMode ? "py-4 px-4" : "py-8 px-6 lg:px-8"} ${showLivePreview ? "lg:pr-[420px]" : ""}`} role="main" tabIndex={-1}>
          <div className={`${appSettings.compactMode ? "max-w-2xl" : "max-w-4xl"} mx-auto`}>
            {/* Header */}
            {!appSettings.focusMode && (
            <header className={`${appSettings.compactMode ? "mb-4" : "mb-8"} animate-fade-in`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className={`${appSettings.compactMode ? "text-2xl" : "text-3xl sm:text-4xl"} font-semibold mb-1 ${textPrimary}`}>
                    Document Generator
                  </h1>
                  <p className={`text-sm ${textMuted}`}>Professional documents, ready for signature</p>
                </div>
                <div className="flex items-center gap-2">
                  {mounted && (
                    <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} hasChanges={hasUnsavedChanges} />
                  )}
                  {mounted && (
                    <LanguageSelector compact />
                  )}
                  {mounted && (
                    <IconButton 
                      icon={theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      onClick={toggleTheme}
                      variant="secondary"
                      tooltip={theme === "dark" ? "Light mode" : "Dark mode"}
                    />
                  )}
                  {mounted && (
                    <IconButton 
                      icon={<Settings className="w-5 h-5" />}
                      onClick={() => setShowSettings(true)}
                      variant="ghost"
                      tooltip="Settings"
                    />
                  )}
                </div>
              </div>

              {/* Quick Action Bar */}
              <div className={`flex flex-wrap items-center gap-3 pb-4 border-b border-[--border-default]`}>
                {/* Time Tracker Display */}
                {isTracking && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30">
                    <Timer className="w-4 h-4 text-violet-400" />
                    <TimeTrackerDisplay 
                      currentSessionSeconds={currentSessionSeconds}
                      isTracking={isTracking}
                      formatTime={formatTime}
                      compact={true}
                    />
                  </div>
                )}
                
                <div className="flex-1" />
                
                <ButtonGroup>
                  <IconButton 
                    icon={<Flame className="w-5 h-5" />}
                    onClick={() => setShowStreaks(true)}
                    variant="ghost"
                    tooltip="View streak"
                  />
                  <IconButton 
                    icon={<Eye className="w-5 h-5" />}
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    variant={showLivePreview ? "primary" : "ghost"}
                    tooltip={showLivePreview ? "Hide preview" : "Live preview"}
                  />
                  <IconButton 
                    icon={<Search className="w-5 h-5" />}
                    onClick={() => setShowFindReplace(true)}
                    variant="ghost"
                    tooltip="Find & Replace (Ctrl+F)"
                  />
                  <IconButton 
                    icon={<Keyboard className="w-5 h-5" />}
                    onClick={() => setShowKeyboardShortcuts(true)}
                    variant="ghost"
                    tooltip="Keyboard shortcuts"
                  />
                </ButtonGroup>

                <div className="h-6 w-px bg-[--border-default]" />
                
                <ButtonGroup>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSaveDraft}
                  >
                    Save
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={handleClearDraft}
                  >
                    Clear
                  </Button>
                </ButtonGroup>
              </div>

              {/* Recently Used */}
              {recentDocTypes.length > 1 && !appSettings.focusMode && (
                <div className={`mt-4 flex flex-wrap items-center gap-2 text-xs ${textMuted}`}>
                  <span className="text-[#a78bfa]">Recent:</span>
                  {recentDocTypes.slice(0, 3).map((type, idx) => {
                    const colors = ["#4ecdc4", "#f472b6", "#60a5fa"];
                    const color = colors[idx % colors.length];
                    return (
                      <button key={type} onClick={() => setDocumentType(type)} className={`px-2 py-1 rounded ${bgElevated} border transition-all hover:shadow-md`} style={{ borderColor: color, color: color }}>
                        {type.replace("Letter of ", "")}
                      </button>
                    );
                  })}
                </div>
              )}
              
              {/* Quick Templates */}
              <QuickTemplates 
                templates={[...documentTemplates]}
                onSelectTemplate={handleSelectTemplate}
              />
            </header>
            )}

            {/* Form */}
            <div className="space-y-8">
              {/* Document Type */}
              <section className={`p-5 rounded-xl ${bgSecondary} border ${borderColor} card`}>
                <label htmlFor="documentType" className="section-label mb-3 block">
                  Document Type
                </label>
                <select id="documentType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} className={`w-full px-4 py-3 rounded-lg ${textPrimary} ${bgElevated} border ${borderColor} cursor-pointer`}>
                  {documentTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                </select>
              </section>

              {/* Recipient */}
              <section className={`p-5 rounded-xl ${bgSecondary} border ${borderColor} card`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-label">Recipient Details</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddressBook(true)} className={`text-xs px-2 py-1 ${bgElevated} border ${borderColor} rounded hover:border-[#4ecdc4] hover:text-[#4ecdc4] transition-colors ${textMuted}`}>
                      Address Book ({savedRecipients.length})
                    </button>
                    {recipientName && (
                      <button onClick={saveCurrentRecipient} className="text-xs px-2 py-1 bg-[#4ecdc4] text-[#0a0a12] rounded hover:bg-[#7eddd6] transition-colors font-medium">
                        Save Recipient
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="recipientName" className={`block text-sm ${textMuted} mb-1`}>Name</label>
                    <input type="text" id="recipientName" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={`w-full px-4 py-2.5 rounded-lg ${bgElevated} border ${borderColor} focus:border-[#4ecdc4]`} placeholder="Optional" />
                  </div>
                  <div>
                    <label htmlFor="recipientTitle" className={`block text-sm ${textMuted} mb-1`}>Title</label>
                    <input type="text" id="recipientTitle" value={recipientTitle} onChange={(e) => setRecipientTitle(e.target.value)} className={`w-full px-4 py-2.5 rounded-lg ${bgElevated} border ${borderColor} focus:border-[#4ecdc4]`} placeholder="Optional" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="recipientAddress" className={`block text-sm ${textMuted} mb-1`}>Address</label>
                    <textarea id="recipientAddress" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} rows={2} className={`w-full px-4 py-2.5 rounded-lg resize-none ${bgElevated} border ${borderColor} focus:border-[#4ecdc4]`} placeholder="Optional" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className={`block text-sm ${textMuted} mb-1`}>Subject</label>
                    <input type="text" id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={`w-full px-4 py-2.5 rounded-lg ${bgElevated} border ${borderColor} focus:border-[#4ecdc4]`} placeholder="Optional" />
                  </div>
                </div>
              </section>

              {/* Signatory */}
              <section className={`p-5 rounded-xl ${bgSecondary} border ${borderColor} card`}>
                <h2 className="section-label mb-4">Signatory</h2>
                <div className="space-y-2">
                  {signatories.map((signatory) => (
                    <label key={signatory.id} className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border ${!useCustomSignatory && selectedSignatory === signatory.id ? `${bgElevated} border-[#f472b6] shadow-lg shadow-[#f472b6]/10` : `${bgElevated} ${borderColor} hover:border-[#f472b6]/50`}`}>
                      <input type="radio" name="signatory" value={signatory.id} checked={!useCustomSignatory && selectedSignatory === signatory.id} onChange={(e) => { setSelectedSignatory(e.target.value); setUseCustomSignatory(false); }} className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${!useCustomSignatory && selectedSignatory === signatory.id ? "border-[#f472b6]" : "border-[#666680]"}`}>
                        {!useCustomSignatory && selectedSignatory === signatory.id && <div className="w-2 h-2 rounded-full bg-[#f472b6]" />}
                      </div>
                      <div>
                        <div className={textPrimary}>{signatory.name}</div>
                        <div className={`text-sm ${textMuted}`}>{signatory.title}</div>
                      </div>
                    </label>
                  ))}
                  <div className={`p-4 rounded-lg border transition-all ${useCustomSignatory ? `${bgElevated} border-[#f472b6] shadow-lg shadow-[#f472b6]/10` : `${bgElevated} ${borderColor}`}`}>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="signatory" checked={useCustomSignatory} onChange={() => setUseCustomSignatory(true)} className="sr-only" />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${useCustomSignatory ? "border-[#f472b6]" : "border-[#666680]"}`}>
                        {useCustomSignatory && <div className="w-2 h-2 rounded-full bg-[#f472b6]" />}
                      </div>
                      <span className={textPrimary}>Custom Signatory</span>
                    </label>
                    {useCustomSignatory && (
                      <div className="mt-4 space-y-3 pl-7">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" value={customSignatoryName} onChange={(e) => setCustomSignatoryName(e.target.value)} placeholder="Name *" className={`px-3 py-2 rounded-lg text-sm ${bgElevated} border ${borderColor} focus:border-[#f472b6]`} />
                          <input type="text" value={customSignatoryTitle} onChange={(e) => setCustomSignatoryTitle(e.target.value)} placeholder="Title" className={`px-3 py-2 rounded-lg text-sm ${bgElevated} border ${borderColor} focus:border-[#f472b6]`} />
                        </div>
                        <input type="text" value={customSignatoryCompany} onChange={(e) => setCustomSignatoryCompany(e.target.value)} placeholder="Company" className={`w-full px-3 py-2 rounded-lg text-sm ${bgElevated} border ${borderColor} focus:border-[#f472b6]`} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" value={customSignatoryPhone} onChange={(e) => setCustomSignatoryPhone(e.target.value)} placeholder="Phone" className={`px-3 py-2 rounded-lg text-sm ${bgSecondary} border ${borderColor}`} />
                          <input type="email" value={customSignatoryEmail} onChange={(e) => setCustomSignatoryEmail(e.target.value)} placeholder="Email" className={`px-3 py-2 rounded-lg text-sm ${bgSecondary} border ${borderColor}`} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Formatting */}
              <section className={`p-5 rounded-xl ${bgSecondary} border ${borderColor} card`}>
                <h2 className="section-label mb-4">Formatting</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fontSize" className={`block text-sm ${textMuted} mb-2`}>Font Size: <span className="text-[#a78bfa]">{fontSize}pt</span></label>
                    <input type="range" id="fontSize" min="9" max="14" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <label htmlFor="lineSpacing" className={`block text-sm ${textMuted} mb-2`}>Line Spacing: <span className="text-[#4ecdc4]">{lineSpacing.toFixed(1)}</span></label>
                    <input type="range" id="lineSpacing" min="1" max="2.5" step="0.1" value={lineSpacing} onChange={(e) => setLineSpacing(Number(e.target.value))} className="w-full" />
                  </div>
                </div>
              </section>

              {/* Document Body */}
              <section className={`p-5 rounded-xl ${bgSecondary} border ${borderColor} card`}>
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="bodyText" className="section-label">Document Body</label>
                  <div className="flex items-center gap-3">
                    {showWordGoal && wordCountGoal > 0 && (
                      <div className="flex items-center gap-2">
                        <div className={`w-20 h-1.5 rounded-full ${bgElevated} overflow-hidden`}>
                          <div className="h-full bg-gradient-to-r from-[#f0b866] to-[#4ecdc4] transition-all" style={{ width: `${Math.min(100, (wordCount / wordCountGoal) * 100)}%` }} />
                        </div>
                        <span className={`text-xs ${textMuted}`}>{wordCount}/{wordCountGoal}</span>
                      </div>
                    )}
                    <span className={`text-xs ${textMuted}`}>{wordCount} words · {characterCount} chars</span>
                  </div>
                </div>

                {/* Quick Insert Toolbar */}
                <div className={`flex flex-wrap gap-1 mb-2 p-2 rounded-lg ${bgElevated} border ${borderColor}`}>
                  <button onClick={insertDate} className="px-2 py-1 text-xs text-[#60a5fa] hover:bg-[#60a5fa]/15 rounded transition-colors" title="Insert today's date">Date</button>
                  <button onClick={insertHorizontalLine} className="px-2 py-1 text-xs text-[#4ecdc4] hover:bg-[#4ecdc4]/15 rounded transition-colors" title="Insert horizontal line">Line</button>
                  <button onClick={insertPageBreak} className="px-2 py-1 text-xs text-[#a78bfa] hover:bg-[#a78bfa]/15 rounded transition-colors" title="Insert page break">Page Break</button>
                  <button onClick={insertSignatureBlock} className="px-2 py-1 text-xs text-[#f472b6] hover:bg-[#f472b6]/15 rounded transition-colors" title="Insert signature block">Signature</button>
                  <div className={`w-px h-4 ${borderColor} mx-1 self-center`} />
                  <button onClick={findNextPlaceholder} className="px-2 py-1 text-xs text-[#f0b866] hover:bg-[#f0b866]/15 rounded transition-colors" title="Find next [placeholder]">Find [...]</button>
                  <button onClick={handleCopyText} className="px-2 py-1 text-xs text-[#4ade80] hover:bg-[#4ade80]/15 rounded transition-colors" title="Copy to clipboard">Copy</button>
                  <button onClick={handleUndo} className="px-2 py-1 text-xs text-[#ff7a7a] hover:bg-[#ff7a7a]/15 rounded transition-colors" title="Undo (Ctrl+Z)">Undo</button>
                  <div className="flex-1" />
                  <button onClick={() => setAutoCapitalize(!autoCapitalize)} className={`px-2 py-1 text-xs rounded transition-colors ${autoCapitalize ? "bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white" : "text-[#a78bfa] hover:bg-[#a78bfa]/15"}`} title="Auto-capitalize sentences">
                    Aa
                  </button>
                  <button onClick={() => { const goal = prompt("Word count goal (0 to disable):", wordCountGoal.toString()); if (goal !== null) setGoal(parseInt(goal) || 0); }} className="px-2 py-1 text-xs text-[#4ecdc4] hover:bg-[#4ecdc4]/15 rounded transition-colors" title="Set word count goal">
                    Goal
                  </button>
                </div>

                <textarea ref={textareaRef} id="bodyText" value={bodyText} onChange={(e) => handleBodyTextChange(e.target.value)} rows={12} className={`w-full px-4 py-3 rounded-lg resize-y ${bgSecondary} border ${borderColor} ${textPrimary} ${bodyText.trim() && wordCount < 20 ? "border-[#f87171] focus:border-[#f87171]" : ""}`} placeholder="Enter the document content... Use [brackets] for placeholders." spellCheck={spellCheckEnabled} />

                {/* Writing Tools */}
                {bodyText.trim() && (
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Readability Score */}
                    <ReadabilityIndicator text={bodyText} />
                    
                    {/* Spell Check Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                      <div className="flex items-center gap-2">
                        <span className="text-white">🔍 Writing Check</span>
                      </div>
                      <button
                        onClick={() => setSpellCheckEnabled(!spellCheckEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          spellCheckEnabled ? "bg-[#4ecdc4]" : "bg-[#3a3a4a]"
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          spellCheckEnabled ? "left-7" : "left-1"
                        }`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Spell Check Panel */}
                {bodyText.trim() && spellCheckEnabled && (
                  <div className="mt-4">
                    <SpellCheckPanel 
                      text={bodyText} 
                      enabled={spellCheckEnabled} 
                      onReplaceWord={handleReplaceWord}
                    />
                  </div>
                )}

                {bodyText.trim() && wordCount < 20 && (
                  <p className="mt-2 text-sm text-[#f87171]">Consider adding more content for a professional document.</p>
                )}
              </section>

              {/* Actions */}
              <section className="flex flex-col sm:flex-row gap-3 pt-4">
                <button onClick={handlePreviewPDF} disabled={isGenerating || !bodyText.trim()} className={`flex-1 px-5 py-2.5 rounded-lg ${textPrimary} ${bgElevated} border ${borderColor} hover:border-[--color-primary] hover-lift disabled:opacity-40 disabled:cursor-not-allowed font-medium`}>
                  {isGenerating ? "Working..." : "Preview"}
                </button>
                <button onClick={handleGeneratePDF} disabled={isGenerating || !bodyText.trim()} className="flex-1 px-5 py-2.5 rounded-lg text-white bg-[--color-primary] hover:bg-[--color-primary-hover] hover-lift disabled:opacity-40 disabled:cursor-not-allowed font-medium">
                  {isGenerating ? "Working..." : "Download PDF"}
                </button>
                <button onClick={handleExportWord} disabled={isGenerating || !bodyText.trim()} className={`px-5 py-2.5 rounded-lg ${textPrimary} ${bgElevated} border ${borderColor} hover:border-[--color-accent] hover-lift disabled:opacity-40 disabled:cursor-not-allowed font-medium`}>
                  Export Word
                </button>
              </section>

              {/* Progress Indicator */}
              <section className="py-4">
                <ProgressIndicator
                  bodyText={bodyText}
                  recipientName={recipientName}
                  signatorySelected={!!selectedSignatory || (useCustomSignatory && !!customSignatoryName)}
                  documentType={documentType}
                  compact={appSettings.compactMode}
                />
              </section>

              {/* Quick Actions */}
              <section className={`flex flex-wrap gap-3 pt-4 border-t ${borderColor}`}>
                <button onClick={handleUseLastSettings} className="text-sm text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">Use last settings</button>
                <span className={textMuted}>·</span>
                <button onClick={handleSaveAsFavorite} className="text-sm text-[#f472b6] hover:text-[#f9a8d4] transition-colors">Save as favorite</button>
                <span className={textMuted}>·</span>
                <button onClick={() => setShowDocComparison(true)} className="text-sm text-[#4ecdc4] hover:text-[#7eddd6] transition-colors">Compare</button>
                <span className={textMuted}>·</span>
                <button onClick={() => setShowBranding(true)} className="text-sm text-[#fbbf24] hover:text-[#fcd34d] transition-colors">Branding</button>
                <span className={textMuted}>·</span>
                <button onClick={() => setShowExportHistory(true)} className="text-sm text-[#60a5fa] hover:text-[#93c5fd] transition-colors">Export History</button>
                <span className={textMuted}>·</span>
                <button onClick={() => setShowGuide(true)} className="text-sm text-[#4ade80] hover:text-[#86efac] transition-colors">Help</button>
                <span className={textMuted}>·</span>
                <button onClick={() => setShowKeyboardShortcuts(true)} className="text-sm text-[#fb923c] hover:text-[#fdba74] transition-colors">⌨️</button>
                <span className={textMuted}>·</span>
                <button onClick={() => setShowPrivacySettings(true)} className="text-sm text-[#f472b6] hover:text-[#f9a8d4] transition-colors">Privacy</button>
              </section>

              {/* Advanced Features */}
              <section className={`flex flex-wrap gap-3 pt-4 border-t ${borderColor}`}>
                <button onClick={() => setShowTeamWorkspaces(true)} className="text-sm text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">👥 Teams</button>
                <button onClick={() => setShowWebhooks(true)} className="text-sm text-[#4ecdc4] hover:text-[#7eddd6] transition-colors">🔗 Webhooks</button>
                <button onClick={() => setShowAPIAccess(true)} className="text-sm text-[#60a5fa] hover:text-[#93c5fd] transition-colors">🔑 API</button>
                <button onClick={() => setShowExpiration(true)} className="text-sm text-[#f87171] hover:text-[#fca5a5] transition-colors">⏳ Expiration</button>
                <button onClick={() => setShowAuditTrail(true)} className="text-sm text-[#f0b866] hover:text-[#f5c97a] transition-colors">📜 Audit</button>
                <button onClick={resetTour} className="text-sm text-[#c084fc] hover:text-[#d8b4fe] transition-colors">🎓 Tour</button>
                <div className="flex-1" />
                <Link href="/suggestions" className="text-sm text-[#f0b866] hover:text-[#f5c97a] transition-colors">💬 Feedback</Link>
              </section>
            </div>
          </div>
        </main>

        {/* Live Preview Panel */}
        {showLivePreview && (
          <div className={`fixed right-0 top-0 bottom-0 w-[400px] ${bgSecondary} border-l ${borderColor} p-4 hidden lg:flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-medium ${textPrimary}`}>Live Preview</h3>
              <button onClick={() => setShowLivePreview(false)} className={`${textMuted} hover:${textPrimary}`}>×</button>
            </div>
            <div className={`flex-1 rounded-lg ${bgElevated} overflow-hidden`}>
              {livePreviewUrl ? (
                <iframe src={livePreviewUrl} className="w-full h-full bg-white" title="Live Preview" />
              ) : (
                <div className={`flex items-center justify-center h-full ${textMuted} text-sm`}>
                  Start typing to see preview...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Address Book Modal */}
      {showAddressBook && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className={`${bgSecondary} rounded-lg max-w-md w-full border ${borderColor}`}>
            <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
              <h2 className={`text-lg ${textPrimary}`}>Address Book</h2>
              <button onClick={() => setShowAddressBook(false)} className={`${textMuted} hover:${textPrimary} text-xl`}>×</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-auto">
              {savedRecipients.length === 0 ? (
                <p className={`text-center ${textMuted} py-8`}>No saved recipients yet. Fill in recipient details and click &quot;Save Recipient&quot; to add one.</p>
              ) : (
                <div className="space-y-2">
                  {savedRecipients.map((r) => (
                    <div key={r.id} className={`p-3 rounded-lg ${bgElevated} border ${borderColor} flex items-center justify-between`}>
                      <div className="flex-1 cursor-pointer" onClick={() => loadRecipient(r)}>
                        <div className={textPrimary}>{r.name}</div>
                        {r.title && <div className={`text-sm ${textMuted}`}>{r.title}</div>}
                      </div>
                      <button onClick={() => deleteRecipient(r.id)} className={`${textMuted} hover:text-[#f87171] ml-2`}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className={`${bgSecondary} rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col border ${borderColor}`}>
            <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
              <h2 className={`text-lg ${textPrimary}`}>Preview</h2>
              <button onClick={() => { setShowPreview(false); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }} className={`${textMuted} hover:${textPrimary} text-xl`}>×</button>
            </div>
            <div className={`flex-1 overflow-auto p-4 ${bgElevated}`}>
              <iframe src={previewUrl} className="w-full h-full min-h-[600px] bg-white rounded" title="PDF Preview" />
            </div>
            <div className={`p-4 border-t ${borderColor} flex gap-3`}>
              <button onClick={() => { const link = document.createElement("a"); link.href = previewUrl; const dateStr = new Date().toISOString().split("T")[0]; const signatory = useCustomSignatory ? { name: customSignatoryName } : signatories.find((s) => s.id === selectedSignatory); link.download = `${documentType.replace(/\s+/g, "-")}-${signatory?.name.replace(/\s+/g, "-") || "document"}-${dateStr}.pdf`; link.click(); toast.success("PDF downloaded"); }} className="flex-1 px-4 py-2 rounded-lg text-[#0f0f0f] bg-[#d4a373] hover:bg-[#e5b888] transition-colors">Download</button>
              <button onClick={() => { setShowPreview(false); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }} className={`flex-1 px-4 py-2 rounded-lg ${textPrimary} ${bgElevated} border ${borderColor} hover:bg-opacity-80 transition-colors`}>Close</button>
            </div>
          </div>
        </div>
      )}

      <TemplateGallery isOpen={showTemplateGallery} onClose={() => setShowTemplateGallery(false)} onSelectTemplate={handleSelectTemplate} />
      <StatisticsPanel isOpen={showStatistics} onClose={() => setShowStatistics(false)} />
      <DocumentHistory isOpen={showHistory} onClose={() => setShowHistory(false)} onLoadDocument={handleLoadFromHistory} />
      {showGuide && <UserGuide onClose={() => setShowGuide(false)} />}
      <FavoritesPanel isOpen={showFavorites} onClose={() => setShowFavorites(false)} onLoad={handleLoadFavorite} />
      <Confetti trigger={showConfetti && appSettings.confettiEnabled} onComplete={() => setShowConfetti(false)} />
      <PrivacySettings isOpen={showPrivacySettings} onClose={() => setShowPrivacySettings(false)} />
      
      {/* New Features */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        settings={appSettings} 
        onSettingsChange={handleSettingsChange} 
      />
      <ProfileManager 
        isOpen={showProfiles} 
        onClose={() => setShowProfiles(false)} 
        onSelectSender={handleSelectSenderProfile}
        onSelectRecipient={handleSelectRecipientProfile}
      />
      <VersionHistory 
        isOpen={showVersionHistory} 
        onClose={() => setShowVersionHistory(false)} 
        onRestore={(text) => { setBodyText(text); toast.success("Version restored"); }}
        currentBodyText={bodyText}
        documentType={documentType}
      />
      
      {/* Streak Modal */}
      {showStreaks && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowStreaks(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-w-md w-full">
            <StreakDisplay />
            <button onClick={() => setShowStreaks(false)} className="mt-4 w-full py-2 rounded-lg bg-[#2a2a3a] text-white hover:bg-[#3a3a4a] transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Pomodoro Timer */}
      <PomodoroTimer 
        minutes={appSettings.pomodoroMinutes} 
        isEnabled={appSettings.pomodoroEnabled} 
        onComplete={() => { playSound("complete"); toast.success("Pomodoro complete! Take a break."); }}
        soundEnabled={appSettings.soundEffects}
      />
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 px-4 py-2 rounded-lg bg-[#f87171] text-white text-sm shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Offline Mode
        </div>
      )}
      
      {/* Template Analytics */}
      <TemplateAnalytics 
        isOpen={showTemplateAnalytics} 
        onClose={() => setShowTemplateAnalytics(false)} 
      />
      
      {/* Time Stats Modal */}
      <TimeStatsModal 
        isOpen={showTimeStats} 
        onClose={() => setShowTimeStats(false)} 
        timeStats={timeStats}
        formatMinutes={formatMinutes}
      />
      
      {/* Focus Mode Overlay */}
      {appSettings.focusMode && (
        <button 
          onClick={() => handleSettingsChange({ ...appSettings, focusMode: false })}
          className="fixed top-4 right-4 px-3 py-1.5 rounded-lg bg-[#2a2a3a] text-white text-sm z-50 hover:bg-[#3a3a4a] transition-colors"
        >
          Exit Focus Mode
        </button>
      )}

      {/* New Feature Modals */}
      <FindReplace 
        isOpen={showFindReplace} 
        onClose={() => setShowFindReplace(false)} 
        text={bodyText} 
        onTextChange={setBodyText} 
      />
      
      <KeyboardShortcuts 
        isOpen={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />
      
      <TagManager 
        isOpen={showTagManager} 
        onClose={() => setShowTagManager(false)} 
      />
      
      <BulkGeneration 
        isOpen={showBulkGeneration} 
        onClose={() => setShowBulkGeneration(false)}
        templateBody={bodyText}
        documentType={documentType}
        onGenerate={(records) => {
          toast.success(`Generating ${records.length} documents...`);
          setShowBulkGeneration(false);
        }}
      />
      
      <CustomBranding 
        isOpen={showBranding} 
        onClose={() => setShowBranding(false)}
        branding={branding}
        onBrandingChange={saveBranding}
      />
      
      <AuditTrail 
        isOpen={showAuditTrail} 
        onClose={() => setShowAuditTrail(false)} 
      />
      
      <PDFThemes 
        isOpen={showPDFThemes} 
        onClose={() => setShowPDFThemes(false)}
        selectedTheme={selectedTheme}
        onThemeChange={selectTheme}
      />
      
      <ExportHistory 
        isOpen={showExportHistory} 
        onClose={() => setShowExportHistory(false)} 
      />
      
      <DocumentComparison 
        isOpen={showDocComparison} 
        onClose={() => setShowDocComparison(false)}
        currentText={bodyText}
      />
      
      <TeamWorkspaces 
        isOpen={showTeamWorkspaces} 
        onClose={() => setShowTeamWorkspaces(false)} 
      />
      
      <AIWritingAssistant 
        isOpen={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)}
        onInsert={(text) => {
          insertAtCursor(text);
          toast.success("Text inserted");
        }}
        selectedText={typeof window !== "undefined" ? (window.getSelection?.()?.toString() || "") : ""}
      />
      
      <WebhookIntegration 
        isOpen={showWebhooks} 
        onClose={() => setShowWebhooks(false)} 
      />
      
      <DocumentScheduling 
        isOpen={showScheduling} 
        onClose={() => setShowScheduling(false)}
        currentDocumentType={documentType}
        currentBodyText={bodyText}
        currentRecipientName={recipientName}
        onGenerate={handleGeneratePDF}
      />
      
      <APIAccess 
        isOpen={showAPIAccess} 
        onClose={() => setShowAPIAccess(false)} 
      />
      
      <DocumentExpiration 
        isOpen={showExpiration} 
        onClose={() => setShowExpiration(false)} 
      />

      {/* Phase 2 Feature Modals */}
      <TemplateVariables
        bodyText={bodyText}
        onApply={handleApplyVariables}
        isOpen={showTemplateVariables}
        onClose={() => setShowTemplateVariables(false)}
      />

      <PageSettings
        config={pageConfig}
        onChange={setPageConfig}
        isOpen={showPageSettings}
        onClose={() => setShowPageSettings(false)}
      />

      <SignaturePlacement
        isOpen={showSignaturePlacement}
        onClose={() => setShowSignaturePlacement(false)}
        onSave={setSignatureFields}
        existingFields={signatureFields}
      />

      <QuickDuplicate
        isOpen={showQuickDuplicate}
        onClose={() => setShowQuickDuplicate(false)}
        onDuplicate={handleDuplicateDocument}
      />

      <DocumentSearch
        isOpen={showDocumentSearch}
        onClose={() => setShowDocumentSearch(false)}
        onSelect={handleSearchSelect}
      />

      <ApprovalWorkflow
        isOpen={showApprovalWorkflow}
        onClose={() => setShowApprovalWorkflow(false)}
        documentName={documentType}
        onSubmitForApproval={handleApprovalSubmit}
      />

      <DocumentRevisions
        isOpen={showDocumentRevisions}
        onClose={() => setShowDocumentRevisions(false)}
        documentId="current-doc"
        currentContent={bodyText}
        onRestoreRevision={handleRestoreRevision}
      />

      <BatchSend
        isOpen={showBatchSend}
        onClose={() => setShowBatchSend(false)}
        templateBody={bodyText}
        onGenerateBatch={handleBatchGenerate}
      />

      <PDFImport
        isOpen={showPDFImport}
        onClose={() => setShowPDFImport(false)}
        onImport={handlePDFImport}
      />

      {/* Offline indicator */}
      {isOffline && (
        <div className="offline-indicator">
          📴 You&apos;re offline. Changes will be saved locally.
        </div>
      )}

      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour onComplete={() => setShowTour(false)} />
      )}
    </>
  );
}
