"use client";

import { useState, useEffect } from "react";

interface AutoSaveIndicatorProps {
  lastSaved: Date | null;
  isSaving: boolean;
  hasChanges: boolean;
}

export default function AutoSaveIndicator({ lastSaved, isSaving, hasChanges }: AutoSaveIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      if (!lastSaved) {
        setRelativeTime("");
        return;
      }

      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);

      if (seconds < 10) {
        setRelativeTime("just now");
      } else if (seconds < 60) {
        setRelativeTime(`${seconds}s ago`);
      } else if (minutes < 60) {
        setRelativeTime(`${minutes}m ago`);
      } else {
        setRelativeTime(lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-[#f0b866]">
        <div className="w-4 h-4 border-2 border-[#f0b866] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Saving...</span>
      </div>
    );
  }

  if (hasChanges) {
    return (
      <div className="flex items-center gap-2 text-[#666680]">
        <div className="w-2 h-2 rounded-full bg-[#f0b866]" />
        <span className="text-sm">Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-[#4ade80]">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm">Saved {relativeTime}</span>
      </div>
    );
  }

  return null;
}

