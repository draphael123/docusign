"use client";

import { useCallback } from "react";

type SoundType = "click" | "success" | "error" | "typing" | "save" | "complete" | "notification";

export function useSoundEffects(enabled: boolean) {
  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0.15;
      
      switch (type) {
        case "click":
          oscillator.frequency.value = 800;
          oscillator.type = "sine";
          oscillator.start();
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 50);
          break;
          
        case "typing":
          oscillator.frequency.value = 400 + Math.random() * 200;
          oscillator.type = "square";
          gainNode.gain.value = 0.05;
          oscillator.start();
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 30);
          break;
          
        case "success":
          oscillator.frequency.value = 523.25; // C5
          oscillator.type = "sine";
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 659.25; // E5
          }, 100);
          setTimeout(() => {
            oscillator.frequency.value = 783.99; // G5
          }, 200);
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 350);
          break;
          
        case "error":
          oscillator.frequency.value = 200;
          oscillator.type = "sawtooth";
          gainNode.gain.value = 0.1;
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 150;
          }, 100);
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 250);
          break;
          
        case "save":
          oscillator.frequency.value = 440;
          oscillator.type = "sine";
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 550;
          }, 80);
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 150);
          break;
          
        case "complete":
          oscillator.frequency.value = 392; // G4
          oscillator.type = "sine";
          oscillator.start();
          setTimeout(() => oscillator.frequency.value = 523.25, 100); // C5
          setTimeout(() => oscillator.frequency.value = 659.25, 200); // E5
          setTimeout(() => oscillator.frequency.value = 783.99, 300); // G5
          setTimeout(() => oscillator.frequency.value = 1046.5, 400); // C6
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 550);
          break;
          
        case "notification":
          oscillator.frequency.value = 880;
          oscillator.type = "sine";
          oscillator.start();
          setTimeout(() => {
            oscillator.frequency.value = 1174.66;
          }, 100);
          setTimeout(() => {
            oscillator.stop();
            audioContext.close();
          }, 200);
          break;
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }, [enabled]);

  return { playSound };
}

