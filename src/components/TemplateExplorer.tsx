"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  FileText,
  Briefcase,
  Scale,
  Heart,
  GraduationCap,
  Building2,
  Star,
  Clock,
  Filter,
  Grid,
  List,
  Eye,
  Plus,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { DocumentTemplate, documentTemplates } from "@/data/templates";

interface TemplateCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const CATEGORIES: TemplateCategory[] = [
  { id: "all", name: "All Templates", icon: <Grid className="w-4 h-4" />, color: "#7a756d", description: "Browse all templates" },
  { id: "hr", name: "HR & Employment", icon: <Briefcase className="w-4 h-4" />, color: "#e07a5f", description: "Hiring, termination, references" },
  { id: "legal", name: "Legal", icon: <Scale className="w-4 h-4" />, color: "#81b29a", description: "Agreements, authorizations" },
  { id: "business", name: "Business", icon: <Building2 className="w-4 h-4" />, color: "#f2cc8f", description: "Proposals, confirmations" },
  { id: "personal", name: "Personal", icon: <Heart className="w-4 h-4" />, color: "#e07a5f", description: "Apologies, complaints" },
  { id: "academic", name: "Academic", icon: <GraduationCap className="w-4 h-4" />, color: "#3d405b", description: "Recommendations, acceptances" },
];

// Map document types to categories
const CATEGORY_MAPPING: Record<string, string> = {
  "Letter of Recommendation": "academic",
  "Letter of Termination": "hr",
  "Letter of Employment": "hr",
  "Letter of Reference": "hr",
  "Letter of Introduction": "business",
  "Letter of Resignation": "hr",
  "Letter of Acceptance": "academic",
  "Letter of Rejection": "hr",
  "Letter of Apology": "personal",
  "Letter of Complaint": "personal",
  "Letter of Inquiry": "business",
  "Letter of Request": "business",
  "Letter of Confirmation": "business",
  "Letter of Agreement": "legal",
  "Letter of Authorization": "legal",
  "Custom Document": "all",
};

interface TemplateExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DocumentTemplate) => void;
  onSaveAsTemplate?: () => void;
}

