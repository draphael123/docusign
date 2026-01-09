"use client";

import { useState, useEffect, useMemo } from "react";

interface TemplateVariablesProps {
  bodyText: string;
  onApply: (filledText: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface Variable {
  name: string;
  placeholder: string;
  value: string;
  type: "text" | "date" | "number" | "email";
}

// Detect variable type from name
function detectVariableType(name: string): "text" | "date" | "number" | "email" {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("date") || lowerName.includes("day")) return "date";
  if (lowerName.includes("amount") || lowerName.includes("price") || lowerName.includes("number") || lowerName.includes("qty") || lowerName.includes("quantity")) return "number";
  if (lowerName.includes("email")) return "email";
  return "text";
}

export default function TemplateVariables({ bodyText, onApply, isOpen, onClose }: TemplateVariablesProps) {
  const [variables, setVariables] = useState<Variable[]>([]);

  // Extract variables from body text
  const extractedVariables = useMemo(() => {
    const regex = /\[([^\]]+)\]/g;
    const matches = bodyText.matchAll(regex);
    const vars: Variable[] = [];
    const seen = new Set<string>();
    
    for (const match of Array.from(matches)) {
      const placeholder = match[0];
      const name = match[1];
      if (!seen.has(name)) {
        seen.add(name);
        vars.push({
          name,
          placeholder,
          value: "",
          type: detectVariableType(name),
        });
      }
    }
    return vars;
  }, [bodyText]);

  useEffect(() => {
    if (isOpen) {
      setVariables(extractedVariables.map(v => ({ ...v, value: "" })));
    }
  }, [isOpen, extractedVariables]);

  const handleValueChange = (index: number, value: string) => {
    setVariables(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value };
      return updated;
    });
  };

  const handleApply = () => {
    let result = bodyText;
    variables.forEach(v => {
      if (v.value) {
        result = result.split(v.placeholder).join(v.value);
      }
    });
    onApply(result);
    onClose();
  };

  const filledCount = variables.filter(v => v.value.trim()).length;
  const progress = variables.length > 0 ? (filledCount / variables.length) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[--border-default]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[--text-primary]">Fill Template Variables</h2>
            <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">✕</button>
          </div>
          
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[--bg-elevated] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[--color-primary] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-[--text-muted]">{filledCount}/{variables.length}</span>
          </div>
        </div>

        {/* Variables List */}
        <div className="flex-1 overflow-y-auto p-5">
          {variables.length === 0 ? (
            <div className="text-center py-8 text-[--text-muted]">
              <p>No variables found in your document.</p>
              <p className="text-sm mt-2">Use [brackets] to create placeholders, e.g., [Name], [Date]</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variables.map((variable, index) => (
                <div key={variable.name}>
                  <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                    {variable.name}
                    <span className="ml-2 text-xs text-[--text-muted] font-normal">
                      {variable.placeholder}
                    </span>
                  </label>
                  <input
                    type={variable.type === "date" ? "date" : variable.type === "number" ? "number" : variable.type === "email" ? "email" : "text"}
                    value={variable.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    placeholder={`Enter ${variable.name.toLowerCase()}`}
                    className="w-full px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] placeholder:text-[--text-muted] focus:border-[--color-primary] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[--border-default] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:bg-[--bg-overlay]"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={filledCount === 0}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[--color-primary] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Variables
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to detect if template has variables
export function useTemplateVariables(bodyText: string) {
  const hasVariables = useMemo(() => {
    return /\[([^\]]+)\]/.test(bodyText);
  }, [bodyText]);

  const variableCount = useMemo(() => {
    const regex = /\[([^\]]+)\]/g;
    const matches = bodyText.matchAll(regex);
    const seen = new Set<string>();
    for (const match of Array.from(matches)) {
      seen.add(match[1]);
    }
    return seen.size;
  }, [bodyText]);

  return { hasVariables, variableCount };
}

