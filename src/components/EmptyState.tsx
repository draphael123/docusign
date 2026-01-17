"use client";

import { ReactNode } from "react";
import { FileText, Star, History, Search, FolderOpen, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "compact";
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        isCompact ? "py-8 px-4" : "py-16 px-6"
      }`}
    >
      {icon && (
        <div
          className={`mb-4 text-[--text-muted] opacity-30 ${
            isCompact ? "w-10 h-10" : "w-16 h-16"
          }`}
        >
          {icon}
        </div>
      )}
      <h3
        className={`font-semibold text-[--text-primary] mb-2 ${
          isCompact ? "text-base" : "text-lg"
        }`}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`text-[--text-muted] max-w-xs ${
            isCompact ? "text-xs" : "text-sm"
          }`}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[--color-primary] rounded-lg hover:bg-[--color-primary-hover] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Preset empty states
export function NoDocumentsEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="w-full h-full" />}
      title="No documents yet"
      description="Create your first document to get started"
      action={onAction ? { label: "Create Document", onClick: onAction } : undefined}
    />
  );
}

export function NoFavoritesEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Star className="w-full h-full" />}
      title="No favorites saved"
      description="Save your frequently used settings as favorites for quick access"
      action={onAction ? { label: "Save Current as Favorite", onClick: onAction } : undefined}
    />
  );
}

export function NoHistoryEmpty() {
  return (
    <EmptyState
      icon={<History className="w-full h-full" />}
      title="No history yet"
      description="Your generated documents will appear here"
    />
  );
}

export function NoSearchResultsEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="w-full h-full" />}
      title="No results found"
      description={`No matches for "${query}". Try a different search term.`}
    />
  );
}

export function NoTemplatesEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="w-full h-full" />}
      title="No templates available"
      description="Browse the template gallery to find templates"
      action={onAction ? { label: "Browse Templates", onClick: onAction } : undefined}
    />
  );
}

export function EmptyInboxState() {
  return (
    <EmptyState
      icon={<Inbox className="w-full h-full" />}
      title="All caught up!"
      description="No pending items to review"
      variant="compact"
    />
  );
}

