"use client";

import { useState } from "react";
import { useUIStore } from "@/store/documentStore";
import {
  FileText,
  Star,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MoreHorizontal,
  Sparkles,
  Package,
  Palette,
  Users,
  BarChart3,
  Calendar,
  Key,
  Link,
  Command,
} from "lucide-react";

interface SidebarItemConfig {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}

interface SimplifiedSidebarProps {
  onNavigate: (section: string) => void;
}

export default function SimplifiedSidebar({ onNavigate }: SimplifiedSidebarProps) {
  const { sidebarOpen, toggleSidebar, theme, toggleCommandPalette } = useUIStore();
  const [showMore, setShowMore] = useState(false);

  const bgColor = theme === "light" ? "bg-white/95" : "bg-[#0f0f14]/95";
  const borderColor = theme === "light" ? "border-[#e5e0d8]" : "border-[#1f1f2e]";
  const textColor = theme === "light" ? "text-[#2d2a26]" : "text-[#f4f1ed]";
  const textMuted = theme === "light" ? "text-[#8f897f]" : "text-[#7a756d]";

  // Primary navigation items (always visible)
  const primaryItems: SidebarItemConfig[] = [
    { id: "templates", icon: <FileText className="w-5 h-5" />, label: "Templates", color: "#e07a5f" },
    { id: "favorites", icon: <Star className="w-5 h-5" />, label: "Favorites", color: "#f2cc8f" },
    { id: "ai", icon: <Sparkles className="w-5 h-5" />, label: "AI Assistant", color: "#81b29a" },
    { id: "history", icon: <History className="w-5 h-5" />, label: "History", color: "#3d405b" },
  ];

  // Secondary items (shown in "More" section)
  const secondaryItems: SidebarItemConfig[] = [
    { id: "bulk", icon: <Package className="w-5 h-5" />, label: "Bulk Generate", color: "#81b29a" },
    { id: "themes", icon: <Palette className="w-5 h-5" />, label: "PDF Themes", color: "#e07a5f" },
    { id: "profiles", icon: <Users className="w-5 h-5" />, label: "Profiles", color: "#f2cc8f" },
    { id: "statistics", icon: <BarChart3 className="w-5 h-5" />, label: "Statistics", color: "#3d405b" },
    { id: "schedule", icon: <Calendar className="w-5 h-5" />, label: "Schedule", color: "#e07a5f" },
    { id: "teams", icon: <Users className="w-5 h-5" />, label: "Teams", color: "#81b29a" },
    { id: "webhooks", icon: <Link className="w-5 h-5" />, label: "Webhooks", color: "#3d405b" },
    { id: "api", icon: <Key className="w-5 h-5" />, label: "API Access", color: "#f2cc8f" },
  ];

  // Utility items (always at bottom)
  const utilityItems: SidebarItemConfig[] = [
    { id: "settings", icon: <Settings className="w-5 h-5" />, label: "Settings", color: "#7a756d" },
    { id: "help", icon: <HelpCircle className="w-5 h-5" />, label: "Help", color: "#7a756d" },
  ];

  const NavItem = ({ item, showLabel }: { item: SidebarItemConfig; showLabel: boolean }) => {
    const [hovered, setHovered] = useState(false);

    return (
      <button
        onClick={() => onNavigate(item.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
          hovered ? "bg-white/10" : "hover:bg-white/5"
        }`}
        style={{
          boxShadow: hovered ? `0 4px 20px ${item.color}15` : "none",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: hovered ? `${item.color}20` : "transparent",
            color: item.color,
          }}
        >
          {item.icon}
        </div>
        {showLabel && (
          <span
            className={`flex-1 text-left text-sm font-medium transition-colors ${
              hovered ? "text-white" : textColor
            }`}
          >
            {item.label}
          </span>
        )}

        {/* Tooltip for collapsed state */}
        {!showLabel && hovered && (
          <div
            className="absolute left-full ml-3 px-3 py-2 rounded-lg text-sm text-white whitespace-nowrap z-50 shadow-lg"
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
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${bgColor} backdrop-blur-xl border-r ${borderColor} z-40 transition-all duration-300 ease-out flex flex-col ${
        sidebarOpen ? "w-64" : "w-[72px]"
      }`}
    >
      {/* Header */}
      <div
        className={`h-16 flex items-center ${
          sidebarOpen ? "px-4 justify-between" : "justify-center"
        } border-b ${borderColor}`}
      >
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e07a5f] to-[#81b29a] flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-[#e07a5f] to-[#81b29a] bg-clip-text text-transparent">
              DocGen
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl hover:bg-white/10 transition-colors ${textMuted}`}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Command Palette Trigger */}
      <div className="p-3">
        <button
          onClick={toggleCommandPalette}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[--bg-elevated] border ${borderColor} hover:border-[--color-primary]/50 transition-all ${textMuted}`}
        >
          <Command className="w-4 h-4" />
          {sidebarOpen && (
            <>
              <span className="flex-1 text-left text-sm">Search...</span>
              <kbd className="kbd text-xs">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Primary Section */}
        <div className="space-y-1">
          {sidebarOpen && (
            <h3 className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
              Create
            </h3>
          )}
          {primaryItems.map((item) => (
            <NavItem key={item.id} item={item} showLabel={sidebarOpen} />
          ))}
        </div>

        {/* More Section */}
        <div className="pt-4 space-y-1">
          {sidebarOpen ? (
            <>
              <button
                onClick={() => setShowMore(!showMore)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${textMuted} hover:bg-white/5 transition-colors`}
              >
                <MoreHorizontal className="w-5 h-5" />
                <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">
                  {showMore ? "Less" : "More Features"}
                </span>
              </button>
              {showMore && (
                <div className="space-y-1 animate-slide-up">
                  {secondaryItems.map((item) => (
                    <NavItem key={item.id} item={item} showLabel={sidebarOpen} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => setShowMore(!showMore)}
              className={`w-full flex items-center justify-center p-2.5 rounded-xl ${textMuted} hover:bg-white/5 transition-colors relative group`}
            >
              <MoreHorizontal className="w-5 h-5" />
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-2 rounded-lg text-sm text-white whitespace-nowrap z-50 shadow-lg bg-[#3d405b] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                More Features
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#3d405b]" />
              </div>
            </button>
          )}
        </div>
      </nav>

      {/* Utility Section */}
      <div className={`p-3 border-t ${borderColor} space-y-1`}>
        {utilityItems.map((item) => (
          <NavItem key={item.id} item={item} showLabel={sidebarOpen} />
        ))}
      </div>
    </aside>
  );
}

