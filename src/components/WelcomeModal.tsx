"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Sparkles,
  Zap,
  Star,
  ArrowRight,
  Check,
  Command,
  Download,
  Clock,
  Palette,
} from "lucide-react";

interface WelcomeModalProps {
  onComplete: () => void;
}

const features = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Professional Templates",
    description: "Choose from 16+ document types with pre-written content",
    color: "#e07a5f",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI Writing Assistant",
    description: "Get help writing with our built-in AI assistant",
    color: "#81b29a",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant PDF Generation",
    description: "Download professional PDFs with one click",
    color: "#f2cc8f",
  },
  {
    icon: <Command className="w-6 h-6" />,
    title: "Power User Shortcuts",
    description: "Press ⌘K anytime for quick commands",
    color: "#3d405b",
  },
];

const tips = [
  { icon: <Download className="w-4 h-4" />, text: "Use Ctrl+S to save your draft" },
  { icon: <Command className="w-4 h-4" />, text: "Press ⌘K for command palette" },
  { icon: <Star className="w-4 h-4" />, text: "Save favorites for quick access" },
  { icon: <Clock className="w-4 h-4" />, text: "Auto-save keeps your work safe" },
  { icon: <Palette className="w-4 h-4" />, text: "Customize PDF themes & branding" },
];

export default function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[--bg-surface] rounded-3xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter">
        {/* Progress indicator */}
        <div className="flex gap-1 p-4 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-[--color-primary]" : "w-2 bg-[--border-default]"
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="px-8 pb-8 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[--color-primary] to-[--color-accent] flex items-center justify-center shadow-lg animate-float">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">
              Welcome to <span className="text-gradient">DocGen</span>
            </h1>
            <p className="text-[--text-secondary] mb-8 max-w-md mx-auto">
              Create professional documents in minutes. Let&apos;s take a quick tour of the key features.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleSkip}
                className="px-6 py-3 rounded-xl text-[--text-muted] hover:text-[--text-primary] transition-colors"
              >
                Skip tour
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-8 py-3 rounded-xl bg-[--color-primary] text-white font-semibold hover:bg-[--color-primary-hover] transition-all flex items-center gap-2 shadow-lg shadow-[--color-primary]/20"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Features */}
        {step === 1 && (
          <div className="px-8 pb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-2">Key Features</h2>
            <p className="text-[--text-muted] text-center mb-6">
              Everything you need for professional documents
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:border-[--border-hover] transition-all group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-[--text-muted]">{feature.description}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep(0)}
                className="px-6 py-3 rounded-xl text-[--text-muted] hover:text-[--text-primary] transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3 rounded-xl bg-[--color-primary] text-white font-semibold hover:bg-[--color-primary-hover] transition-all flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Tips & Get Started */}
        {step === 2 && (
          <div className="px-8 pb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-2">Pro Tips</h2>
            <p className="text-[--text-muted] text-center mb-6">
              Quick shortcuts to boost your productivity
            </p>
            <div className="space-y-3 mb-8">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[--color-primary]/10 text-[--color-primary] flex items-center justify-center">
                    {tip.icon}
                  </div>
                  <span className="text-[--text-secondary]">{tip.text}</span>
                  <Check className="w-5 h-5 text-[--color-success] ml-auto" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl text-[--text-muted] hover:text-[--text-primary] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
              >
                Start Creating
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook to check if user is new
export function useIsNewUser() {
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    setIsNewUser(!hasSeenWelcome);
  }, []);

  const resetWelcome = () => {
    localStorage.removeItem("hasSeenWelcome");
    setIsNewUser(true);
  };

  return { isNewUser, resetWelcome };
}
