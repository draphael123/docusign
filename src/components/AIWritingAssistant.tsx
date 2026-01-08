"use client";

import { useState } from "react";

interface AIWritingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  selectedText?: string;
}

const QUICK_PROMPTS = [
  { icon: "✍️", label: "Improve writing", action: "improve" },
  { icon: "📝", label: "Make formal", action: "formal" },
  { icon: "💬", label: "Make casual", action: "casual" },
  { icon: "📏", label: "Make shorter", action: "shorten" },
  { icon: "📖", label: "Make longer", action: "expand" },
  { icon: "🔧", label: "Fix grammar", action: "grammar" },
];

const TEMPLATES = [
  { category: "Opening", suggestions: [
    "I am writing to formally request...",
    "This letter serves as official notification...",
    "I hope this letter finds you well...",
    "Further to our recent conversation...",
  ]},
  { category: "Closing", suggestions: [
    "Thank you for your attention to this matter.",
    "Please do not hesitate to contact me.",
    "I look forward to your response.",
    "Your prompt attention would be appreciated.",
  ]},
  { category: "Transitions", suggestions: [
    "Furthermore, I would like to add...",
    "In addition to the above...",
    "With regards to your inquiry...",
    "As previously discussed...",
  ]},
];

export default function AIWritingAssistant({ isOpen, onClose, onInsert, selectedText }: AIWritingAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [activeTab, setActiveTab] = useState<"assist" | "templates" | "phrases">("assist");

  // Simulate AI processing (placeholder - would connect to actual AI service)
  const handleProcess = async (action: string) => {
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let result = "";
    const text = selectedText || prompt;
    
    switch (action) {
      case "improve":
        result = `[Improved version would appear here]\n\nOriginal: "${text}"`;
        break;
      case "formal":
        result = `[More formal version would appear here]\n\nOriginal: "${text}"`;
        break;
      case "casual":
        result = `[More casual version would appear here]\n\nOriginal: "${text}"`;
        break;
      case "shorten":
        result = `[Shortened version would appear here]\n\nOriginal: "${text}"`;
        break;
      case "expand":
        result = `[Expanded version would appear here]\n\nOriginal: "${text}"`;
        break;
      case "grammar":
        result = `[Grammar-corrected version would appear here]\n\nOriginal: "${text}"`;
        break;
      default:
        result = `[AI response would appear here based on prompt: "${prompt}"]`;
    }
    
    setSuggestion(result);
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">🤖 AI Writing Assistant</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a3a]">
          {[
            { id: "assist", label: "✨ AI Assist" },
            { id: "templates", label: "📋 Templates" },
            { id: "phrases", label: "💬 Phrases" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm transition-colors ${
                activeTab === tab.id
                  ? "text-[#a78bfa] border-b-2 border-[#a78bfa]"
                  : "text-[#666680] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "assist" && (
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#a78bfa]/10 to-[#f472b6]/10 border border-[#a78bfa]/30">
                <p className="text-sm text-[#a0a0a0]">
                  🚀 <strong className="text-white">Coming Soon:</strong> Connect your own AI API key to enable full AI-powered writing assistance.
                </p>
              </div>

              {/* Selected text display */}
              {selectedText && (
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Selected Text</label>
                  <div className="p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm max-h-24 overflow-auto">
                    {selectedText}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <label className="block text-sm text-[#a0a0a0] mb-2">Quick Actions</label>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_PROMPTS.map(prompt => (
                    <button
                      key={prompt.action}
                      onClick={() => handleProcess(prompt.action)}
                      disabled={isProcessing || (!selectedText && !prompt)}
                      className="p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] hover:border-[#a78bfa] transition-colors disabled:opacity-50"
                    >
                      <span className="text-xl block mb-1">{prompt.icon}</span>
                      <span className="text-xs text-[#a0a0a0]">{prompt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm text-[#a0a0a0] mb-2">Custom Prompt</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Write a paragraph about..."
                    className="flex-1 px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white focus:border-[#a78bfa]"
                  />
                  <button
                    onClick={() => handleProcess("custom")}
                    disabled={isProcessing || !prompt}
                    className="px-4 py-2 rounded-lg bg-[#a78bfa] text-white hover:bg-[#9575f0] disabled:opacity-50"
                  >
                    {isProcessing ? "..." : "Generate"}
                  </button>
                </div>
              </div>

              {/* Suggestion Output */}
              {suggestion && (
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Suggestion</label>
                  <div className="p-4 rounded-lg bg-[#1a1a24] border border-[#4ecdc4]/30 text-white">
                    <pre className="whitespace-pre-wrap text-sm">{suggestion}</pre>
                    <button
                      onClick={() => {
                        onInsert(suggestion);
                        onClose();
                      }}
                      className="mt-3 px-4 py-2 rounded-lg bg-[#4ecdc4] text-[#0a0a12] hover:bg-[#3dbdb5] text-sm"
                    >
                      Insert into Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-6">
              {TEMPLATES.map(category => (
                <div key={category.category}>
                  <h3 className="text-sm font-medium text-[#a78bfa] mb-3">{category.category}</h3>
                  <div className="space-y-2">
                    {category.suggestions.map((text, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          onInsert(text);
                          onClose();
                        }}
                        className="w-full p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] hover:border-[#a78bfa] text-left transition-colors"
                      >
                        <span className="text-white text-sm">{text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "phrases" && (
            <div className="space-y-4">
              <p className="text-sm text-[#666680]">Click any phrase to insert it into your document.</p>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  "As per our discussion",
                  "Please find attached",
                  "For your reference",
                  "At your earliest convenience",
                  "As mentioned previously",
                  "Thank you for your time",
                  "Please be advised that",
                  "We appreciate your patience",
                  "Should you require",
                  "We regret to inform",
                  "It is our pleasure",
                  "We are pleased to confirm",
                ].map((phrase, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onInsert(phrase);
                      onClose();
                    }}
                    className="p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] hover:border-[#4ecdc4] text-white text-sm text-left transition-colors"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

