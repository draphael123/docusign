"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useUIStore, useDocumentStore } from "@/store/documentStore";
import {
  Search,
  FileText,
  Star,
  History,
  Settings,
  Download,
  Eye,
  Palette,
  Users,
  Calendar,
  Key,
  HelpCircle,
  Sparkles,
  Package,
  Sun,
  Moon,
  Keyboard,
  Save,
  Trash2,
  BarChart3,
  GitBranch,
  FileDown,
  Globe,
  Link,
  Clock,
  Command,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  onAction?: (action: string) => void;
}

export default function CommandPalette({ onAction }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { commandPaletteOpen, toggleCommandPalette, openModal, theme, setTheme } = useUIStore();
  const { clearDocument, markSaved } = useDocumentStore();

  // Define commands
  const commands: CommandItem[] = useMemo(
    () => [
      // Quick Actions
      {
        id: "preview",
        label: "Preview PDF",
        description: "Preview the current document",
        icon: <Eye className="w-4 h-4" />,
        shortcut: "⌘P",
        action: () => onAction?.("preview"),
        category: "Quick Actions",
      },
      {
        id: "download",
        label: "Download PDF",
        description: "Generate and download PDF",
        icon: <Download className="w-4 h-4" />,
        shortcut: "⌘D",
        action: () => onAction?.("download"),
        category: "Quick Actions",
      },
      {
        id: "save",
        label: "Save Draft",
        description: "Save current document as draft",
        icon: <Save className="w-4 h-4" />,
        shortcut: "⌘S",
        action: () => {
          markSaved();
          onAction?.("save");
        },
        category: "Quick Actions",
      },
      {
        id: "clear",
        label: "Clear Document",
        description: "Reset all fields",
        icon: <Trash2 className="w-4 h-4" />,
        action: () => clearDocument(),
        category: "Quick Actions",
      },

      // Create
      {
        id: "templates",
        label: "Browse Templates",
        description: "Choose from template gallery",
        icon: <FileText className="w-4 h-4" />,
        shortcut: "⌘T",
        action: () => openModal("templates"),
        category: "Create",
      },
      {
        id: "ai-assistant",
        label: "AI Writing Assistant",
        description: "Get AI help with writing",
        icon: <Sparkles className="w-4 h-4" />,
        action: () => openModal("ai"),
        category: "Create",
      },
      {
        id: "bulk",
        label: "Bulk Generation",
        description: "Generate multiple documents",
        icon: <Package className="w-4 h-4" />,
        action: () => openModal("bulk"),
        category: "Create",
      },
      {
        id: "favorites",
        label: "Favorites",
        description: "View saved favorites",
        icon: <Star className="w-4 h-4" />,
        action: () => openModal("favorites"),
        category: "Create",
      },

      // History
      {
        id: "history",
        label: "Document History",
        description: "View past documents",
        icon: <History className="w-4 h-4" />,
        action: () => openModal("history"),
        category: "History",
      },
      {
        id: "versions",
        label: "Version History",
        description: "View document versions",
        icon: <GitBranch className="w-4 h-4" />,
        action: () => openModal("versions"),
        category: "History",
      },
      {
        id: "exports",
        label: "Export History",
        description: "View exported documents",
        icon: <FileDown className="w-4 h-4" />,
        action: () => openModal("exports"),
        category: "History",
      },

      // Analytics
      {
        id: "statistics",
        label: "Statistics",
        description: "View usage statistics",
        icon: <BarChart3 className="w-4 h-4" />,
        action: () => openModal("statistics"),
        category: "Analytics",
      },
      {
        id: "time-tracking",
        label: "Time Tracking",
        description: "View time spent on documents",
        icon: <Clock className="w-4 h-4" />,
        action: () => openModal("time"),
        category: "Analytics",
      },

      // Customize
      {
        id: "themes",
        label: "PDF Themes",
        description: "Change document appearance",
        icon: <Palette className="w-4 h-4" />,
        action: () => openModal("themes"),
        category: "Customize",
      },
      {
        id: "branding",
        label: "Branding",
        description: "Custom branding settings",
        icon: <Globe className="w-4 h-4" />,
        action: () => openModal("branding"),
        category: "Customize",
      },
      {
        id: "profiles",
        label: "Profiles",
        description: "Manage sender/recipient profiles",
        icon: <Users className="w-4 h-4" />,
        action: () => openModal("profiles"),
        category: "Customize",
      },

      // Settings
      {
        id: "settings",
        label: "Settings",
        description: "Application settings",
        icon: <Settings className="w-4 h-4" />,
        shortcut: "⌘,",
        action: () => openModal("settings"),
        category: "Settings",
      },
      {
        id: "toggle-theme",
        label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        description: "Toggle color theme",
        icon: theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
        action: () => setTheme(theme === "dark" ? "light" : "dark"),
        category: "Settings",
      },
      {
        id: "keyboard",
        label: "Keyboard Shortcuts",
        description: "View all shortcuts",
        icon: <Keyboard className="w-4 h-4" />,
        shortcut: "?",
        action: () => openModal("keyboard"),
        category: "Settings",
      },
      {
        id: "help",
        label: "Help & Guide",
        description: "Get help using the app",
        icon: <HelpCircle className="w-4 h-4" />,
        action: () => openModal("help"),
        category: "Settings",
      },

      // Advanced
      {
        id: "schedule",
        label: "Schedule Document",
        description: "Schedule document generation",
        icon: <Calendar className="w-4 h-4" />,
        action: () => openModal("schedule"),
        category: "Advanced",
      },
      {
        id: "teams",
        label: "Team Workspaces",
        description: "Collaborate with team",
        icon: <Users className="w-4 h-4" />,
        action: () => openModal("teams"),
        category: "Advanced",
      },
      {
        id: "webhooks",
        label: "Webhooks",
        description: "Configure integrations",
        icon: <Link className="w-4 h-4" />,
        action: () => openModal("webhooks"),
        category: "Advanced",
      },
      {
        id: "api",
        label: "API Access",
        description: "Manage API keys",
        icon: <Key className="w-4 h-4" />,
        action: () => openModal("api"),
        category: "Advanced",
      },
    ],
    [theme, openModal, clearDocument, markSaved, setTheme, onAction]
  );

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Flatten for keyboard navigation
  const flatCommands = useMemo(() => filteredCommands, [filteredCommands]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!commandPaletteOpen) {
        // Open with Cmd/Ctrl + K
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          toggleCommandPalette();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % flatCommands.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + flatCommands.length) % flatCommands.length);
          break;
        case "Enter":
          e.preventDefault();
          if (flatCommands[selectedIndex]) {
            flatCommands[selectedIndex].action();
            toggleCommandPalette();
          }
          break;
        case "Escape":
          e.preventDefault();
          toggleCommandPalette();
          break;
      }
    },
    [commandPaletteOpen, flatCommands, selectedIndex, toggleCommandPalette]
  );

  // Global keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && flatCommands[selectedIndex]) {
      const item = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, flatCommands]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh]"
      onClick={() => toggleCommandPalette()}
    >
      <div
        className="w-full max-w-xl bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-[--border-default]">
          <Search className="w-5 h-5 text-[--text-muted]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-[--text-primary] placeholder:text-[--text-muted]"
          />
          <kbd className="kbd">⌘K</kbd>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-[60vh] overflow-auto p-2">
          {Object.entries(groupedCommands).length === 0 ? (
            <div className="py-12 text-center text-[--text-muted]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="px-3 py-2 text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                  {category}
                </div>
                {items.map((cmd) => {
                  const index = flatCommands.indexOf(cmd);
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      data-index={index}
                      onClick={() => {
                        cmd.action();
                        toggleCommandPalette();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isSelected
                          ? "bg-[--color-primary]/15 text-[--color-primary]"
                          : "text-[--text-primary] hover:bg-white/5"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-[--color-primary]/20" : "bg-[--bg-elevated]"
                        }`}
                      >
                        {cmd.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-[--text-muted]">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && <kbd className="kbd text-xs">{cmd.shortcut}</kbd>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[--border-default] flex items-center justify-between text-xs text-[--text-muted]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="kbd">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="kbd">↵</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="kbd">esc</kbd> close
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}

