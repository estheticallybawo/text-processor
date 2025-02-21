"use client"
import { createContext, useState, useEffect, useContext, ReactNode } from "react";

interface LanguageDetectionContextType {
 status: "loading" | "ready" | "unavailable" | "downloading" | "idle" | "detecting" | "success" | "error";
  detector: any;
  detectLanguage: (text: string) => Promise<{ detectedLanguage: string; confidence: number }[]>;
  downloadProgress: number;
  confidence: number;
  translateText: (text: string, targetLanguage: string) => Promise<string>;
}

const LanguageDetectionContext = createContext<LanguageDetectionContextType>({
status: "loading",
 detector: null,
 detectLanguage: async () => [],
 downloadProgress: 0,
  confidence: 0,
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
                if (typeof instance.detectLanguage !== "function") {
                  throw new Error("Language detector does not have a detectLanguage method.");
                }
                setStatus("ready");
              } catch (error) {
                console.error("Language Detector initialization failed:", error);
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
    <LanguageDetectionContext.Provider value={{ status, detector, detectLanguage, downloadProgress, translateText, confidence: 0  }}>
      {children}
    </LanguageDetectionContext.Provider>
  );
}

export const useLanguageDetection = () => useContext(LanguageDetectionContext);