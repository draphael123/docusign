"use client";

import { useState, useEffect, useCallback } from "react";

interface PomodoroTimerProps {
  minutes: number;
  isEnabled: boolean;
  onComplete: () => void;
  soundEnabled: boolean;
}

export default function PomodoroTimer({ minutes, isEnabled, onComplete, soundEnabled }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const playSound = useCallback((type: "complete" | "start" | "tick") => {
    if (!soundEnabled) return;
    
    // Create audio context for simple beeps
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === "complete") {
      oscillator.frequency.value = 880; // A5 note
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 1046.5; // C6 note
      }, 150);
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 300);
    } else if (type === "start") {
      oscillator.frequency.value = 523.25; // C5 note
      gainNode.gain.value = 0.2;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 100);
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      setIsRunning(false);
      setTimeLeft(minutes * 60);
      return;
    }
  }, [isEnabled, minutes]);

  useEffect(() => {
    if (!isRunning || !isEnabled) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playSound("complete");
          if (isBreak) {
            setIsBreak(false);
            setIsRunning(false);
            onComplete();
            return minutes * 60;
          } else {
            // Start 5 min break
            setIsBreak(true);
            return 5 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isEnabled, isBreak, minutes, onComplete, playSound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = isBreak 
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((minutes * 60 - timeLeft) / (minutes * 60)) * 100;

  const handleStart = () => {
    playSound("start");
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(minutes * 60);
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={`p-4 rounded-xl backdrop-blur-md border shadow-lg ${
        isBreak 
          ? "bg-[#4ecdc4]/20 border-[#4ecdc4]/30 shadow-[#4ecdc4]/20" 
          : "bg-[#f87171]/20 border-[#f87171]/30 shadow-[#f87171]/20"
      }`}>
        <div className="flex items-center gap-3">
          {/* Progress Ring */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="fill-none stroke-[#2a2a3a]"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className={`fill-none ${isBreak ? "stroke-[#4ecdc4]" : "stroke-[#f87171]"}`}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 0.5s" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-1">
            <span className={`text-xs font-medium ${isBreak ? "text-[#4ecdc4]" : "text-[#f87171]"}`}>
              {isBreak ? "☕ Break Time" : "🍅 Focus"}
            </span>
            <div className="flex gap-1">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className={`px-2 py-1 rounded text-xs text-white transition-colors ${
                    isBreak ? "bg-[#4ecdc4] hover:bg-[#3dbdb5]" : "bg-[#f87171] hover:bg-[#ef4444]"
                  }`}
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-2 py-1 rounded text-xs bg-[#3a3a4a] text-white hover:bg-[#4a4a5a] transition-colors"
                >
                  Pause
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-2 py-1 rounded text-xs bg-[#2a2a3a] text-[#a0a0a0] hover:bg-[#3a3a4a] transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

