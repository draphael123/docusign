"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  X,
  FileText,
  Search,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Globe,
  Lock,
  MoreVertical,
  Clock,
  Tag,
  FolderOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { UserTemplate } from "@/lib/userTemplates";

interface MyTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: UserTemplate) => void;
  onCreateNew: () => void;
}

export default function MyTemplates({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateNew,
}: MyTemplatesProps) {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<UserTemplate | null>(null);

  // Fetch user templates
  useEffect(() => {
    if (isOpen && session?.user) {
      fetchTemplates();
    }
  }, [isOpen, session]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/templates/user");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const res = await fetch(`/api/templates/user/${templateId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTemplates(templates.filter((t) => t.id !== templateId));
        toast.success("Template deleted");
      } else {
        toast.error("Failed to delete template");
      }
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      const res = await fetch(`/api/templates/user/${templateId}`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setTemplates([...templates, data.template]);
        toast.success("Template duplicated");
      } else {
        toast.error("Failed to duplicate template");
      }
    } catch (error) {
      toast.error("Failed to duplicate template");
    }
  };

  const handleTogglePublic = async (template: UserTemplate) => {
    try {
      const res = await fetch(`/api/templates/user/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !template.isPublic }),
      });

      if (res.ok) {
        setTemplates(
          templates.map((t) =>
            t.id === template.id ? { ...t, isPublic: !t.isPublic } : t
          )
        );
        toast.success(
          template.isPublic ? "Template is now private" : "Template is now public"
        );
      }
    } catch (error) {
      toast.error("Failed to update template");
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(templates.map((t) => t.category)))];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[85vh] bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[--color-primary]/10 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-[--color-primary]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">My Templates</h2>
                <p className="text-sm text-[--text-muted]">
                  {templates.length} template{templates.length !== 1 ? "s" : ""} saved
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onCreateNew}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Template
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[--bg-elevated] text-[--text-muted] hover:text-[--text-primary] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Search & Filter */}
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
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-[--bg-elevated] border border-[--border-default] text-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {templates.length === 0 ? (
                <>
                  <FileText className="w-16 h-16 text-[--text-muted] opacity-30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                  <p className="text-[--text-muted] mb-4">
                    Create your first template to get started
                  </p>
                  <button
                    onClick={onCreateNew}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Template
                  </button>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 text-[--text-muted] opacity-30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                  <p className="text-[--text-muted]">
                    Try a different search term
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group relative p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:border-[--color-primary] transition-all"
                >
                  {/* Template Card */}
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      onSelectTemplate(template);
                      onClose();
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[--color-primary]/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[--color-primary]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate group-hover:text-[--color-primary] transition-colors">
                          {template.name}
                        </h4>
                        <p className="text-sm text-[--text-muted] truncate">
                          {template.documentType}
                        </p>
                      </div>
                      {template.isPublic ? (
                        <span title="Public">
                          <Globe className="w-4 h-4 text-[--color-accent]" />
                        </span>
                      ) : (
                        <span title="Private">
                          <Lock className="w-4 h-4 text-[--text-muted]" />
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {template.description && (
                      <p className="text-sm text-[--text-muted] line-clamp-2 mb-3">
                        {template.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-[--text-muted]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {template.category}
                      </span>
                      {template.useCount > 0 && (
                        <span>Used {template.useCount}x</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === template.id ? null : template.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[--bg-overlay] text-[--text-muted] hover:text-[--text-primary] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenu === template.id && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-lg z-10 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(template.id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[--bg-elevated] transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePublic(template);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[--bg-elevated] transition-colors"
                        >
                          {template.isPublic ? (
                            <>
                              <Lock className="w-4 h-4" />
                              Make Private
                            </>
                          ) : (
                            <>
                              <Globe className="w-4 h-4" />
                              Make Public
                            </>
                          )}
                        </button>
                        <div className="border-t border-[--border-default]" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(template.id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

