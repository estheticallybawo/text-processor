"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LanguageDetectionContextType {
  status: "loading" | "ready" | "unavailable" | "downloading" | "idle" | "detecting" | "success" | "error";
  detector: any;
  detectLanguage: (text: string) => Promise<{ detectedLanguage: string; confidence: number }[]>;
  downloadProgress: number;
}

const LanguageDetectionContext = createContext<LanguageDetectionContextType>({
  status: "loading",
  detector: null,
  detectLanguage: async () => [],
  downloadProgress: 0,
});

export function LanguageDetectionProvider({ children }: { children: ReactNode }) {
  const [detector, setDetector] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "downloading" | "idle" | "detecting" | "success" | "error">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const initializeDetector = async () => {
      try {
        // Check if the API is supported
        if (!("ai" in window)) throw new Error("AI API not supported");
        if (!("languageDetector" in (window as any).ai)) throw new Error("Language Detection API not supported");

        // Check capabilities
        const capabilities = await (window as any).ai.languageDetector.capabilities();
        if (capabilities.available === "no") {
          setStatus("unavailable");
          return;
        }

        // Create detector instance
        const instance = await (window as any).ai.languageDetector.create();

        // Handle model download
        if (capabilities.available === "after-download") {
          setStatus("downloading");
          instance.addEventListener("downloadprogress", (event: any) => {
            const progress = (event.loaded / event.total) * 100;
            setDownloadProgress(progress); // Update progress
            console.log(`Downloaded ${event.loaded} of ${event.total} bytes (${progress.toFixed(2)}%)`);
          });
          await instance.ready;
        }

        setDetector(instance);
        setStatus("ready");
      } catch (error) {
        console.error("Language Detector initialization failed:", error);
        setStatus("unavailable");
      }
    };

    initializeDetector();
  }, []);

  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 3000); // Reset after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [status]);

  const detectLanguage = async (text: string): Promise<{ detectedLanguage: string; confidence: number }[]> => {
    if (!detector || status !== "ready") throw new Error("Language Detector not ready");
    return await detector.detectLanguage(text);
  };

  return (
    <LanguageDetectionContext.Provider value={{ status, detector, detectLanguage, downloadProgress }}>
      {children}
    </LanguageDetectionContext.Provider>
  );
}

export const useLanguageDetection = () => useContext(LanguageDetectionContext);