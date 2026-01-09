"use client";

import { useState, useRef, useEffect } from "react";

export interface SignatureField {
  id: string;
  type: "signature" | "initials" | "date" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  required: boolean;
  assignee: string;
}

interface SignaturePlacementProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fields: SignatureField[]) => void;
  existingFields?: SignatureField[];
}

const FIELD_TYPES = [
  { type: "signature", label: "Signature", icon: "✍️", defaultSize: { w: 200, h: 50 } },
  { type: "initials", label: "Initials", icon: "🔤", defaultSize: { w: 80, h: 40 } },
  { type: "date", label: "Date", icon: "📅", defaultSize: { w: 120, h: 30 } },
  { type: "text", label: "Text Field", icon: "📝", defaultSize: { w: 150, h: 30 } },
] as const;

export default function SignaturePlacement({ isOpen, onClose, onSave, existingFields = [] }: SignaturePlacementProps) {
  const [fields, setFields] = useState<SignatureField[]>(existingFields);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFields(existingFields);
    }
  }, [isOpen, existingFields]);

  const addField = (type: SignatureField["type"]) => {
    const fieldType = FIELD_TYPES.find(f => f.type === type)!;
    const newField: SignatureField = {
      id: `field-${Date.now()}`,
      type,
      x: 50,
      y: 50 + fields.length * 60,
      width: fieldType.defaultSize.w,
      height: fieldType.defaultSize.h,
      label: fieldType.label,
      required: true,
      assignee: "Signer 1",
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<SignatureField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  };

  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    
    setDragging(fieldId);
    setSelectedField(fieldId);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - field.x,
        y: e.clientY - rect.top - field.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 100, e.clientX - rect.left - dragOffset.x));
    const y = Math.max(0, Math.min(rect.height - 30, e.clientY - rect.top - dragOffset.y));
    
    updateField(dragging, { x, y });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleSave = () => {
    onSave(fields);
    onClose();
  };

  const selectedFieldData = fields.find(f => f.id === selectedField);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[--border-default] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[--text-primary]">Signature Field Placement</h2>
          <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">✕</button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Toolbar */}
          <div className="w-48 border-r border-[--border-default] p-4 space-y-3">
            <h3 className="text-sm font-medium text-[--text-secondary] mb-3">Add Fields</h3>
            {FIELD_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => addField(type)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:border-[--color-primary] text-sm"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}

            {/* Selected Field Properties */}
            {selectedFieldData && (
              <div className="pt-4 mt-4 border-t border-[--border-default]">
                <h3 className="text-sm font-medium text-[--text-secondary] mb-3">Properties</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[--text-muted] mb-1">Label</label>
                    <input
                      type="text"
                      value={selectedFieldData.label}
                      onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                      className="w-full px-2 py-1.5 rounded bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[--text-muted] mb-1">Assignee</label>
                    <select
                      value={selectedFieldData.assignee}
                      onChange={(e) => updateField(selectedFieldData.id, { assignee: e.target.value })}
                      className="w-full px-2 py-1.5 rounded bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
                    >
                      <option>Signer 1</option>
                      <option>Signer 2</option>
                      <option>Signer 3</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFieldData.required}
                      onChange={(e) => updateField(selectedFieldData.id, { required: e.target.checked })}
                    />
                    <span className="text-sm text-[--text-secondary]">Required</span>
                  </label>
                  <button
                    onClick={() => deleteField(selectedFieldData.id)}
                    className="w-full px-3 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20"
                  >
                    Delete Field
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-[--bg-elevated] p-4 overflow-auto">
            <div
              ref={canvasRef}
              className="relative bg-white rounded-lg shadow-lg mx-auto"
              style={{ width: 612, height: 792, minHeight: 792 }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Page content preview */}
              <div className="absolute inset-0 p-12 text-gray-300 text-sm pointer-events-none">
                <div className="border-2 border-dashed border-gray-200 h-full flex items-center justify-center">
                  Document Preview Area
                </div>
              </div>

              {/* Signature fields */}
              {fields.map((field) => {
                const isSelected = field.id === selectedField;
                const fieldType = FIELD_TYPES.find(f => f.type === field.type)!;
                return (
                  <div
                    key={field.id}
                    className={`absolute cursor-move flex items-center justify-center text-xs font-medium transition-shadow ${
                      isSelected ? "ring-2 ring-[--color-primary] shadow-lg" : "hover:ring-1 hover:ring-[--color-primary]"
                    }`}
                    style={{
                      left: field.x,
                      top: field.y,
                      width: field.width,
                      height: field.height,
                      backgroundColor: field.type === "signature" ? "#fef3c7" : 
                                       field.type === "initials" ? "#dbeafe" :
                                       field.type === "date" ? "#dcfce7" : "#f3e8ff",
                      border: `2px dashed ${
                        field.type === "signature" ? "#f59e0b" : 
                        field.type === "initials" ? "#3b82f6" :
                        field.type === "date" ? "#22c55e" : "#a855f7"
                      }`,
                      borderRadius: 4,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, field.id)}
                  >
                    <span className="pointer-events-none">
                      {fieldType.icon} {field.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[--border-default] flex items-center justify-between">
          <span className="text-sm text-[--text-muted]">
            {fields.length} field{fields.length !== 1 ? "s" : ""} added
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:bg-[--bg-overlay]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[--color-primary] text-white hover:opacity-90"
            >
              Save Placements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

