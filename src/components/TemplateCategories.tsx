"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  FileText,
  Briefcase,
  Scale,
  Heart,
  GraduationCap,
  Building2,
  Users,
  Star,
  Clock,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";
import { DocumentTemplate, documentTemplates } from "@/data/templates";

// Template categories
export const templateCategories = [
  { id: "all", name: "All Templates", icon: <Grid3X3 className="w-4 h-4" />, color: "#7a756d" },
  { id: "hr", name: "HR & Employment", icon: <Briefcase className="w-4 h-4" />, color: "#e07a5f" },
  { id: "legal", name: "Legal", icon: <Scale className="w-4 h-4" />, color: "#3d405b" },
  { id: "business", name: "Business", icon: <Building2 className="w-4 h-4" />, color: "#81b29a" },
  { id: "personal", name: "Personal", icon: <Heart className="w-4 h-4" />, color: "#f2cc8f" },
  { id: "academic", name: "Academic", icon: <GraduationCap className="w-4 h-4" />, color: "#6b7fd7" },
  { id: "reference", name: "References", icon: <Users className="w-4 h-4" />, color: "#e07a5f" },
];

// Map document types to categories
const categoryMapping: Record<string, string[]> = {
  hr: ["Letter of Employment", "Letter of Termination", "Letter of Resignation"],
  legal: ["Letter of Agreement", "Letter of Authorization", "Letter of Confirmation"],
  business: ["Letter of Introduction", "Letter of Inquiry", "Letter of Request", "Letter of Complaint"],
  personal: ["Letter of Apology", "Letter of Acceptance", "Letter of Rejection"],
  academic: ["Letter of Recommendation"],
  reference: ["Letter of Recommendation", "Letter of Reference"],
};

interface TemplateCategoriesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DocumentTemplate) => void;
  userTemplates?: DocumentTemplate[];
}

export default function TemplateCategories({
  isOpen,
  onClose,
  onSelectTemplate,
  userTemplates = [],
}: TemplateCategoriesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "recent" | "popular">("name");

  // Combine built-in and user templates
  const allTemplates = useMemo(() => {
    const combined = [...documentTemplates];
    userTemplates.forEach((ut) => {
      if (!combined.find((t) => t.id === ut.id)) {
        combined.push(ut);
      }
    });
    return combined;
  }, [userTemplates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    // Filter by category
    if (selectedCategory !== "all") {
      const categoryTypes = categoryMapping[selectedCategory] || [];
      filtered = filtered.filter((t) => categoryTypes.includes(t.documentType));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.documentType.toLowerCase().includes(query) ||
          t.bodyText.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [allTemplates, selectedCategory, searchQuery, sortBy]);

  // Get category for a template
  const getTemplateCategory = (template: DocumentTemplate) => {
    for (const [catId, types] of Object.entries(categoryMapping)) {
      if (types.includes(template.documentType)) {
        return templateCategories.find((c) => c.id === catId);
      }
    }
    return templateCategories[0];
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[85vh] bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Template Gallery</h2>
              <p className="text-sm text-[--text-muted]">
                {filteredTemplates.length} templates available
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[--bg-elevated] text-[--text-muted] hover:text-[--text-primary] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-muted]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-primary]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl bg-[--bg-elevated] border border-[--border-default] text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="recent">Recently Used</option>
              <option value="popular">Most Popular</option>
            </select>

            <div className="flex rounded-xl border border-[--border-default] overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 ${viewMode === "grid" ? "bg-[--color-primary] text-white" : "bg-[--bg-elevated] text-[--text-muted]"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 ${viewMode === "list" ? "bg-[--color-primary] text-white" : "bg-[--bg-elevated] text-[--text-muted]"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Categories */}
          <div className="w-56 border-r border-[--border-default] p-4 overflow-y-auto hidden md:block">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[--text-muted] mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {templateCategories.map((category) => {
                const count =
                  category.id === "all"
                    ? allTemplates.length
                    : allTemplates.filter((t) =>
                        (categoryMapping[category.id] || []).includes(t.documentType)
                      ).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? "bg-[--color-primary]/10 text-[--color-primary]"
                        : "text-[--text-secondary] hover:bg-[--bg-elevated]"
                    }`}
                  >
                    <span style={{ color: category.color }}>{category.icon}</span>
                    <span className="flex-1 text-left text-sm">{category.name}</span>
                    <span className="text-xs text-[--text-muted]">{count}</span>
                  </button>
                );
              })}
            </div>

            {userTemplates.length > 0 && (
              <>
                <div className="my-4 border-t border-[--border-default]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[--text-muted] mb-3">
                  My Templates
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("custom")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      selectedCategory === "custom"
                        ? "bg-[--color-primary]/10 text-[--color-primary]"
                        : "text-[--text-secondary] hover:bg-[--bg-elevated]"
                    }`}
                  >
                    <Star className="w-4 h-4 text-[--color-warning]" />
                    <span className="flex-1 text-left text-sm">Custom</span>
                    <span className="text-xs text-[--text-muted]">{userTemplates.length}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Template Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Search className="w-16 h-16 text-[--text-muted] opacity-30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-[--text-muted]">
                  Try a different search term or category
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const category = getTemplateCategory(template);
                  return (
                    <button
                      key={template.id}
                      onClick={() => {
                        onSelectTemplate(template);
                        onClose();
                      }}
                      className="p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-primary] transition-all text-left group hover:shadow-lg"
                    >
                      {/* Preview */}
                      <div className="aspect-[4/3] rounded-lg bg-white mb-3 overflow-hidden relative">
                        <div className="absolute inset-0 p-3 text-[6px] text-gray-400 leading-tight overflow-hidden">
                          <div className="font-bold text-gray-600 mb-1">{template.documentType}</div>
                          {template.bodyText.slice(0, 200)}...
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                      </div>

                      {/* Info */}
                      <div className="flex items-start gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                        >
                          {category?.icon || <FileText className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate group-hover:text-[--color-primary] transition-colors">
                            {template.name}
                          </h4>
                          <p className="text-xs text-[--text-muted] truncate">
                            {template.documentType}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTemplates.map((template) => {
                  const category = getTemplateCategory(template);
                  return (
                    <button
                      key={template.id}
                      onClick={() => {
                        onSelectTemplate(template);
                        onClose();
                      }}
                      className="w-full p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-primary] transition-all text-left flex items-center gap-4 group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                      >
                        {category?.icon || <FileText className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold group-hover:text-[--color-primary] transition-colors">
                          {template.name}
                        </h4>
                        <p className="text-sm text-[--text-muted] truncate">
                          {template.bodyText.slice(0, 100)}...
                        </p>
                      </div>
                      <span className="text-xs text-[--text-muted] px-2 py-1 rounded-lg bg-[--bg-overlay]">
                        {template.documentType.replace("Letter of ", "")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

