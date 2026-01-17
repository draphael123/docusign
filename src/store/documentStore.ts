"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signatories } from "@/data/signatories";

// Types
export interface RecipientInfo {
  name: string;
  title: string;
  address: string;
}

export interface SignatoryInfo {
  id: string;
  name: string;
  title: string;
  company?: string;
  phone?: string;
  email?: string;
}

export interface SavedRecipient extends RecipientInfo {
  id: string;
}

export interface FormattingOptions {
  fontSize: number;
  lineSpacing: number;
}

export interface DocumentState {
  // Document content
  documentType: string;
  bodyText: string;
  subject: string;

  // Recipient
  recipient: RecipientInfo;
  savedRecipients: SavedRecipient[];

  // Signatory
  selectedSignatoryId: string;
  useCustomSignatory: boolean;
  customSignatory: SignatoryInfo;

  // Formatting
  formatting: FormattingOptions;

  // Tags
  documentTags: string[];

  // UI State
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;

  // Undo
  undoStack: string[];

  // Actions
  setDocumentType: (type: string) => void;
  setBodyText: (text: string) => void;
  setSubject: (subject: string) => void;
  setRecipient: (recipient: Partial<RecipientInfo>) => void;
  addSavedRecipient: (recipient: SavedRecipient) => void;
  removeSavedRecipient: (id: string) => void;
  setSelectedSignatory: (id: string) => void;
  setUseCustomSignatory: (use: boolean) => void;
  setCustomSignatory: (signatory: Partial<SignatoryInfo>) => void;
  setFormatting: (options: Partial<FormattingOptions>) => void;
  setDocumentTags: (tags: string[]) => void;
  markSaved: () => void;
  pushToUndoStack: (text: string) => void;
  undo: () => string | null;
  clearDocument: () => void;
  loadDraft: (draft: Partial<DocumentState>) => void;
  getSignatory: () => SignatoryInfo;
}

const DEFAULT_RECIPIENT: RecipientInfo = {
  name: "",
  title: "",
  address: "",
};

const DEFAULT_CUSTOM_SIGNATORY: SignatoryInfo = {
  id: "custom",
  name: "",
  title: "",
  company: undefined,
  phone: undefined,
  email: undefined,
};

