"use client";

import { useState, useEffect } from "react";

interface Tag {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_COLORS = [
  "#a78bfa", "#4ecdc4", "#f472b6", "#f0b866", "#60a5fa", 
  "#4ade80", "#f87171", "#fb923c", "#c084fc", "#22d3ee"
];

interface DocumentTagsProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  compact?: boolean;
}

export function useDocumentTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("documentTags");
    if (saved) {
      try {
        setTags(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading tags:", e);
      }
    }
  }, []);

  const saveTags = (newTags: Tag[]) => {
    setTags(newTags);
    localStorage.setItem("documentTags", JSON.stringify(newTags));
  };

  const addTag = (name: string) => {
    const color = DEFAULT_COLORS[tags.length % DEFAULT_COLORS.length];
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name,
      color,
    };
    saveTags([...tags, newTag]);
    return newTag;
  };

  const deleteTag = (id: string) => {
    saveTags(tags.filter(t => t.id !== id));
  };

  const updateTagColor = (id: string, color: string) => {
    saveTags(tags.map(t => t.id === id ? { ...t, color } : t));
  };

  return { tags, addTag, deleteTag, updateTagColor, mounted };
}

export default function DocumentTags({ selectedTags, onTagsChange, compact = false }: DocumentTagsProps) {
  const { tags, addTag, deleteTag } = useDocumentTags();
  const [showAdd, setShowAdd] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const tag = addTag(newTagName.trim());
    onTagsChange([...selectedTags, tag.id]);
    setNewTagName("");
    setShowAdd(false);
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {tags.filter(t => selectedTags.includes(t.id)).map(tag => (
          <span
            key={tag.id}
            className="px-2 py-0.5 rounded-full text-xs text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-[#a0a0a0]">Tags</label>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
        >
          + Add Tag
        </button>
      </div>

      {/* Add new tag */}
      {showAdd && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Tag name..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm focus:border-[#a78bfa]"
            autoFocus
          />
          <button
            onClick={handleAddTag}
            className="px-3 py-1.5 rounded-lg bg-[#a78bfa] text-white text-sm hover:bg-[#9575f0]"
          >
            Add
          </button>
        </div>
      )}

      {/* Tag list */}
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              selectedTags.includes(tag.id)
                ? "text-white shadow-lg"
                : "text-white/70 opacity-50 hover:opacity-100"
            }`}
            style={{ 
              backgroundColor: selectedTags.includes(tag.id) ? tag.color : `${tag.color}40`,
              boxShadow: selectedTags.includes(tag.id) ? `0 4px 12px ${tag.color}40` : "none"
            }}
          >
            {tag.name}
          </button>
        ))}
        {tags.length === 0 && !showAdd && (
          <span className="text-sm text-[#666680]">No tags yet. Create one to organize documents.</span>
        )}
      </div>
    </div>
  );
}

// Tag Manager Modal
interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TagManager({ isOpen, onClose }: TagManagerProps) {
  const { tags, addTag, deleteTag, updateTagColor } = useDocumentTags();
  const [newTagName, setNewTagName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-md w-full border border-[#2a2a3a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">🏷️ Manage Tags</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Add new tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTagName.trim()) {
                  addTag(newTagName.trim());
                  setNewTagName("");
                }
              }}
              placeholder="New tag name..."
              className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white focus:border-[#a78bfa]"
            />
            <button
              onClick={() => {
                if (newTagName.trim()) {
                  addTag(newTagName.trim());
                  setNewTagName("");
                }
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white"
            >
              Add
            </button>
          </div>

          {/* Tag list */}
          <div className="space-y-2 max-h-60 overflow-auto">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={tag.color}
                    onChange={(e) => updateTagColor(tag.id, e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <span className="text-white">{tag.name}</span>
                </div>
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="text-[#f87171] hover:text-[#fca5a5] transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-center text-[#666680] py-4">No tags created yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

