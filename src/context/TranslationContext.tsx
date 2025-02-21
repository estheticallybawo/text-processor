"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TranslationContextType {
  status: "loading" | "ready" | "unavailable" | "downloading" | "idle" | "translating" | "success" | "error";
  translator: any;
  translateText: (text: string, sourceLanguage: string, targetLanguage: string) => Promise<string>;
  downloadProgress: number;
  checkLanguagePairAvailability: (sourceLanguage: string, targetLanguage: string) => Promise<"readily" | "after-download" | "no">;
}

const TranslationContext = createContext<TranslationContextType>({
  status: "loading",
  translator: null,
  translateText: async () => "",
  downloadProgress: 0,
  checkLanguagePairAvailability: async () => "no",
});

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [translator, setTranslator] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "downloading" | "idle" | "translating" | "success" | "error">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const initializeTranslator = async () => {
      try {
        // Check if the API is supported
        if (!("ai" in window)) throw new Error("AI API not supported");
        if (!("translator" in (window as any).ai)) throw new Error("Translator API not supported");

        setStatus("ready");
      } catch (error) {
        console.error("Translator initialization failed:", error);
        setStatus("unavailable");
      }
    };

    initializeTranslator();
  }, []);

  const checkLanguagePairAvailability = async (sourceLanguage: string, targetLanguage: string): Promise<"readily" | "after-download" | "no"> => {
    try {
      const capabilities = await (window as any).ai.translator.capabilities();
      return capabilities.languagePairAvailable(sourceLanguage, targetLanguage);
    } catch (error) {
      console.error("Failed to check language pair availability:", error);
      return "no";
    }
  };

  const translateText = async (text: string, sourceLanguage: string, targetLanguage: string): Promise<string> => {
    if (!text.trim()) return "";

    setStatus("translating");

    try {
      // Check if the translator is already initialized for the desired language pair
      if (!translator || translator.sourceLanguage !== sourceLanguage || translator.targetLanguage !== targetLanguage) {
        const availability = await checkLanguagePairAvailability(sourceLanguage, targetLanguage);
        if (availability === "no") {
          throw new Error("Translation between the specified languages is not available.");
        }

        setStatus("downloading");

        const newTranslator = await (window as any).ai.translator.create({
          sourceLanguage,
          targetLanguage,
          monitor(m: any) {
            m.addEventListener("downloadprogress", (e: ProgressEvent) => {
              const progress = (e.loaded / e.total) * 100;
              setDownloadProgress(progress);
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes (${progress.toFixed(2)}%)`);
            });
          },
        });

        await newTranslator.ready;
        setTranslator(newTranslator);
        setStatus("ready");
      }

      const translatedText = await translator.translate(text.trim());
      setStatus("success");
      return translatedText;
    } catch (error) {
      console.error("Translation failed:", error);
      setStatus("error");
      return "Translation unavailable";
    }
  };

  return (
    <TranslationContext.Provider value={{ status, translator, translateText, downloadProgress, checkLanguagePairAvailability }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => useContext(TranslationContext);