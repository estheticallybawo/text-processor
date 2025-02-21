import type { Metadata } from "next";
import "./globals.css";
import { SummarizerProvider } from "@/context/SummerizerContext";
import { DetectionProvider} from "@/context/LanguageDetectionContext";

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

      </head>
      <body>
        <SummarizerProvider>
          <DetectionProvider>{children}</DetectionProvider>
        </SummarizerProvider>
      </body>
    </html>
  );
}