"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LanguageDetectionContextType {
  status: "loading" | "ready" | "unavailable" | "downloading" | "idle" | "detecting" | "success" | "error";
  detector: any;
  detectLanguage: (text: string) => Promise<{ detectedLanguage: string; confidence: number }[]>;
  downloadProgress: number;
  confidence: number;
  formatConfidence: (confidence: number) => string;
  translateText: (text: string, targetLanguage: string) => Promise<string>;
}

const LanguageDetectionContext = createContext<LanguageDetectionContextType>({
  status: "loading",
  detector: null,
  detectLanguage: async () => [],
  downloadProgress: 0,
  confidence: 0,
  formatConfidence: (confidence: number) => "",
  translateText: async () => "",
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
        const languageDetectorCapabilities = await self.ai.languageDetector.capabilities();
              const canDetect = languageDetectorCapabilities.capabilities;
              let detector;
              if (canDetect === 'no') {
                // The language detector isn't usable.
                return;
              }
              if (canDetect === 'readily') {
                // The language detector can immediately be used.
                detector = await self.ai.languageDetector.create();
                console.log("Language detector instance:", detector);
                
              } else {
                // The language detector can be used after model download.
                detector = await self.ai.languageDetector.create({
                  monitor(m: any) {
                    m.addEventListener('downloadprogress', (e: ProgressEvent) => {
                      console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
                    });
                  },
                });
                await detector.ready;
              }
              setDetector(detector);
              setStatus('ready');
            } catch (error) {
              console.error('Summarizer initialization failed:', error);
              setStatus('unavailable');
            }

    };
    initializeDetector();
  }, []);

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
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
        return detectedLanguages.map((lang: any) => ({
          detectedLanguage: lang.language,
          confidence: lang.confidence,
        }));
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

  //ranslate text to target language

  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (!text.trim()) return "";

    try {
      // Check if the API is supported
      if (!("ai" in window)) throw new Error("AI API not supported");
      if (!("translator" in (window as any).ai)) throw new Error("Translator API not supported");

      // Create a translator
      const translator = await (window as any).ai.translator.create({
        sourceLanguage: "auto",
        targetLanguage: targetLanguage,
      });

      // Translate the text
      const translatedText = await translator.translate(text.trim());
      return translatedText;
    } catch (error) {
      console.error("Translation failed:", error);
      return "Translation unavailable";
    }
  };

  return (
    <LanguageDetectionContext.Provider value={{ formatConfidence, status, detector, detectLanguage, translateText, downloadProgress, confidence: 0 }}>
      {children}
    </LanguageDetectionContext.Provider>
  );
}

export const useLanguageDetection = () => useContext(LanguageDetectionContext);
