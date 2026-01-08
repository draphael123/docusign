"use client";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { category: "General", shortcuts: [
    { keys: ["Ctrl", "S"], action: "Save draft" },
    { keys: ["Ctrl", "P"], action: "Preview PDF" },
    { keys: ["Ctrl", "Z"], action: "Undo" },
    { keys: ["Ctrl", "F"], action: "Find & Replace" },
    { keys: ["Esc"], action: "Close modal" },
  ]},
  { category: "Navigation", shortcuts: [
    { keys: ["Tab"], action: "Next field" },
    { keys: ["Shift", "Tab"], action: "Previous field" },
    { keys: ["Ctrl", "↑"], action: "Previous placeholder" },
    { keys: ["Ctrl", "↓"], action: "Next placeholder" },
  ]},
  { category: "Editor", shortcuts: [
    { keys: ["Ctrl", "B"], action: "Bold text" },
    { keys: ["Ctrl", "I"], action: "Italic text" },
    { keys: ["Ctrl", "A"], action: "Select all" },
    { keys: ["Ctrl", "C"], action: "Copy" },
    { keys: ["Ctrl", "V"], action: "Paste" },
  ]},
  { category: "Quick Actions", shortcuts: [
    { keys: ["Ctrl", "1"], action: "Templates" },
    { keys: ["Ctrl", "2"], action: "History" },
    { keys: ["Ctrl", "3"], action: "Statistics" },
    { keys: ["Ctrl", ","], action: "Settings" },
    { keys: ["?"], action: "Show shortcuts" },
  ]},
];

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto border border-[#2a2a3a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#12121a] flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">⌨️ Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white transition-colors text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {SHORTCUTS.map((category) => (
            <div key={category.category}>
              <h3 className="text-sm font-medium text-[#a78bfa] mb-3">{category.category}</h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="px-2 py-1 rounded bg-[#2a2a3a] text-[#4ecdc4] text-xs font-mono">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && <span className="text-[#666680] mx-1">+</span>}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-[#a0a0a0]">{shortcut.action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a2a3a] text-center">
          <p className="text-xs text-[#666680]">Press <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a3a] text-[#a78bfa]">?</kbd> anytime to show this dialog</p>
        </div>
      </div>
    </div>
  );
}

