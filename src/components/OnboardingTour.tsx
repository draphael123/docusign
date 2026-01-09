"use client";

import { useState, useEffect } from "react";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "templates-btn",
    title: "📄 Templates",
    content: "Start with a pre-built template or create your own. Templates include placeholders like [Name] that you can fill in.",
    position: "bottom",
  },
  {
    target: "document-type",
    title: "📋 Document Type",
    content: "Select the type of document you're creating. This helps organize your documents.",
    position: "bottom",
  },
  {
    target: "document-body",
    title: "✍️ Document Body",
    content: "Write your document content here. Use [brackets] for placeholders. The toolbar above has quick insert options.",
    position: "top",
  },
  {
    target: "signatory-section",
    title: "🖊️ Signatory",
    content: "Choose who will sign the document. You can select a preset signatory or enter custom details.",
    position: "top",
  },
  {
    target: "download-btn",
    title: "📥 Generate PDF",
    content: "When you're ready, click here to download your professional PDF document!",
    position: "top",
  },
  {
    target: "settings-btn",
    title: "⚙️ Settings",
    content: "Customize colors, fonts, sounds, and many more options in Settings.",
    position: "left",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("onboardingComplete", "true");
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />

      {/* Tour Card */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] shadow-2xl max-w-md w-full overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-[#2a2a3a]">
            <div 
              className="h-full bg-gradient-to-r from-[#a78bfa] to-[#4ecdc4] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#666680]">Step {currentStep + 1} of {TOUR_STEPS.length}</span>
              <button onClick={handleSkip} className="text-xs text-[#666680] hover:text-white">
                Skip tour
              </button>
            </div>

            <h3 className="text-xl text-white font-semibold mb-3">{step.title}</h3>
            <p className="text-[#a0a0a0] mb-6">{step.content}</p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-lg text-sm text-[#a0a0a0] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentStep ? "bg-[#a78bfa]" : i < currentStep ? "bg-[#4ecdc4]" : "bg-[#2a2a3a]"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-[#a78bfa] to-[#4ecdc4] text-white hover:opacity-90 transition-opacity"
              >
                {currentStep === TOUR_STEPS.length - 1 ? "Get Started" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function useOnboarding() {
  const [showTour, setShowTour] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    
    // Only show tour on very first visit ever
    if (!hasVisited) {
      // Mark as visited immediately so tour won't show on refresh
      localStorage.setItem("hasVisitedBefore", "true");
      // Show tour once
      setTimeout(() => setShowTour(true), 1000);
    }
  }, []);

  const resetTour = () => {
    localStorage.removeItem("hasVisitedBefore");
    localStorage.removeItem("onboardingComplete");
    setShowTour(true);
  };

  return { showTour, setShowTour, resetTour, mounted };
}

