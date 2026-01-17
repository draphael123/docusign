"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone, Monitor, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      setIsInstalled(isStandalone);

      // Check if previously dismissed
      const wasDismissed = localStorage.getItem("pwaPromptDismissed");
      if (wasDismissed) {
        const dismissedDate = new Date(wasDismissed);
        const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
          setDismissed(true);
        }
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay
      setTimeout(() => {
        if (!dismissed) setShowPrompt(true);
      }, 3000);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwaPromptDismissed", new Date().toISOString());
  };

  if (!showPrompt || isInstalled || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden z-50 animate-slide-up">
      {/* Gradient accent */}
      <div className="h-1 bg-gradient-to-r from-[--color-primary] to-[--color-accent]" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--color-primary] to-[--color-accent] flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">Install DocGen</h3>
            <p className="text-sm text-[--text-muted] mb-3">
              Add to your home screen for quick access and offline support.
            </p>

            <div className="flex items-center gap-2 text-xs text-[--text-muted] mb-4">
              <div className="flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 py-2.5 rounded-xl bg-[--color-primary] text-white font-medium hover:bg-[--color-primary-hover] transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-xl bg-[--bg-elevated] border border-[--border-default] font-medium hover:bg-[--bg-overlay] transition-colors"
              >
                Later
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-[--bg-elevated] transition-colors"
          >
            <X className="w-4 h-4 text-[--text-muted]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for service worker registration
export function useServiceWorker() {
  const [isReady, setIsReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
          setIsReady(true);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  const update = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        registration?.update();
        window.location.reload();
      });
    }
  };

  return { isReady, updateAvailable, update };
}

