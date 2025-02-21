import type { Metadata } from "next";
import "./globals.css";
import { SummarizerProvider } from "@/context/SummerizerContext";
import { LanguageDetectionProvider } from "@/context/LanguageDetectionContext";

export const metadata: Metadata = {
  title: "AI Text Processor",
  description: "Built by Esther B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="chromemeta"
          content={process.env.NEXT_PUBLIC_SUMMARIZER_API_TOKEN || process.env.NEXT_PUBLIC_TRANSLATOR_API_TOKEN || process.env.NEXT_PUBLIC_LANGUAGE_DETECTOR_API_TOKEN}
          data-origin="https://text-processor-zeta.vercel.app/"
          http-equiv="origin-trial"
        />
      </head>
      <body>
        <SummarizerProvider>
          <LanguageDetectionProvider>{children}</LanguageDetectionProvider>
        </SummarizerProvider>
      </body>
    </html>
  );
}