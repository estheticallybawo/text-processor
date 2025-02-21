"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LanguageContextType {
  status: "loading" | "ready" | "unavailable" | "downloading" | "idle" | "detecting" | "success" | "error";
  detector: any;
  detectLanguage: (text: string) => Promise<{ detectedLanguage: string; confidence: number }[]>;
  downloadProgress: number;
  confidence: number;
  formatConfidence: (confidence: number) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  status: "loading",
  detector: null,
  detectLanguage: async () => [],
  downloadProgress: 0,
  confidence: 0,
  formatConfidence: (confidence: number) => "",
});

export function DetectionProvider({ children }: { children: ReactNode }) {
  const [detector, setDetector] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "downloading" | "idle" | "detecting" | "success" | "error">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const initializeDetector = async () => {
      try {
        if (!("ai" in window)) throw new Error("AI API not supported");
        if (!("languageDetector" in (window as any).ai)) throw new Error("Language Detection API not supported");

        const capabilities = await (window as any).ai.languageDetector.capabilities();
        if (capabilities.capabilities === "no") {
          setStatus("unavailable");
          return;
        }

        let detectorInstance;
        if (capabilities.capabilities === "readily") {
          detectorInstance = await (window as any).ai.languageDetector.create();
        } else {
          setStatus("downloading");
          detectorInstance = await (window as any).ai.languageDetector.create({
            monitor(m: any) {
              m.addEventListener("downloadprogress", (e: ProgressEvent) => {
                const progress = (e.loaded / e.total) * 100;
                setDownloadProgress(progress);
              });
            },
          });
          await detectorInstance.ready;
        }

        setDetector(detectorInstance);
        setStatus("ready");
      } catch (error) {
        console.error("Language detector initialization failed:", error);
        setStatus("unavailable");
      }
    };

    initializeDetector();
  }, []);

  const detectLanguage = async (text: string): Promise<{ detectedLanguage: string; confidence: number }[]> => {
    if (!text.trim()) return [];

    setStatus("detecting");

    try {
      if (!detector) {
        throw new Error("Language detector is not initialized.");
      }

      // Use the detect() function to get the list of detected languages
      const results = await detector.detect(text);

      // Map the results to the expected format
      const detectedLanguages = results.map((result: any) => ({
        detectedLanguage: result.detectedLanguage,
        confidence: result.confidence,
      }));

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

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <LanguageContext.Provider value={{ status, detector, detectLanguage, downloadProgress, confidence: 0, formatConfidence }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguageDetection = () => useContext(LanguageContext);