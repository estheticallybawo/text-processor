// utils/languageMap.ts

export interface Language {
  code: string;
  name: string;
}

export const languages: Language[] = [
  { code: "en", name: "English" },
            { code: "es", name: "Spanish" },
            { code: "fr", name: "French" },
            { code: "pt", name: "Portuguese" },
            { code: "ru", name: "Russian" },
            { code: "tr", name: "Turkish" },
      ];