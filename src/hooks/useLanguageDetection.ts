// hooks/useLanguageDetection.ts
"use client";

import { useState } from "react";


declare global {
  interface Window {
    ai: {
      languageDetector: {
        capabilities: () => Promise<{ capabilities: string }>;
        create: (options?: any) => Promise<any>;
      };
    };
  }
}

export function useLanguageDetection() {
  const [detectedLanguage, setDetectedLanguage] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");
  const [detector, setDetector] = useState<any>(null);
  const isBrowser = typeof window !== "undefined";

  const isLanguageDetectorSupported =
    isBrowser && "ai" in window && "languageDetector" in window.ai;

   


    const initializeDetector = async () => {
      try {
        // Check if the AI API is supported
        if (!isLanguageDetectorSupported) {
          throw new Error("Chrome AI API is not supported.");
        }
    
        // Check capabilities
        const languageDetectorCapabilities = await window.ai.languageDetector.capabilities();
        const canDetect = languageDetectorCapabilities.capabilities;
    
        if (canDetect === "no") {
          throw new Error("Language detection is not available.");
        }
    
        let detectorInstance;
        if (canDetect === "readily") {
          // The language detector can immediately be used
          detectorInstance = await window.ai.languageDetector.create();
        } else {
          // The language detector requires a model download
          const monitorCallback = (m: any) => {
            m.addEventListener("downloadprogress", (e: any) => {
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
          };
    
          detectorInstance = await window.ai.languageDetector.create({
            monitor: monitorCallback,
          });
          await detectorInstance.ready;
        }
    
        setDetector(detectorInstance);
      } catch (error) {
        console.error("Failed to initialize language detector:", error);
        setStatus("error");
      }
    };

    const detectLanguage = async (text: string): Promise<{ detectedLanguage: string; confidence: number }[]> => {
      if (!text.trim()) return [];
    
      setStatus("detecting");
    
      try {
        if (!detector) {
          throw new Error("Language detector is not initialized.");
        }
    
        const detectedLanguages = await detector.detectLanguage(text);
        if (detectedLanguages.length > 0) {
          setStatus("success");
          return detectedLanguages; 
        } else {
          setStatus("error");
          return []; 
        }
      } catch (error) {
        console.error("Language detection failed:", error);
        setStatus("error");
        return []; 
      }
    };

  return { detectedLanguage, status, detectLanguage, initializeDetector };
}