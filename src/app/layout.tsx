
import type { Metadata } from "next";
import "./globals.css";
import { SummarizerProvider } from "@/context/SummerizerContext";



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
        content={process.env.NEXT_PUBLIC_CHROME_API_TOKEN}
         data-origin="http://localhost:3000"
      />
      </head>
      <body>
        <SummarizerProvider>
      {children}
      </SummarizerProvider>
      </body>
    </html>
  );
}
