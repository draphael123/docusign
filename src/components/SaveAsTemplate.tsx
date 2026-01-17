"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  X,
  FileText,
  Save,
  Tag,
  Sparkles,
  Globe,
  Lock,
  Loader2,
  Cloud,
  HardDrive,
  User,
} from "lucide-react";
import { DocumentTemplate } from "@/data/templates";
import { toast } from "react-hot-toast";

interface SaveAsTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocumentType: string;
  currentBodyText: string;
  onSave: (template: DocumentTemplate) => void;
  onShowAuth?: () => void;
}

export default function SaveAsTemplate({
  isOpen,
  onClose,
  currentDocumentType,
  currentBodyText,
  onSave,
  onShowAuth,
}: SaveAsTemplateProps) {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Custom");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToCloud, setSaveToCloud] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setName(`My ${currentDocumentType}`);
      setDescription("");
      setSaveToCloud(!!session?.user);
    }
  }, [isOpen, currentDocumentType, session]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    if (!currentBodyText.trim()) {
      toast.error("Document body is empty");
      return;
    }

    setIsSaving(true);

    try {
      // If user is logged in and wants to save to cloud
      if (session?.user && saveToCloud) {
        const res = await fetch("/api/templates/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description || `Custom template: ${name.trim()}`,
            documentType: currentDocumentType,
            bodyText: currentBodyText,
            category,
            isPublic,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to save template");
        }

        const data = await res.json();
        toast.success("Template saved to your account!");
        
        // Also create a local DocumentTemplate for immediate use
        const template: DocumentTemplate = {
          id: data.template.id,
          name: name.trim(),
          documentType: currentDocumentType,
          bodyText: currentBodyText,
          description: description || `Custom template: ${name.trim()}`,
          category,
        };
        onSave(template);
      } else {
        // Save locally
        const template: DocumentTemplate = {
          id: `local-${Date.now()}`,
          name: name.trim(),
          documentType: currentDocumentType,
          bodyText: currentBodyText,
          description: description || `Custom template: ${name.trim()}`,
          category,
        };

        const existingTemplates = JSON.parse(
          localStorage.getItem("localTemplates") || "[]"
        );
        existingTemplates.push({
          ...template,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("localTemplates", JSON.stringify(existingTemplates));

        onSave(template);
        toast.success("Template saved locally!");
      }

      onClose();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const isLoggedIn = status === "authenticated" && session?.user;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[--color-primary]/10 flex items-center justify-center">
                <Save className="w-5 h-5 text-[--color-primary]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Save as Template</h2>
                <p className="text-sm text-[--text-muted]">Reuse this document later</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[--bg-elevated] text-[--text-muted] hover:text-[--text-primary] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Login prompt for non-authenticated users */}
          {!isLoggedIn && (
            <div className="p-4 rounded-xl bg-[--color-primary]/5 border border-[--color-primary]/20">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-[--color-primary] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Sign in for cloud sync</p>
                  <p className="text-xs text-[--text-muted] mt-1">
                    Save templates to your account and access them anywhere.
                  </p>
                  {onShowAuth && (
                    <button
                      onClick={() => {
                        onClose();
                        onShowAuth();
                      }}
                      className="mt-2 text-sm text-[--color-primary] hover:underline font-medium"
                    >
                      Sign in or create account →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Storage Location (only show if logged in) */}
          {isLoggedIn && (
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                Save to
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSaveToCloud(true)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                    saveToCloud
                      ? "bg-[--color-primary]/10 border-[--color-primary] text-[--color-primary]"
                      : "bg-[--bg-elevated] border-[--border-default] text-[--text-secondary]"
                  }`}
                >
                  <Cloud className="w-5 h-5" />
                  <span className="text-sm font-medium">My Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSaveToCloud(false)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                    !saveToCloud
                      ? "bg-[--color-primary]/10 border-[--color-primary] text-[--color-primary]"
                      : "bg-[--bg-elevated] border-[--border-default] text-[--text-secondary]"
                  }`}
                >
                  <HardDrive className="w-5 h-5" />
                  <span className="text-sm font-medium">Local Only</span>
                </button>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[--text-secondary] mb-2">
              Template Name *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-muted]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter template name"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[--text-secondary] mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when to use this template"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary] resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[--text-secondary] mb-2">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-muted]" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] appearance-none cursor-pointer"
              >
                <option value="Custom">Custom</option>
                <option value="HR">HR & Employment</option>
                <option value="Legal">Legal</option>
                <option value="Business">Business</option>
                <option value="Personal">Personal</option>
                <option value="Academic">Academic</option>
              </select>
            </div>
          </div>

          {/* Public/Private Toggle (only for cloud saves) */}
          {isLoggedIn && saveToCloud && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-[--color-accent]" />
                ) : (
                  <Lock className="w-5 h-5 text-[--text-muted]" />
                )}
                <div>
                  <span className="font-medium">
                    {isPublic ? "Public Template" : "Private Template"}
                  </span>
                  <p className="text-xs text-[--text-muted]">
                    {isPublic
                      ? "Others can discover and use this"
                      : "Only you can see this template"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  isPublic ? "bg-[--color-accent]" : "bg-[--bg-overlay]"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isPublic ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[--color-primary]" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            <div className="text-xs text-[--text-muted] line-clamp-3">
              {currentBodyText.slice(0, 200)}
              {currentBodyText.length > 200 ? "..." : ""}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[--border-default] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:bg-[--bg-overlay] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isLoggedIn && saveToCloud ? (
                  <Cloud className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to manage user templates (both local and cloud)
export function useUserTemplates() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, [session]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // Load local templates
      const localTemplates = JSON.parse(
        localStorage.getItem("localTemplates") || "[]"
      );

      // If logged in, also fetch cloud templates
      if (session?.user) {
        const res = await fetch("/api/templates/user");
        if (res.ok) {
          const data = await res.json();
          const cloudTemplates = (data.templates || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            documentType: t.documentType,
            bodyText: t.bodyText,
            description: t.description,
            category: t.category,
            isCloud: true,
          }));
          setTemplates([...cloudTemplates, ...localTemplates]);
        } else {
          setTemplates(localTemplates);
        }
      } else {
        setTemplates(localTemplates);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      // Fall back to local templates
      const localTemplates = JSON.parse(
        localStorage.getItem("localTemplates") || "[]"
      );
      setTemplates(localTemplates);
    } finally {
      setIsLoading(false);
    }
  };

  const addTemplate = (template: DocumentTemplate) => {
    setTemplates((prev) => [...prev, template]);
  };

  const removeTemplate = async (id: string) => {
    const template = templates.find((t) => t.id === id);
    
    if (template && (template as any).isCloud && session?.user) {
      // Delete from cloud
      try {
        await fetch(`/api/templates/user/${id}`, { method: "DELETE" });
      } catch (error) {
        console.error("Error deleting cloud template:", error);
      }
    } else {
      // Delete from local storage
      const localTemplates = JSON.parse(
        localStorage.getItem("localTemplates") || "[]"
      ).filter((t: any) => t.id !== id);
      localStorage.setItem("localTemplates", JSON.stringify(localTemplates));
    }
    
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const refreshTemplates = () => {
    loadTemplates();
  };

  return { templates, addTemplate, removeTemplate, refreshTemplates, isLoading };
}
