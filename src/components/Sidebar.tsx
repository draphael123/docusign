"use client";

import { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Eye,
  Save,
  Trash2,
  HelpCircle,
  Layout,
  Keyboard,
  Link,
  Key,
  Timer,
  Shield,
  Sparkles,
} from "lucide-react";

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
  badge?: number;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
  isOpen: boolean;
  onToggle: () => void;
  theme: "dark" | "light";
}

export default function Sidebar({ sections, isOpen, onToggle, theme }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const bgColor = theme === "light" ? "bg-white/95" : "bg-[#0d0d14]/95";
  const borderColor = theme === "light" ? "border-gray-200" : "border-[#1f1f2e]";
  const textColor = theme === "light" ? "text-gray-700" : "text-gray-300";
  const mutedColor = theme === "light" ? "text-gray-400" : "text-gray-500";

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full ${bgColor} backdrop-blur-xl border-r ${borderColor} z-40 transition-all duration-300 ease-out ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Header */}
        <div className={`h-16 flex items-center ${isOpen ? "px-4 justify-between" : "justify-center"} border-b ${borderColor}`}>
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-teal-400 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text text-transparent">
                DocGen
              </span>
            </div>
          )}
          <button
            onClick={onToggle}
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${mutedColor}`}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {isOpen && (
                <h3 className={`px-3 mb-2 text-xs font-medium uppercase tracking-wider ${mutedColor}`}>
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                      hoveredItem === item.id
                        ? "bg-white/10 shadow-lg"
                        : "hover:bg-white/5"
                    }`}
                    style={{
                      boxShadow: hoveredItem === item.id ? `0 4px 20px ${item.color}20` : "none",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{
                        backgroundColor: hoveredItem === item.id ? `${item.color}20` : "transparent",
                        color: item.color,
                      }}
                    >
                      {item.icon}
                    </div>
                    {isOpen && (
                      <>
                        <span className={`flex-1 text-left text-sm ${textColor} group-hover:text-white transition-colors`}>
                          {item.label}
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs text-white"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {!isOpen && hoveredItem === item.id && (
                      <div
                        className="absolute left-full ml-2 px-3 py-2 rounded-lg text-sm text-white whitespace-nowrap z-50"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.label}
                        <div
                          className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content offset */}
      <div className={`transition-all duration-300 ${isOpen ? "ml-64" : "ml-16"}`} />
    </>
  );
}

// Icon mapping helper
export const SidebarIcons = {
  templates: FileText,
  favorites: Star,
  history: History,
  stats: BarChart3,
  profiles: Users,
  versions: GitBranch,
  bulk: Package,
  ai: Bot,
  themes: Palette,
  schedule: Calendar,
  settings: Settings,
  streak: Flame,
  time: Clock,
  preview: Eye,
  save: Save,
  clear: Trash2,
  help: HelpCircle,
  layout: Layout,
  keyboard: Keyboard,
  webhooks: Link,
  api: Key,
  timer: Timer,
  privacy: Shield,
  sparkles: Sparkles,
};