export default function TemplateExplorer({
  isOpen,
  onClose,
  onSelectTemplate,
  onSaveAsTemplate,
}: TemplateExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);

  // Load favorites and recently used from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem("templateFavorites");
      const savedRecent = localStorage.getItem("recentTemplates");
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedRecent) setRecentlyUsed(JSON.parse(savedRecent));
    }
  }, []);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return documentTemplates.filter((template) => {
      const matchesSearch = searchQuery
        ? template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.bodyText.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const templateCategory = CATEGORY_MAPPING[template.documentType] || "all";
      const matchesCategory = selectedCategory === "all" || templateCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Recently used templates
  const recentTemplates = useMemo(() => {
    return recentlyUsed
      .map((id) => documentTemplates.find((t) => t.id === id))
      .filter(Boolean) as DocumentTemplate[];
  }, [recentlyUsed]);

  // Favorite templates
  const favoriteTemplates = useMemo(() => {
    return favorites
      .map((id) => documentTemplates.find((t) => t.id === id))
      .filter(Boolean) as DocumentTemplate[];
  }, [favorites]);

  const toggleFavorite = (templateId: string) => {
    const updated = favorites.includes(templateId)
      ? favorites.filter((id) => id !== templateId)
      : [...favorites, templateId];
    setFavorites(updated);
    localStorage.setItem("templateFavorites", JSON.stringify(updated));
  };

  const handleSelectTemplate = (template: DocumentTemplate) => {
    // Update recently used
    const updated = [template.id, ...recentlyUsed.filter((id) => id !== template.id)].slice(0, 5);
    setRecentlyUsed(updated);
    localStorage.setItem("recentTemplates", JSON.stringify(updated));
    
    onSelectTemplate(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Template Explorer</h2>
              <p className="text-sm text-[--text-muted]">
                {filteredTemplates.length} templates available
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onSaveAsTemplate && (
                <button
                  onClick={onSaveAsTemplate}
                  className="px-4 py-2 rounded-xl bg-[--color-primary] text-white font-medium hover:bg-[--color-primary-hover] transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Save Current as Template
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[--bg-elevated] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-muted]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary]"
              />
            </div>
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-[--color-primary] text-white" : "hover:bg-[--bg-overlay]"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-[--color-primary] text-white" : "hover:bg-[--bg-overlay]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-56 border-r border-[--border-default] p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[--text-muted] mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    selectedCategory === category.id
                      ? "bg-[--color-primary]/15 text-[--color-primary]"
                      : "hover:bg-[--bg-elevated] text-[--text-secondary]"
                  }`}
                >
                  <span style={{ color: category.color }}>{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>

            {/* Favorites Section */}
            {favoriteTemplates.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[--text-muted] mb-3 flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  Favorites
                </h3>
                <div className="space-y-1">
                  {favoriteTemplates.slice(0, 3).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[--bg-elevated] text-sm text-[--text-secondary] truncate"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recently Used */}
            {recentTemplates.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[--text-muted] mb-3 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Recent
                </h3>
                <div className="space-y-1">
                  {recentTemplates.slice(0, 3).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[--bg-elevated] text-sm text-[--text-secondary] truncate"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Templates Grid/List */}
          <div className="flex-1 p-6 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FileText className="w-16 h-16 text-[--text-muted] opacity-30 mb-4" />
                <h3 className="font-semibold mb-2">No templates found</h3>
                <p className="text-sm text-[--text-muted]">
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isFavorite={favorites.includes(template.id)}
                    onSelect={() => handleSelectTemplate(template)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                    onPreview={() => setPreviewTemplate(template)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTemplates.map((template) => (
                  <TemplateListItem
                    key={template.id}
                    template={template}
                    isFavorite={favorites.includes(template.id)}
                    onSelect={() => handleSelectTemplate(template)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                    onPreview={() => setPreviewTemplate(template)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <TemplatePreviewModal
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onSelect={() => {
              handleSelectTemplate(previewTemplate);
              setPreviewTemplate(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: DocumentTemplate;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onPreview: () => void;
}

function TemplateCard({ template, isFavorite, onSelect, onToggleFavorite, onPreview }: TemplateCardProps) {
  const category = CATEGORY_MAPPING[template.documentType] || "all";
  const categoryInfo = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="group relative p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-primary]/50 hover:shadow-lg transition-all cursor-pointer">
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-[--bg-surface] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[--bg-overlay]"
      >
        {isFavorite ? (
          <BookmarkCheck className="w-4 h-4 text-[--color-primary]" />
        ) : (
          <Bookmark className="w-4 h-4 text-[--text-muted]" />
        )}
      </button>

      <div onClick={onSelect}>
        {/* Category badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium mb-3"
          style={{ backgroundColor: `${categoryInfo?.color}20`, color: categoryInfo?.color }}
        >
          {categoryInfo?.icon}
          {categoryInfo?.name}
        </div>

        {/* Template name */}
        <h3 className="font-semibold mb-2 group-hover:text-[--color-primary] transition-colors">
          {template.name}
        </h3>

        {/* Preview text */}
        <p className="text-sm text-[--text-muted] line-clamp-3 mb-4">
          {template.bodyText.substring(0, 120)}...
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onPreview}
          className="flex-1 py-2 rounded-lg bg-[--bg-surface] border border-[--border-default] text-sm font-medium hover:bg-[--bg-overlay] transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
        <button
          onClick={onSelect}
          className="flex-1 py-2 rounded-lg bg-[--color-primary] text-white text-sm font-medium hover:bg-[--color-primary-hover] transition-colors"
        >
          Use Template
        </button>
      </div>
    </div>
  );
}

// Template List Item Component
function TemplateListItem({ template, isFavorite, onSelect, onToggleFavorite, onPreview }: TemplateCardProps) {
  const category = CATEGORY_MAPPING[template.documentType] || "all";
  const categoryInfo = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-primary]/50 transition-all">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${categoryInfo?.color}20`, color: categoryInfo?.color }}
      >
        <FileText className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={onSelect}>
        <h3 className="font-semibold truncate group-hover:text-[--color-primary] transition-colors">
          {template.name}
        </h3>
        <p className="text-sm text-[--text-muted] truncate">{template.documentType}</p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onToggleFavorite}
          className="p-2 rounded-lg hover:bg-[--bg-overlay] transition-colors"
        >
          {isFavorite ? (
            <BookmarkCheck className="w-4 h-4 text-[--color-primary]" />
          ) : (
            <Bookmark className="w-4 h-4 text-[--text-muted]" />
          )}
        </button>
        <button
          onClick={onPreview}
          className="p-2 rounded-lg hover:bg-[--bg-overlay] transition-colors"
        >
          <Eye className="w-4 h-4 text-[--text-muted]" />
        </button>
        <button
          onClick={onSelect}
          className="px-4 py-2 rounded-lg bg-[--color-primary] text-white text-sm font-medium hover:bg-[--color-primary-hover] transition-colors"
        >
          Use
        </button>
      </div>
    </div>
  );
}

// Template Preview Modal
interface TemplatePreviewModalProps {
  template: DocumentTemplate;
  onClose: () => void;
  onSelect: () => void;
}

function TemplatePreviewModal({ template, onClose, onSelect }: TemplatePreviewModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{template.name}</h3>
              <p className="text-sm text-[--text-muted]">{template.documentType}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[--bg-elevated]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <div className="p-6 rounded-xl bg-[--bg-elevated] border border-[--border-default] font-mono text-sm whitespace-pre-wrap">
            {template.bodyText}
          </div>
        </div>

        <div className="p-6 border-t border-[--border-default] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] font-medium hover:bg-[--bg-overlay] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSelect}
            className="flex-1 py-3 rounded-xl bg-[--color-primary] text-white font-semibold hover:bg-[--color-primary-hover] transition-colors"
          >
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
}

