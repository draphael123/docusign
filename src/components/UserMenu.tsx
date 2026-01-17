"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  LogOut,
  Settings,
  FileText,
  ChevronDown,
  Crown,
  Folder,
} from "lucide-react";

interface UserMenuProps {
  onShowAuth: () => void;
  onShowMyTemplates: () => void;
  onShowSettings?: () => void;
}

export default function UserMenu({
  onShowAuth,
  onShowMyTemplates,
  onShowSettings,
}: UserMenuProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ redirect: false });
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="w-10 h-10 rounded-xl bg-[--bg-elevated] animate-pulse" />
    );
  }

  // Not logged in
  if (!session?.user) {
    return (
      <button
        onClick={onShowAuth}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition-all font-medium text-sm"
      >
        <User className="w-4 h-4" />
        Sign In
      </button>
    );
  }

  // Logged in
  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[--bg-elevated] hover:bg-[--bg-overlay] border border-[--border-default] transition-all"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[--color-primary] to-[--color-accent] flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        
        {/* Name (hidden on mobile) */}
        <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
          {session.user.name}
        </span>
        
        <ChevronDown
          className={`w-4 h-4 text-[--text-muted] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-xl z-50 overflow-hidden modal-enter">
          {/* User Info */}
          <div className="p-4 border-b border-[--border-default]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--color-primary] to-[--color-accent] flex items-center justify-center text-white font-bold text-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{session.user.name}</p>
                <p className="text-sm text-[--text-muted] truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onShowMyTemplates();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[--bg-elevated] transition-colors text-left"
            >
              <Folder className="w-5 h-5 text-[--color-primary]" />
              <span>My Templates</span>
            </button>
            
            {onShowSettings && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onShowSettings();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[--bg-elevated] transition-colors text-left"
              >
                <Settings className="w-5 h-5 text-[--text-muted]" />
                <span>Settings</span>
              </button>
            )}
            
            <div className="my-2 border-t border-[--border-default]" />
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