const DEFAULT_FORMATTING: FormattingOptions = {
  fontSize: 11,
  lineSpacing: 1.5,
};

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      // Initial state
      documentType: "Letter of Recommendation",
      bodyText: "",
      subject: "",
      recipient: DEFAULT_RECIPIENT,
      savedRecipients: [],
      selectedSignatoryId: signatories[0]?.id || "",
      useCustomSignatory: false,
      customSignatory: DEFAULT_CUSTOM_SIGNATORY,
      formatting: DEFAULT_FORMATTING,
      documentTags: [],
      hasUnsavedChanges: false,
      lastSaved: null,
      undoStack: [],

      // Actions
      setDocumentType: (type) =>
        set({ documentType: type, hasUnsavedChanges: true }),

      setBodyText: (text) => {
        const current = get().bodyText;
        // Add to undo stack if significant change
        if (text.length - current.length > 20 || current.length - text.length > 20) {
          set((state) => ({
            undoStack: [...state.undoStack.slice(-19), current],
          }));
        }
        set({ bodyText: text, hasUnsavedChanges: true });
      },

      setSubject: (subject) => set({ subject, hasUnsavedChanges: true }),

      setRecipient: (recipient) =>
        set((state) => ({
          recipient: { ...state.recipient, ...recipient },
          hasUnsavedChanges: true,
        })),

      addSavedRecipient: (recipient) =>
        set((state) => ({
          savedRecipients: [...state.savedRecipients, recipient],
        })),

      removeSavedRecipient: (id) =>
        set((state) => ({
          savedRecipients: state.savedRecipients.filter((r) => r.id !== id),
        })),

      setSelectedSignatory: (id) =>
        set({ selectedSignatoryId: id, useCustomSignatory: false, hasUnsavedChanges: true }),

      setUseCustomSignatory: (use) =>
        set({ useCustomSignatory: use, hasUnsavedChanges: true }),

      setCustomSignatory: (signatory) =>
        set((state) => ({
          customSignatory: { ...state.customSignatory, ...signatory },
          useCustomSignatory: true,
          hasUnsavedChanges: true,
        })),

      setFormatting: (options) =>
        set((state) => ({
          formatting: { ...state.formatting, ...options },
          hasUnsavedChanges: true,
        })),

      setDocumentTags: (tags) => set({ documentTags: tags }),

      markSaved: () =>
        set({ hasUnsavedChanges: false, lastSaved: new Date() }),

      pushToUndoStack: (text) =>
        set((state) => ({
          undoStack: [...state.undoStack.slice(-19), text],
        })),

      undo: () => {
        const { undoStack } = get();
        if (undoStack.length === 0) return null;
        const previous = undoStack[undoStack.length - 1];
        set({
          undoStack: undoStack.slice(0, -1),
          bodyText: previous,
          hasUnsavedChanges: true,
        });
        return previous;
      },

      clearDocument: () =>
        set({
          documentType: "Letter of Recommendation",
          bodyText: "",
          subject: "",
          recipient: DEFAULT_RECIPIENT,
          selectedSignatoryId: signatories[0]?.id || "",
          useCustomSignatory: false,
          customSignatory: DEFAULT_CUSTOM_SIGNATORY,
          formatting: DEFAULT_FORMATTING,
          documentTags: [],
          undoStack: [],
          hasUnsavedChanges: false,
        }),

      loadDraft: (draft) => set({ ...draft, hasUnsavedChanges: false }),

      getSignatory: () => {
        const state = get();
        if (state.useCustomSignatory) {
          return state.customSignatory;
        }
        const found = signatories.find((s) => s.id === state.selectedSignatoryId);
        return found || signatories[0];
      },
    }),
    {
      name: "document-store",
      partialize: (state) => ({
        documentType: state.documentType,
        bodyText: state.bodyText,
        subject: state.subject,
        recipient: state.recipient,
        savedRecipients: state.savedRecipients,
        selectedSignatoryId: state.selectedSignatoryId,
        useCustomSignatory: state.useCustomSignatory,
        customSignatory: state.customSignatory,
        formatting: state.formatting,
        documentTags: state.documentTags,
      }),
    }
  )
);

// UI Store for modals and panels
export interface UIState {
  // Theme
  theme: "dark" | "light";
  sidebarOpen: boolean;

  // Modals
  activeModal: string | null;
  commandPaletteOpen: boolean;

  // Settings
  focusMode: boolean;
  compactMode: boolean;
  soundEffects: boolean;
  confettiEnabled: boolean;

  // Actions
  setTheme: (theme: "dark" | "light") => void;
  toggleSidebar: () => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  toggleCommandPalette: () => void;
  setFocusMode: (enabled: boolean) => void;
  setCompactMode: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  setConfettiEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "dark",
      sidebarOpen: true,
      activeModal: null,
      commandPaletteOpen: false,
      focusMode: false,
      compactMode: false,
      soundEffects: true,
      confettiEnabled: true,

      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("light", theme === "light");
        }
        set({ theme });
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      openModal: (modal) => set({ activeModal: modal }),

      closeModal: () => set({ activeModal: null }),

      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      setFocusMode: (enabled) => set({ focusMode: enabled }),

      setCompactMode: (enabled) => set({ compactMode: enabled }),

      setSoundEffects: (enabled) => set({ soundEffects: enabled }),

      setConfettiEnabled: (enabled) => set({ confettiEnabled: enabled }),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        focusMode: state.focusMode,
        compactMode: state.compactMode,
        soundEffects: state.soundEffects,
        confettiEnabled: state.confettiEnabled,
      }),
    }
  )
);

