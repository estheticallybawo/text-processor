import type { Metadata } from "next";
import "./globals.css";
import { SummarizerProvider } from "@/context/SummerizerContext";
import { DetectionProvider} from "@/context/LanguageDetectionContext";
import { TranslationProvider } from "@/context/TranslationContext";

export const metadata: Metadata = {
  title: "Texilly",
  description: "AI Text Processor is a simple web application that demonstrates the use of AI-powered text processing capabilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>

      </head>
      <body>
        
        <SummarizerProvider>
        <DetectionProvider><TranslationProvider>{children}</TranslationProvider></DetectionProvider>
        </SummarizerProvider>
        
      </body>
    </html>
  );
}